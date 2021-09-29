# Promise

从 [回调](./js-Callbak.md#回调的问题) 得知 `回调` 最大的问题是 `控制反转` 。 但是，如果我们能够把控制反转再反转回来，会怎样呢？如果我们不把自己程序的 `控制权` 传给第三方，而是希望第三方给我们提供了解其任务何时结束的能力，然后由我们自己的代码来决定下一步做什么，那将会怎样呢？

这种范式就称为 `Promise` 。

## 什么是Promise

`Promise` 是一个对象，并持有一个状态值，当你创建一个新的 `Promise` 对象时并调用时，这个状态值是 `Pending`， 相当于在 `未来` 占了一个位置。当这个状态值发生变化时，即变为 `Resolved`(完成)或 `Rejected` (失败)时。`Promise` 会监听到状态的变化，进而返回给程序（同步程序）最新的状态,即 `then()` 。这时由同步程序决定下一步该做什么。发现了没，Promise把 `控制权` 返还给了同步程序。  
`回调`的话，只是单纯的调用回调函数而已，但是用 `Promise`, 程序会收到`成功`或`失败`的状态值。同步程序根据这个状态值分析是否需要运行回调或这不运行回调。  
例如：  
假定要调用一个函数 `foo(..)` 执行某个任务。我们不知道也不关心它的任何细节。这个函数可能立即完成任务，也可能需要一段时间才能完成。我们只需要知道 `foo(..)` 什么时候结束，这样就可以进行下一个任务。换句话说，我们想要通过某种方式在 `foo(..)` 完成的时候得到通知，以便可以继续下一步。在典型的 `JavaScript` 风格中，如果需要侦听某个通知，你可能就会想到事件。因此，可以把对通知的需求重新组织为对 `foo(..)` 发出的一个完成事件（`completion` `event`，或 `continuation` 事件）的侦听。
>是叫完成事件还是叫 continuation 事件，取决于你的视角。你是更关注foo(..) 发生了什么，还是更关注 foo(..) 之后发生了什么？两种视角都是合理有用的。事件通知告诉我们 foo(..) 已经完成，也告诉我们现在可以继续进行下一步。确实，传递过去的回调将在事件通知发生时被调用，这个回调本身之前就是我们之前所说的 continuation。完成事件关注 foo(..) 更多一些，这也是目前主要的关注点，所以在后面的内容中，我们将其称为完成事件。

使用回调的话，通知就是任务（`foo(..)`）调用的回调。而使用 Promise 的话，我们把这个关系反转了过来，侦听来自 `foo(..)` 的事件，然后在得到通知的时候，根据情况继续。首先，考虑以下伪代码：
```javascript
foo(x) {
    // 开始做点可能耗时的工作
}
foo(42)
on(foo "completion") {
    // 可以进行下一步了！
}
on(foo "error") {
    // 啊，foo(..)中出错了
}
```
我们调用 `foo(..)`，然后建立了两个事件侦听器，一个用于 "`completion`"，一个用于"`error`"——`foo(..)` 调用的两种可能结果。从本质上讲，`foo(..)` 并不需要了解调用代码订阅了这些事件，这样就很好地实现了关注点分离。  
遗憾的是，这样的代码需要 `JavaScript` 环境提供某种魔法，而这种环境并不存在（实际上也有点不实际）。以下是在 `JavaScript` 中更自然的表达方法：
```javascript
function foo(x) {
    // 开始做点可能耗时的工作
    // 构造一个listener事件通知处理对象来返回
    return listener;
}
var evt = foo(42);
evt.on("completion", function () {
    // 可以进行下一步了！
});
evt.on("failure", function (err) {
    // 啊，foo(..)中出错了
});
```
`foo(..)` 显式创建并返回了一个事件订阅对象，调用代码得到这个对象，并在其上注册了两个事件处理函数。  
相对于面向回调的代码，这里的反转是显而易见的，而且这也是有意为之。这里没有把回调传给 `foo(..)`，而是返回一个名为 `evt` 的事件注册对象，由它来接受回调。   
一个很重要的好处是，可以把这个事件侦听对象提供给代码中多个独立的部分；在 `foo(..)` 完成的时候，它们都可以独立地得到通知，以执行下一步：  
```javascript
var evt = foo(42);
// 让bar(..)侦听foo(..)的完成
bar(evt);
// 并且让baz(..)侦听foo(..)的完成
baz(evt);
```
对控制反转的恢复实现了更好的关注点分离，其中 `bar(..)` 和 `baz(..)` 不需要牵扯到 `foo(..)` 的调用细节。类似地，`foo(..) `不需要知道或关注 `bar(..)` 和 `baz(..)` 是否存在，或者是否在等待 `foo(..)` 的完成通知。  

从本质上说， `evt` 对象就是分离的关注点之间一个中立的第三方协商机制。  

你可能已经猜到，事件侦听对象 `evt` 就是 `Promise` 的一个模拟。在基于 `Promise` 的方法中，前面的代码片段会让 `foo(..)` 创建并返回一个 `Promise` 实例，而且这个 `Promise` 会被传递到 `bar(..)` 和 `baz(..)`。

## Promise的信任问题
• 调用回调过早；  
• 调用回调过晚（或不被调用）；  
• 调用回调次数过少或过多；  
• 未能传递所需的环境和参数；  
• 吞掉可能出现的错误和异常。  

* 调用过早   
任何形式的 `Promise` 都是异步的。没有同步的 `Promise` 。
```javascript
Promise.resolve().then(() => {
    console.log(2)
})
console.log(1)
// 1,2
```
* 调用过晚  
和前面一点类似， `Promise` 创建对象调用 `resolve(..)` 或 `reject(..)` 时，这个 Promise 的then(..) 注册的观察回调就会被自动调度。可以确信，这些被调度的回调在下一个异步事件点上一定会被触发。  同步查看是不可能的，所以一个同步任务链无法以这种方式运行来实现按照预期有效延迟另一个回调的发生。也就是说，一个 `Promise` 决议后，这个 `Promise` 上所有的通过 `then(..)` 注册的回调都会在下一个异步时机点上依次被立即调用。这些回调中的任意一个都无法影响或延误对其他回调的调用。举例来说：
```javascript
p.then(function () {
    p.then(function () {
        console.log("C");
    });
    console.log("A");
});
p.then(function () {
    console.log("B");
});
// A B C
// 这里，"C" 无法打断或抢占 "B"，这是因为 Promise 的运作方式。
```
但是，还有很重要的一点需要指出，有很多调度的细微差别。在这种情况下，两个独立 `Promise` 上链接的回调的相对顺序无法可靠预测。如果两个 `promise` `p1` 和 `p2` 都已经决议，那么 `p1.then(..)`; `p2.then(..)` 应该最终会先调用p1 的回调，然后是 `p2` 的那些。但还有一些微妙的场景可能不是这样的，比如以下代码：
```javascript
var p3 = new Promise(function (resolve, reject) {
    resolve("B");
});
var p1 = new Promise(function (resolve, reject) {
    resolve(p3);
});
p2 = new Promise(function (resolve, reject) {
    resolve("A");
});
p1.then(function (v) {
    console.log(v);
});
p2.then(function (v) {
    console.log(v);
});
// A B <-- 而不是像你可能认为的B A
```
后面我们还会深入介绍，但目前你可以看到，`p1` 不是用立即值而是用另一个 `promise` `p3` 决议，后者本身决议为值 "B"。规定的行为是把 `p3` 展开到 `p1`，但是是异步地展开。所以，在异步任务队列中，`p1` 的回调排在 `p2` 的回调之后。

* 回调未调用  
这个问题很常见，`Promise` 可以通过几种途径解决。  
首先，没有任何东西（甚至 `JavaScript` 错误）能阻止 `Promise` 向你通知它的决议（如果它决议了的话）。如果你对一个 `Promise` 注册了一个完成回调和一个拒绝回调，那么 `Promise` 在决议时总是会调用其中的一个。  
当然，如果你的回调函数本身包含 `JavaScript` 错误，那可能就会看不到你期望的结果，但实际上回调还是被调用了。后面我们会介绍如何在回调出错时得到通知，因为就连这些错误也不会被吞掉。  
但是，如果 `Promise` 本身永远不被决议呢？即使这样，`Promise` 也提供了解决方案，其使用了一种称为竞态的高级抽象机制：
```javascript
// 用于超时一个Promise的工具
function timeoutPromise(delay) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            reject("Timeout!");
        }, delay);
    });
}
// 设置foo()超时
Promise.race([
    foo(), // 试着开始foo()
    timeoutPromise(3000) // 给它3秒钟
]).then(
    function () {
        // foo(..)及时完成！
    },
    function (err) {
        // 或者foo()被拒绝，或者只是没能按时完成
        // 查看err来了解是哪种情况
    }
);
```
关于这个 Promise 超时模式还有更多细节需要考量，后面我们会深入讨论。很重要的一点是，我们可以保证一个 `foo()` 有一个输出信号，防止其永久挂住程序。

* 调用次数过少或过多  
根据定义，回调被调用的正确次数应该是 1。“过少”的情况就是调用 0 次，和前面解释过的“未被”调用是同一种情况。“过多”的情况很容易解释。`Promise` 的定义方式使得它只能被决议一次。如果出于某种原因，`Promise` 创建代码试图调用 `resolve(..)` 或` reject(..)` 多次，或者试图两者都调用，那么这个 `Promise` 将只会接受第一次决议，并默默地忽略任何后续调用。由于 `Promise` 只能被决议一次，所以任何通过 `then(..)` 注册的（每个）回调就只会被调用一次。当然，如果你把同一个回调注册了不止nj一次（比如 `p.then(f)`; `p.then(f)`;），那它被调用的次数就会和注册次数相同。响应函数只会被调用一次。

* 吞掉错误或异常  
基本上，这部分是上个要点的再次说明。如果拒绝一个 `Promise` 并给出一个理由（也就是一个出错消息），这个值就会被传给拒绝回调。不过在这里还有更多的细节需要研究。如果在 `Promise` 的创建过程中或在查看其决议结果过程中的任何时间点上出现了一个 `JavaScript` 异常错误，比如一个 `TypeError` 或 `ReferenceError`，那这个异常就会被捕捉，并且会使这个 `Promise` 被拒绝。举例来说：
```javascript
var p = new Promise(function (resolve, reject) {
    foo.bar(); // foo未定义，所以会出错！
    resolve(42); // 永远不会到达这里 :(
});
p.then(
    function fulfilled() {
        // 永远不会到达这里 :(
    },
    function rejected(err) {
        // err将会是一个TypeError异常对象来自foo.bar()这一行
    }
);
```
`foo.bar()` 中发生的 `JavaScript` 异常导致了 `Promise` 拒绝，你可以捕捉并对其作出响应。
这是一个重要的细节，因为其有效解决了另外一个潜在的 `Zalgo` 风险，即出错可能会引起同步响应，而不出错则会是异步的。`Promise` 甚至把 `JavaScript` 异常也变成了异步行为，进而极大降低了竞态条件出现的可能。

## 是可信任的 Promise 吗
你肯定已经注意到 `Promise` 并没有完全摆脱回调。它们只是改变了传递回调的位置。我们并不是把回调传递给 `foo(..)`，而是从 `foo(..)` 得到某个东西（外观上看是一个真正的 `Promise` ），然后把回调传给这个东西。  
但是，为什么这就比单纯使用回调更值得信任呢？如何能够确定返回的这个东西实际上就是一个可信任的 `Promise` 呢？这难道不是一个（脆弱的）纸牌屋，在里面只能信任我们已经信任的？  
关于 `Promise` 的很重要但是常常被忽略的一个细节是，`Promise` 对这个问题已经有一个解决方案。包含在原生 `ES6` `Promise` 实现中的解决方案就是 `Promise.resolve(..)`。  
1) 如果向 `Promise.resolve(..)` 传递一个非 `Promise`、非 `thenable` 的立即值，就会得到一个用这个值填充的 `promise`。下面这种情况下，`promise p1` 和 `promise p2` 的行为是完全一样的：
```javascript
var p1 = new Promise(function (resolve, reject) {
    resolve(42);
});
var p2 = Promise.resolve(42);
```
2) 而如果向 `Promise.resolve(..)` 传递一个真正的 `Promise`，就只会返回同一个 `promise`：
```javascript
var p1 = Promise.resolve(42);
var p2 = Promise.resolve(p1);
p1 === p2; // true
```
3) 如果向 `Promise.resolve(..)` 传递了一个非 `Promise` 的 `thenable` 值，前者就会试图展开这个值，而且展开过程会持续到提取出一个具体的非类 `Promise` 的最终值。考虑：
```javascript
var p = {
    then: function (cb) {
        cb(42);
    }
};
// 这可以工作，但只是因为幸运而已
p.then(
    function fulfilled(val) {
        console.log(val); // 42
    },
    function rejected(err) {
        // 永远不会到达这里
    }
);
```
这个 `p` 是一个 `thenable`，但并不是一个真正的 `Promise`。幸运的是，和绝大多数值一样，它是可追踪的。但是，如果得到的是如下这样的值又会怎样呢：
```javascript
var p = {
    then: function (cb, errcb) {
        cb(42);
        errcb("evil laugh");
    }
};
p.then(
    function fulfilled(val) {
        console.log(val); // 42
    },
    function rejected(err) {
        // 啊，不应该运行！
        console.log(err); // 邪恶的笑
    }
);
```
这个 `p` 是一个 `thenable`，但是其行为和 `promise` 并不完全一致。这是恶意的吗？还只是因为它不知道 `Promise` 应该如何运作？说实话，这并不重要。不管是哪种情况，它都是不可信任的。尽管如此，我们还是都可以把这些版本的 `p` 传给 `Promise.resolve(..)`，然后就会得到期望中的规范化后的安全结果：
```javascript
Promise.resolve(p).then(
    function fulfilled(val) {
        console.log(val); // 42
    },
    function rejected(err) {
        // 永远不会到达这里
    }
);
```
`Promise.resolve(..)` 可以接受任何 `thenable`，将其解封为它的非 `thenable` 值。从 `Promise.resolve(..)` 得到的是一个真正的 `Promise`，是一个可以信任的值。如果你传入的已经是真正的 `Promise`，那么你得到的就是它本身，所以通过 `Promise.resolve(..)` 过滤来获得可信任性完全没有坏处。  
假设我们要调用一个工具 `foo(..)`，且并不确定得到的返回值是否是一个可信任的行为良好的 `Promise`，但我们可以知道它至少是一个 `thenable`。`Promise.resolve(..)` 提供了可信任的 `Promise` 封装工具，可以链接使用：
```javascript
// 不要只是这么做：
foo(42).then(function (v) {
    console.log(v);
});
// 而要这么做：
Promise.resolve(foo(42)).then(function (v) {
    console.log(v);
});
```

## Promise和事件循环
`Promise` 的回调函数属于异步任务，会在同步任务之后执行。
```javascript
new Promise(function (resolve, reject) {
  resolve(1);
}).then(console.log);

console.log(2);
// 2
// 1
```
上面代码会先输出2，再输出1。因为console.log(2)是同步任务，而then的回调函数属于异步任务，一定晚于同步任务执行。  
但是，`Promise` 的回调函数不是正常的异步任务，而是微任务（`microtask`）。它们的区别在于，正常任务追加到下一轮事件循环，微任务追加到本轮事件循环。这意味着，微任务的执行时间一定早于正常任务。
```javascript
setTimeout(function() {
  console.log(1);
}, 0);

new Promise(function (resolve, reject) {
  resolve(2);
}).then(console.log);

console.log(3);
// 3
// 2
// 1
```
上面代码的输出结果是321。这说明then的回调函数的执行时间，早于setTimeout(fn, 0)。因为then是本轮事件循环执行，setTimeout(fn, 0)在下一轮事件循环开始时执行。


## Promise的局限性

### 顺序错误处理
略。
### 单一值
略。
### 单决议
略。
### 惯性
略。
### 无法取消的Promise
一旦创建了一个 `Promise` 并为其注册了完成和 / 或拒绝处理函数，如果出现某种情况使得这个任务悬而未决的话，你也没有办法从外部停止它的进程。
```javascript
// 用于超时一个Promise的工具
function timeoutPromise(delay) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            reject("Timeout!");
        }, delay);
    });
}
var p = foo(42);
Promise.race([
    p,
    timeoutPromise(3000)
]).then(
    doSomething,
    handleError
);
p.then(function () {
    // 即使在超时的情况下也会发生 :(
});
```
这个“超时”相对于 `promise p` 是外部的，所以 `p` 本身还会继续运行，这一点可能并不是我们所期望的。一种选择是侵入式地定义你自己的决议回调：
```javascript
var OK = true;
var p = foo(42);
Promise.race([
    p,
    timeoutPromise(3000).catch(function (err) {
        OK = false;
        throw err;
    })
]).then(
    doSomething,
    handleError
);
p.then(function () {
    if (OK) {
        // 只在没有超时情况下才会发生 :)
    }
});
```

## 手写Promise

* [从一道让我失眠的 Promise 面试题开始，深入分析 Promise 实现细](https://developers.weixin.qq.com/community/develop/article/doc/0006a2372a8a7083faeb1366951c13)
* [Promise/A+](https://promisesaplus.com/)