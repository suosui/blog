# 回调

## 定义

1. 在 `javascript` 中代码都是分块执行的。最常见的块单位是`函数`。这些块中只有一个是现在执行，其余的则会在将来执行。最常见的块单位是函数。  
2. 在 `javascript` 中函数被调用才执行。而不是定义了就执行。  
```javascript
// 定义一个函数
function me(){
    console.log(`i have been called`);
}
// 调用函数
me(); // i have been called
```

3. 在 `javascript` 中函数可以作为参数传入另一个函数当中。这种机制使得一个函数可以决定另一个函数 `何时` 运行(即调用)。
```javascript
// 定义一个函数
function me(){
    console.log(`i have been called`);
}
// 定义另一个函数
function callMe(me){
    me();
}

callMe(me); // i have been called
```

4. 作为参数传入到另一个函数的函数就是俗称的 `回调`。

## 回调的问题

回调最大的问题是控制反转。  
比如：前面例子中的 `callMe` 函数能决定`何时`调用 `me`，或者干脆不调用我们传入的 `me` 函数。如果这个 `callMe` 函数是由第三方提供的接口。我们负责传入 `me` 回调函数。我们不能指望第三方提供的接口完全没有问题的。  
所以我们要举例看控制反转带来的问题。

* 调用过早

* 调用过晚

* 调用回调的次数太多或太少。

* 没有把所需的环境/参数成功传给你的回调函数

* 吞掉可能出现的错误或异常
