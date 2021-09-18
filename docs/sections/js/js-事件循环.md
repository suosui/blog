## 事件循环

什么是事件循环？先通过一段伪代码了解一下这个概念:
```javascript
// eventLoop是一个用作队列的数组
// （先进，先出）
var eventLoop = [];
var event;
// “永远”执行
while (true) {
    // 一次tick
    if (eventLoop.length > 0) {
        // 拿到队列中的下一个事件
        event = eventLoop.shift();
        // 现在，执行下一个事件
        try {
            event();
        }
        catch (err) {
            reportError(err);
        }
    }
}
```
你可以看到，有一个用 `while` 循环实现的持续运行的循环，循环的每一轮称为一个 `tick` 。对每个 `tick` 而言，如果在队列中有等待事件，那么就会从队列中摘下一个事件并执行。这些事件就是你的`回调函数`。  
一定要清楚，`setTimeout(..)` 并没有把你的回调函数挂在`事件循环队列`中。它所做的是设定一个定时器。当定时器到时后，`环境`会把你的回调函数放在事件循环中，这样，在未来某个时刻的 `tick` 会摘下并执行这个回调。  
如果这时候事件循环中已经有 `20` 个项目了会怎样呢？你的回调就会等待。它得排在其他项目后面——通常没有抢占式的方式支持直接将其排到队首。这也解释了为什么
`setTimeout(..)` 定时器的精度可能不高。大体说来，只能确保你的回调函数不会在指定的时间间隔之前运行，但可能会在那个时刻运行，也可能在那之后运行，要根据事件队列的状态而定。

## 任务

 `ES6` 中，有一个新的概念建立在事件循环队列之上，叫作`任务队列`（`job queue`）。这个概念给大家带来的最大影响可能是 `Promise` 的异步特性。  
 它是挂在事件循环队列的每个 `tick` 之后的一个队列。在事件循环的每个 `tick` 中，可能出现的异步动作不会导致一个完整的新事件添加到事件循环队列中，而会在当前 `tick` 的任务队列末尾添加一个项目（一个任务）。    
 一个任务可能引起更多任务被添加到同一个队列末尾。所以，理论上说，任务循环（`jobloop`）可能无限循环（一个任务总是添加另一个任务，以此类推），进而导致程序的饿死，无法转移到下一个事件循环 `tick` 。从概念上看，这和代码中的无限循环（就像 `while(true)..`）的体验几乎是一样的。

 设想一个调度任务（直接地，不要 `hack`）的 `API`，称其为 `schedule(..)`。考虑：
 ```javascript
function schedule(callback) {
    callback();
};

console.log("A");
setTimeout(function () {
    console.log("B");
}, 0);
// 理论上的"任务API"
schedule(function () {
    console.log("C");
    schedule(function () {
        console.log("D");
        schedule(function () {
            console.log("E");
            schedule(function () {
                console.log("F");
            });
        });
    });
});
 ```

 可能你认为这里会打印出 `A B C D E F`，但实际打印的结果是 `A C D E F B`。因为任务处理是在当前事件循环 `tick` 结尾处，且定时器触发是为了调度下一个事件循环 `tick`（如果可用的话！）。