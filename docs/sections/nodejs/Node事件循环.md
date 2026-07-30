# Node.js 事件循环

> 本文讲的是 `libuv` / `Node` **运行时层面**的实现 —— 循环的真实执行顺序、定时器怎么被摘出来、微任务什么时候清。  
> 语言规范层面的概念（事件循环伪代码、`ES6` 的 `job queue`）见 [Js - 事件循环](../js/js-事件循环.md)。

下文所有结论都是对着 `Node.js` 仓库里 vendored 的 `libuv`、`V8` 和 `lib/` 源码核对过的，附了文件名和行号。行号对应 `Node v20` 附近的版本，不同版本可能有偏移，但结构是一致的。

## 一、libuv 的 uv_run：真实的执行顺序

事件循环的本体是 `uv_run`（`deps/uv/src/unix/core.c:415-480`）。网上流传的流程描述大多有个共同错误：**把 `timers` 放在 `while` 循环体的开头**。实际不是 —— 直接看完整代码（只删掉了部分注释）：

```c
int uv_run(uv_loop_t* loop, uv_run_mode mode) {
  int timeout;
  int r;
  int can_sleep;

  r = uv__loop_alive(loop);
  if (!r)
    uv__update_time(loop);

  /* Maintain backwards compatibility by processing timers before entering the
   * while loop for UV_RUN_DEFAULT. Otherwise timers only need to be executed
   * once, which should be done after polling in order to maintain proper
   * execution order of the conceptual event loop. */
  if (mode == UV_RUN_DEFAULT && r != 0 && loop->stop_flag == 0) {
    uv__update_time(loop);
    uv__run_timers(loop);                 // ← ① 循环外先补跑一次 timers
  }

  while (r != 0 && loop->stop_flag == 0) {
    can_sleep =
        uv__queue_empty(&loop->pending_queue) &&
        uv__queue_empty(&loop->idle_handles);

    uv__run_pending(loop);                // ← Pending：上一轮 I/O 没处理完的回调
    uv__run_idle(loop);                   // ← Idle
    uv__run_prepare(loop);                // ← Prepare

    timeout = 0;
    if ((mode == UV_RUN_ONCE && can_sleep) || mode == UV_RUN_DEFAULT)
      timeout = uv__backend_timeout(loop); // ← 算出 poll 的阻塞上限

    uv__metrics_inc_loop_count(loop);

    uv__io_poll(loop, timeout);           // ← Poll：epoll / kqueue，I/O 回调在这里跑

    /* Process immediate callbacks (e.g. write_cb) a small fixed number of
     * times to avoid loop starvation.*/
    for (r = 0; r < 8 && !uv__queue_empty(&loop->pending_queue); r++)
      uv__run_pending(loop);              // ← ② 再清一次 pending，最多 8 次

    uv__metrics_update_idle_time(loop);   // ← ③ 图里没有这步

    uv__run_check(loop);                  // ← Check：setImmediate
    uv__run_closing_handles(loop);        // ← Close

    uv__update_time(loop);
    uv__run_timers(loop);                 // ← Timers：在循环体的最后！

    r = uv__loop_alive(loop);             // ← ④ alive 检查在 timers 之后
    if (mode == UV_RUN_ONCE || mode == UV_RUN_NOWAIT)
      break;                              // ← 这两种模式只跑一轮
  }

  if (loop->stop_flag != 0)
    loop->stop_flag = 0;                  // ← 重置，便于下次再启动

  return r;
}
```

三个容易被漏掉的点：

**① 循环外那次预跑（`core.c:424-431`）** —— 注释说得很直白：定时器**只需要执行一次**，而且应该放在 `polling` **之后**；循环外这一次纯粹是为了向后兼容。它的作用见下一节。

**② `poll` 之后再清一次 `pending`（`core.c:452-453`）** —— `I/O` 轮询返回后会再清 `pending` 队列，最多 `8` 次，防止某个不断产生 `pending` 的 `handle` 把整个循环饿死。注意这里复用了变量 `r` 做计数，所以循环结束后必须靠 `core.c:468` 重新赋值。

**③ `core.c:465-466` 的 `uv__update_time` + `uv__run_timers` 是每轮迭代都执行的**，不是 `UV_RUN_ONCE` 独有的特殊处理。`UV_RUN_ONCE` 的特殊之处只有最后那个 `break`。

### 为什么循环外要补跑一次：1.45 版本的重构

① 那段预跑代码不是一直都有的，是 `libuv 1.45.0` 重构时加进来的（Node 侧对应提交 `9e68f9413e`）。对比新旧两版能看出这行代码到底在补什么。

**旧版（1.44 及以前）**，`timers` 在循环体**开头**，`UV_RUN_ONCE` 还额外在**结尾**特判一次：

```c
while (r != 0 && loop->stop_flag == 0) {
  uv__update_time(loop);
  uv__run_timers(loop);        // ← 开头，所有模式都跑
  ...
  uv__io_poll(loop, timeout);
  ...
  uv__run_check(loop);
  uv__run_closing_handles(loop);

  if (mode == UV_RUN_ONCE) {   // ← 结尾，仅 UV_RUN_ONCE 特判
    uv__update_time(loop);
    uv__run_timers(loop);
  }
  ...
}
```

**新版（1.45+，即当前代码）**，`timers` 统一挪到结尾，循环外补一次预跑：

```c
if (mode == UV_RUN_DEFAULT && ...) {
  uv__run_timers(loop);        // ← 循环外，仅 UV_RUN_DEFAULT
}
while (...) {
  ...
  uv__run_timers(loop);        // ← 结尾，所有模式统一走这一处
  ...
}
```

**为什么要挪？** 因为 `uv__io_poll` 是会睡觉的，阻塞时长由 `uv__next_timeout`（`timer.c:144-162`）算出来，正好是「距最近的定时器还有多久」。也就是说 `poll` 醒来的那一刻，往往就是**因为定时器到期了**。旧版里 poll 醒来后还要走完 `check → close`、绕回环顶才能跑 `timers`；新版把 `timers` 紧跟在 `close` 后面，逻辑上「睡够了就去处理到期的事」更顺，还顺带去掉了 `UV_RUN_ONCE` 那个重复的特判块。

**但光挪位置会改变第一轮的行为。** 设想这段代码：

```c
uv_timer_start(&timer, cb, 0, 0);   // 0ms，立即到期
uv_run(loop, UV_RUN_DEFAULT);
```

| 版本 | 第一轮先跑什么 |
|---|---|
| 旧版 | 进 `while` → `timers` 立刻执行 `cb` → 再 `poll` |
| 新版（假设没有预跑） | 进 `while` → 先 `poll` → ... → 最后才轮到 `cb` |

`poll` 虽然会因为 `timeout = 0` 立即返回、不会真的卡住，但**先跑 I/O 还是先跑 timer 这个顺序变了** —— 对依赖这个顺序的代码就是破坏性变更。于是加上循环外那次预跑，把第一轮的 `timers` 补回原位，让新版在可观察的执行顺序上和旧版完全一致。这正是注释里 "**M**aintain **b**ackwards **c**ompatibility" 的字面意思：不是为了新功能，纯粹是为了不打破已有行为。

三个限定条件也都能对应解释：
* **只在 `UV_RUN_DEFAULT` 触发** —— `UV_RUN_ONCE` / `UV_RUN_NOWAIT` 只跑一轮就 `break`，它们的 `timers` 本来就该在循环体末尾（对应旧版结尾那个特判块），加预跑反而会让它们一次 `uv_run` 跑两遍 `timers`
* **`r != 0`** —— 循环压根不会进（`loop` 已死）时，预跑也不该发生
* **`loop->stop_flag == 0`** —— 和 `while` 的条件保持一致，避免循环没跑、定时器却先执行了

**这也解释了官方流程图为什么至今没改。** `1.45` 之前，代码顺序和官方图的切点是一致的（`timers` 都在前）；`1.45` 只是把物理书写顺序挪到了后面，靠这次预跑维持住原来的可观察顺序，所以图不需要跟着改 —— 上一节说的「切点不同、环相同」，根源就在这次重构。

### 概念顺序 ≠ 物理顺序

`libuv` 官方文档给的流程图是这样的（从上往下，最后回到顶部）：

```
                  ┌─→  Update loop time
                  │         ↓
                  │    loop alive?  ──No─→  End
                  │         ↓ Yes
                  │    Run due timers
                  │    Call pending callbacks
                  │    Run idle handles
                  │    Run prepare handles
                  │    Poll for I/O
                  │    Run check handles
                  │    Call close callbacks
                  └─────────┘
```

而上面代码里的物理顺序是 `pending → idle → prepare → poll → check → close → update_time → timers`。

**这两个不冲突 —— 是同一个环，切点不同。** 把环画出来就一目了然：

```
        ┌──────────────────────────────────────────┐
        │                                          │
        ▼                                          │
   update loop time                                │
        │                                          │
        ▼                                          │
      timers            ←── 官方图的切点在这条边上面   │
        │                                          │
        ▼                                          │
     pending            ←── 代码的切点在这条边上面     │
        │                                          │
        ▼                                          │
      idle                                         │
        ▼                                          │
    prepare                                        │
        ▼                                          │
   poll for I/O                                    │
        ▼                                          │
   [pending ×8]         ←── 官方图省略               │
   [metrics]            ←── 官方图省略               │
        ▼                                          │
     check                                         │
        ▼                                          │
     close ────────────────────────────────────────┘
```

顺着环走一圈，两个序列完全重合 —— 环上的边一条没变，只是「从哪里算一轮的开始」不同。第 `N` 轮迭代末尾跑的 `timers`，概念上属于第 `N+1` 个 `tick` 的开头。

**为什么能这样等价？靠的就是循环外那次预跑。** 单纯把循环体旋转一下，第一轮的行为会不一样：官方图是「先跑 timers 再 poll」，而代码的 `while` 第一次执行时是「先 poll，最后才 timers」。前面 ① 那句 `uv__run_timers(loop)` 正好把这个差补上 —— 这也是注释里 "maintain backwards compatibility" 的真实含义。

除了切点，官方图还省略/简化了三处（都不算冲突，但值得知道）：

| 项 | 官方图 | 实际代码 |
|---|---|---|
| `poll` 之后再清 `pending` | 无 | `core.c:452-453`，最多 8 次，防饥饿 |
| `metrics` 更新 | 无 | `core.c:460` `uv__metrics_update_idle_time` |
| `loop alive?` 的位置 | `update_time` **之后**、`timers` **之前** | `core.c:468`，在 `timers` **之后** |

最后一条稍微解释下：图里是 `update_time → alive? → timers`，代码是 `update_time → timers → alive?`。行为上没差别 —— 有到期定时器时，那个 timer handle 本身就让 `uv__has_active_handles` 为真，两种顺序都判定为 alive、都会跑这个 timer。区别只是代码能在跑完后当场发现循环已死并退出，图则要多绕到环顶再判一次。

**什么时候必须用物理顺序思考？** 只有判断「同一次迭代里 `check` 和 `timers` 谁先」的时候 —— 比如第五章 `setImmediate` vs `setTimeout(0)` 那道题。其余场合官方图那个相对先后是够用的。

## 二、uv__run_timers 的两阶段

`uv__run_timers`（`deps/uv/src/timer.c:165-195`）是**两阶段**设计：

```c
void uv__run_timers(uv_loop_t* loop) {
  // 第一阶段：把所有已过期的 timer 从小根堆摘进 ready_queue
  for (;;) {
    heap_node = heap_min(timer_heap(loop));
    if (heap_node == NULL) break;
    handle = container_of(heap_node, uv_timer_t, node.heap);
    if (handle->timeout > loop->time) break;   // 没过期，停止收集
    uv_timer_stop(handle);
    uv__queue_insert_tail(&ready_queue, &handle->node.queue);
  }

  // 第二阶段：依次执行 ready_queue 里所有回调
  while (!uv__queue_empty(&ready_queue)) {
    ...
    uv_timer_again(handle);     // repeat timer 重新入堆
    handle->timer_cb(handle);
  }
}
```

**先全部收集，再全部执行。** 所以这个函数返回时，所有到期定时器的回调都已经跑完了，中间不会穿插别的阶段。

第一阶段依赖小根堆的排序规则（`timer.c:38-55`）：

```c
static int timer_less_than(const struct heap_node* ha, const struct heap_node* hb) {
  if (a->timeout < b->timeout) return 1;
  if (b->timeout < a->timeout) return 0;
  /* Compare start_id when both have the same timeout. */
  return a->start_id < b->start_id;
}
```

**先比到期时间，相同则比 `start_id`** —— `start_id` 是注册时自增的序号。这就决定了同一个同步 `tick` 里注册的多个 `setTimeout(fn, 0)`，严格按注册顺序执行。

至于 `poll` 该阻塞多久，由 `uv__next_timeout`（`timer.c:144-162`）算：取堆顶那个最近的定时器，返回它距现在的毫秒数；堆空则返回 `-1`（无限阻塞）。这样保证 `poll` 不会睡过头错过定时器。

## 三、Node 层的三个队列

| 队列 | 归谁管 | 什么时候清 |
|---|---|---|
| **宏任务**（timer / check / I/O 回调） | `libuv` | 分散在循环的各个阶段 |
| **微任务**（`Promise.then`、`await` 恢复） | `V8` | 每次 JS 栈清空时，**清到空为止** |
| **nextTick**（`process.nextTick`） | `Node` 特有 | 同上，且**优先级高于微任务** |

关键在于：**微任务和 `nextTick` 不属于 `libuv` 的任何一个阶段**。它们不在上面那张环图里，而是在「每次 JS 把控制权交回 C++ 时」被清空。

清空逻辑在 `lib/internal/process/task_queues.js:67-96`：

```javascript
function processTicksAndRejections() {
  let tock;
  do {
    while ((tock = queue.shift()) !== null) {
      // ...执行 nextTick 回调
    }
    runMicrotasks();
  } while (!queue.isEmpty() || processPromiseRejections());
}
```

先把 `nextTick` 队列抽干，再 `runMicrotasks()`；只要任一队列非空就继续转。而 `runMicrotasks()` 进到 `V8` 的 `MicrotaskQueue::RunMicrotasks`（`deps/v8/src/execution/microtask-queue.cc:150`），内部同样是取到队列为空为止。

### 微任务是穷尽式清空

这一点很容易误解。看这段：

```javascript
Promise.resolve()
  .then(function () { console.log(3); })
  .then(function () { console.log(4); });
```

同步代码结束那一刻，微任务队列里**只有第一个回调**。第二个 `.then` 挂在前一个返回的 `promise` 上，那个 `promise` 还是 `pending`，所以还没入队。

但因为清空是个**循环**而不是一次快照，第一个回调执行完、`promise` 落定、第二个回调入队后，`do...while` 发现队列非空，会**接着清**。所以 `3` 和 `4` 在同一次清空里跑完，都在进入 `libuv` 之前。

反过来说，这也意味着微任务能饿死事件循环：

```javascript
function loop() { Promise.resolve().then(loop); }
loop();
setTimeout(() => console.log('我永远不会执行'), 0);
```

这段代码会卡死，定时器永远不触发 —— 微任务队列永远不空，`runMicrotasks()` 出不来，控制权回不到 `libuv`。如果微任务真的「一轮只清一批」，这个定时器迟早会执行；事实是不会，正好反证了穷尽式清空。

## 四、runNextTicks 的时机

`runNextTicks` 本体在 `lib/internal/process/task_queues.js:57-65`。它的触发分两类：

### 隐式：每次 JS 回到 C++ 时

不需要主动调用。每当 JS 执行栈清空、控制权准备交回 C++，`V8` 的 `MicrotasksScope` 析构就会触发一次清空。这些时刻包括：

* 主模块脚本执行完毕
* 每个宏任务回调执行完毕（timer 回调、I/O 回调、check 回调）
* 每个用户回调执行完毕（`EventEmitter` handler、stream 回调等）

这是兜底机制，所以你在 JS 层搜不到「每个回调后都插一句 `runNextTicks()`」。

### 显式：JS 层主动调用

搜 `runNextTicks()` 能找到三处，都在 `lib/internal/timers.js`（`449` / `511` / `540`）。最重要的是 `540` 这处，在 `listOnTimeout` 里（`timers.js:519-545`）：

```javascript
function listOnTimeout(list, now) {
  const msecs = list.msecs;
  let ranAtLeastOneTimer = false;
  let timer;
  while ((timer = L.peek(list)) != null) {
    const diff = now - timer._idleStart;

    // Check if this loop iteration is too early for the next timer.
    if (diff < msecs) {
      list.expiry = MathMax(timer._idleStart + msecs, now + 1);
      // ...
      return;
    }

    if (ranAtLeastOneTimer)
      runNextTicks();          // ← 每跑完一个 timer 就清一次微任务
    else
      ranAtLeastOneTimer = true;

    // ...执行 timer 回调
  }
}
```

**为什么这里要显式加？** 因为 `listOnTimeout` 是个 `while` 循环，会一口气跑完同一链表上的多个定时器。如果只靠隐式机制，从第一个回调返回时清一轮，`while` 继续取下一个，整个循环期间就再也没有隐式检查点了 —— 微任务会被堵到整个 timer 阶段结束才清。

**这三行正是 Node 11 的行为变更点。** Node 10 及以前没有它，所以同一阶段内的多个定时器会连着跑完，微任务攒到最后统一清。后面例 2 和例 4 就卡在这个差异上。

`timers.js:449` 是补充：链表最后一个 timer 跑完后，没有「下一个 timer」来触发上面那条路径，所以单独调一次。

### 顺带一个结论：回调里新建的同时长定时器不会在本轮跑

注意 `timers.js:531-537` 那个提前 `return`：`now` 是**进入本阶段时就固定的快照**。如果在 timer 回调里又 `setTimeout(fn, 0)`，新定时器的 `_idleStart` 比 `now` 还新，算出来 `diff ≤ 0 < msecs`，直接 `return` —— 留到下一轮。

## 五、setTimeout(0) vs setImmediate

先说结论：

| 调用位置 | 谁先 | 确定性 |
|---|---|---|
| 主模块顶层 | 不一定 | 随机 |
| I/O 回调内部 | `setImmediate` | 100% 确定 |

### I/O 回调内：setImmediate 必先

```javascript
require('fs').readFile(__filename, () => {
  setTimeout(() => console.log('timeout'), 0);
  setImmediate(() => console.log('immediate'));
});
// 永远输出：immediate → timeout
```

`fs` 回调是在 `poll` 阶段（`core.c:448`）跑的。回调返回后，同一次迭代继续往下：`check`（`core.c:462`）排在 `timers`（`core.c:466`）**前面**，中间没有任何分支能改变这个顺序。

何况 `setTimeout(0)` 会被钳制成 `1ms`（`lib/internal/timers.js:167-174`）：

```javascript
if (!(after >= 1 && after <= TIMEOUT_MAX)) {
  // ...
  after = 1; // Schedule on next tick, follows browser behavior
}
```

走到 `core.c:466` 时通常还没到期，还得再等一轮，领先幅度只会更大。

#### 容易踩的坑：把"注册时机"和"下一轮迭代"搞混

一个常见的误解是：`setTimeout`/`setImmediate` 是在 `fs` 回调**执行期间**注册的，所以应该被当成"新任务"，要等到**下一次完整的循环迭代**才会跑。

这不对。`libuv` 的一次迭代不是"队列快照，处理完就结束，新加的东西留到下一次"，而是**一条固定顺序的物理流水线**：`... → poll → check → close → timers → ...`。`poll` 只是流水线上的一站，`check`、`timers` 是**同一次迭代里、紧跟在后面的站**，不是"下一次迭代"。`fs` 回调返回后，指令指针接着往下走完这次迭代剩下的部分——`check` 和 `timers` 本来就在这次迭代该执行的范围内，没有任何分支会让它们跳过本轮。

真正需要等下一轮的，是往**已经走过的**工位塞东西——比如在 `check` 回调里再注册一个新的 `setImmediate`：

```javascript
setImmediate(() => {
  console.log('immediate A (第一个)');
  setImmediate(() => {
    console.log('immediate B (A 内部注册的)');
  });
});
setImmediate(() => {
  console.log('immediate C (与 A 同批注册)');
});
```

```
immediate A (第一个)
immediate C (与 A 同批注册)
immediate B (A 内部注册的)     ← 真的等到了下一轮
```

`A`、`C` 在 `check` 阶段**开始之前**就注册好了，同一轮全跑完；`B` 是在 `check` **正在执行**的时候才注册的，真的被推迟到下一次迭代。机制在 `lib/internal/timers.js:433-441` 的 `processImmediate`：函数一开始就把 `immediateQueue` 清空、转存成本地快照（`queue.head = queue.tail = null`），期间新增的项目进的是**下一次**才会读取的新队列。

对比最初那个 `fs` 回调的例子：`setTimeout`/`setImmediate` 是在 `poll` 阶段注册的，`poll` 排在 `check`、`timers` **前面**，落在"还没走到"的范围内，所以同一轮就能跑完——跟这里 `B` 的情况本质不同。

#### 顺序是结构性的，不是靠谁先到期

`check` 阶段没有任何时间判断——`uv__run_check` 就是遍历 `check_handles` 队列，把当前已经在队列里的全部执行一遍（`loop-watcher.c` 的 `UV_LOOP_WATCHER_DEFINE` 宏）。而 `timers` 阶段是有条件的：只有 `loop->time` 真的推进到 `handle->timeout`（`timer.c:179`），这个定时器才会被摘出来执行。

实测一下两者相对 `poll` 回调的延迟：

```
fs callback(poll) at +650.0us
immediate         at +3530.3us  (距poll回调 2880.3us)
timeout           at +4932.8us  (距poll回调 4282.8us)
```

关键在这：跑到 `check` 阶段时（`+3530us`），距 `setTimeout` 注册已经过去了近 `2.9ms`——早就超过 `1ms` 钳制阈值，这个定时器**此刻已经"成熟"、可以执行了**。但它依然没能抢在 `immediate` 前面，因为它想被执行，必须**物理走到** `core.c:466` 那一行，而这一行在 `core.c:462` 的 `check` **之后**。

`immediate` 领先 `timeout`，不是"谁先准备好"的时间竞速，而是纯粹的**代码位置**——`check` 写在 `timers` 前面这件事在源码里是死的，跟定时器有没有到期无关，哪怕定时器提前十倍成熟，也翻不过 `check` 这一行去。

### 主模块顶层：随机

```javascript
setTimeout(() => console.log('timeout'), 0);
setImmediate(() => console.log('immediate'));
// 多跑几次，顺序会变
```

关键在循环外那次预跑（`core.c:428-431`）。定时器的到期时间是「注册时的 `loop->time` + 1ms」，而 `uv__update_time` 把 `loop->time` 刷成真实的现在：

* **主模块执行 + 启动开销 ≥ 1ms** → 定时器已过期，被循环外这次 `uv__run_timers` 捞走 → **timeout 先**
* **< 1ms** → 没过期，进 `while` 后走到 `check` 阶段 → **immediate 先**

这 `1ms` 取决于进程启动速度和当时的 CPU 负载，所以不稳定。

补充一个细节：`setImmediate` 队列非空时，Node 会启动一个 idle handle（`src/env.cc:1483-1485`），而 `uv__backend_timeout` 里有一条判断（`core.c:394`）：

```c
uv__queue_empty(&loop->idle_handles) &&
```

idle 队列非空就直接返回 `0` —— 保证 `poll` 阶段不阻塞，`immediate` 能在同一轮的 `check` 里立刻跑掉。相关 handle 的初始化在 `src/env.cc:1046-1051`。

## 六、async/await 的本质

一句话规则：

> **async 函数从头同步跑到第一个 `await`，然后就地 return；`await` 之后的所有代码变成微任务。**

### await 会让函数当场 return

最常见的误解是把 `await` 想成「停在这里等」。实际上它做的是：把函数剩余部分打包成微任务挂出去，然后**自己立刻返回**，栈帧销毁，控制权交还调用方。

```javascript
async function async1() {
  console.log("async1 start");
  await async2();
  console.log("async1 end");
}
```

约等于：

```javascript
function async1() {
  console.log("async1 start");        // ← 第 1 段，同步执行
  const p = async2();                 // ← 求值右边，async2 同步跑完
  Promise.resolve(p).then(() => {     // ← 第 2 段，注册成微任务
    console.log("async1 end");
  });
  return somePromise;                 // ← 函数在这里就结束了
}
```

调用栈逐帧：

```
[主模块] async1()  ←── 压栈
    ├─ [async1] console.log("async1 start")   → 输出
    ├─ [async1] async2()  ←── 压栈
    │      ├─ [async2] console.log("async2")  → 输出
    │      └─ [async2] return ──→ 出栈，返回 Promise{fulfilled}
    └─ [async1] await
           ├─ 把「console.log("async1 end")」挂成 .then 回调 → 进微任务队列
           └─ return ──→ 出栈  ★
[主模块] ←── 控制权回来，继续下一行
```

★ 就是关键：`async1` 的栈帧在这里销毁，主模块恢复执行。

### await 右边的表达式是同步求值的

`await async2();` 分两步：

```
第 1 步：求值 async2()      ← 普通函数调用，同步压栈、执行、出栈
第 2 步：await 那个返回值    ← 注册 .then，交出控制权
```

变成微任务的是 `await` **后面**的代码，不是右边的表达式。换个写法对比就清楚了：

```javascript
async function f() {
  await 42;                  // 右边是字面量，显然跟"微任务"无关
  console.log("after");      // 但它照样变微任务
}
```

另外，加了 `async` 不代表函数体变异步。`async2` 体内全是同步代码，没有 `await`，所以一路同步跑完 —— 等价于普通函数外面套了层 `Promise.resolve()`。

### 已 resolved 也要走微任务队列

「`async2` 都已经 `resolved` 了，为什么不直接接着跑？」

因为 `Promise` 规范强制 `.then` 回调必须异步执行，哪怕 `promise` 早就落定：

```javascript
console.log(1);
Promise.resolve().then(() => console.log(2));   // 已经是 resolved
console.log(3);
// 输出：1, 3, 2      ← 不是 1, 2, 3
```

这条规则叫 **"don't release Zalgo"** —— 如果 `.then` 有时同步有时异步，执行顺序就不可预测了。`await` 底层就是 `.then`，自然继承这个约束。

## 七、例题集

以下 4 道题的输出均在 `Node v20.19.4` 上实测过。

### 例 1：宏任务与微任务的基本分层

```javascript
console.log(1);

setTimeout(function () {
  console.log(2);
}, 0);

Promise.resolve()
  .then(function () {
    console.log(3);
  })
  .then(function () {
    console.log(4);
  });
```

**输出：`1` → `3` → `4` → `2`**

| 阶段 | 发生了什么 | 输出 |
|---|---|---|
| 同步 | `console.log(1)` | **1** |
| 同步 | `setTimeout` 注册，钳制成 `1ms` | — |
| 同步 | 第一个 `.then` 回调入微任务队列 | — |
| 微任务 | 取出第一个回调执行 | **3** |
| 微任务 | 前一个 `.then` 返回值落定，第二个回调入队；队列非空，继续清 | **4** |
| 宏任务 | timers 阶段 | **2** |

考点：微任务是**穷尽式清空**，`4` 不会等到下一轮。

### 例 2：executor 同步 + 定时器之间清微任务

```javascript
console.log("begins");

setTimeout(() => {
  console.log("setTimeout 1");
  Promise.resolve().then(() => {
    console.log("promise 1");
  });
}, 0);

new Promise(function (resolve, reject) {
  console.log("promise 2");
  setTimeout(function () {
    console.log("setTimeout 2");
    resolve("resolve 1");
  }, 0);
}).then((res) => {
  console.log("dot then 1");
  setTimeout(() => {
    console.log(res);
  }, 0);
});
```

**输出：**

```
begins
promise 2
setTimeout 1
promise 1
setTimeout 2
dot then 1
resolve 1
```

拆解：

1. **同步阶段** —— `begins`；`setTimeout 1` 注册；`new Promise` 的 executor **同步执行**输出 `promise 2`，并注册 `setTimeout 2`。注意 `resolve` 在 `setTimeout 2` **里面**，此刻没调用，所以 `.then` 回调**不入队**。
2. **微任务检查点** —— 队列是空的（promise 还 pending）。
3. **timers 阶段** —— 两个定时器 `_idleStart` 相同，落进同一链表：
   * `setTimeout 1` 执行 → 输出 `setTimeout 1`，微任务入队
   * `runNextTicks()` → 输出 `promise 1`
   * `setTimeout 2` 执行 → 输出 `setTimeout 2`，`resolve()` 让 `.then` 回调入队
   * `runNextTicks()` → 输出 `dot then 1`，同时注册第三个定时器
4. **第三个定时器不在本轮跑**（`diff < msecs` 提前 `return`），下一轮 → 输出 `resolve 1`

考点三个：`new Promise` 的 executor 是同步的；`runNextTicks` 夹在两个定时器之间；回调里新建的定时器落到下一轮。

在 **Node 10 及以前**输出会是：

```
begins / promise 2 / setTimeout 1 / setTimeout 2 / promise 1 / dot then 1 / resolve 1
                                    ↑ 两个 timer 连着跑
```

### 例 3：async/await

```javascript
async function async1() {
  console.log("async1 start");
  await async2();
  console.log("async1 end");
}

async function async2() {
  console.log("async2");
}

console.log("script start");

setTimeout(function () {
  console.log("setTimeout");
}, 0);

async1();

new Promise(function (resolve) {
  console.log("promise1");
  resolve();
}).then(function () {
  console.log("promise2");
});

console.log("script end");
```

**输出：**

```
script start
async1 start
async2
promise1
script end
async1 end
promise2
setTimeout
```

同步阶段的切割点：

```javascript
async function async1() {
  console.log("async1 start");   // ─┐ 同步段，跟主模块一起跑
  await async2();                //  ┴── 切割点（async2 本身也是同步的）
  console.log("async1 end");     // ──── 微任务段
}
```

`await` 执行完，`async1` 就地 return，主模块继续往下 —— 所以 `promise1`、`script end` 插在了 `async2` 和 `async1 end` 中间。

微任务队列里两个回调的**入队先后**决定了后面的顺序：

| 顺序 | 微任务 | 入队时机 |
|---|---|---|
| ① | `console.log("async1 end")` | `async2()` 返回后立刻入队（**更早**） |
| ② | `console.log("promise2")` | 要等 `new Promise` 的 executor 跑到 `resolve()`（**更晚**） |

所以 `async1 end` 在 `promise2` 前面。

### 例 4：最简的 runNextTicks 对照

```javascript
Promise.resolve().then(function() {
    console.log(1);
})
console.log(2); 
setTimeout(function () { 
    console.log('setTimeout1'); 
    Promise.resolve().then(function () { 
        console.log('promise'); 
    }); 
});
setTimeout(function () { 
    console.log('setTimeout2'); 
    Promise.resolve().then(function () { 
        console.log('promise2'); 
    }); 
});
```

**输出：**

```
2
1
setTimeout1
promise
setTimeout2
promise2
```

要点：

* `console.log(2)` 在 `1` 前面 —— `.then` 哪怕挂在已 `resolved` 的 promise 上也必须走微任务队列
* 两个 `setTimeout` **没传延时参数**，`after` 是 `undefined`，同样被钳制成 `1ms`
* 两者在同一个同步 tick 注册，`_idleStart` 相同，落进同一链表，由同一次 `listOnTimeout` 的 `while` 循环连续处理
* 即便如此，中间照样插了一次 `runNextTicks()`，所以是**交替输出**

这段代码是区分 Node 10 / Node 11+ 的经典样本。Node 10 的输出是：

```
2, 1, setTimeout1, setTimeout2, promise, promise2
```

现代 Node 与浏览器行为一致，都是交替。

## 参考

* [IO多路复用](../other/多路复用.md)
* [为什么用EventLoop](https://www.runoob.com/nodejs/nodejs-event-loop.html)
* [官方文档](https://nodejs.org/zh-cn/docs/guides/event-loop-timers-and-nexttick/)    
* [宏任务、微任务](https://cloud.tencent.com/developer/article/1701427)
* [浏览器,Node中EventLoop的区别](https://juejin.cn/post/6844903761949753352#heading-12)
