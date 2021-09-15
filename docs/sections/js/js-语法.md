# 语法

## 错误

`JavaScript` 不仅有各种类型的运行时错误（`TypeError`、`ReferenceError`、`SyntaxError` 等），它的语法中也定义了一些编译时错误。

在编译阶段发现的代码错误叫作“早期错误”（`early error`）。语法错误是早期错误的一种（如 a = ,）。另外，语法正确但不符合语法规则的情况也存在。这些错误在代码执行之前是无法用 try..catch 来捕获的，相反，它们还会导致解析 / 编译失败。

### 提前使用变量

`ES6` 规范定义了一个新概念，叫作 `TDZ`（`Temporal Dead Zone`，暂时性死区）。`TDZ` 指的是由于代码中的变量还没有初始化而不能被引用的情况。  
对此，最直观的例子是 `ES6` 规范中的 `let` 块作用域：
```javascript
{
    a = 2; // ReferenceError!
    let a;
}
```
a = 2 试图在 `let` a 初始化 a 之前使用该变量（其作用域在 `{ .. }` 内），这里就是 a 的 `TDZ`，会产生错误。  
>有意思的是，对未声明变量使用 `typeof` 不会产生错误，但在 `TDZ` 中却会报错：  
```javascirpt
{
    typeof a; // undefined
    typeof b; // ReferenceError! (TDZ)
    let b;
}
```

## try..finally

`try..catch` 对我们来说可能已经非常熟悉了。但你是否知道 `try` 可以和 `catch` 或者 `finally` 配对使用，并且必要时两者可同时出现？

`finally` 中的代码总是会在 `try` 之后执行，如果有 `catch` 的话则在 `catch` 之后执行。也可以将 `finally` 中的代码看作一个回调函数，即无论出现什么情况最后一定会被调用。

如果 `try` 中有 `return` 语句会出现什么情况呢？ `return` 会返回一个值，那么调用该函数并得到返回值的代码是在 `finally` 之前还是之后执行呢？
```javascript
function foo() {
    try {
        return 42;
    }
    finally {
        console.log("Hello");
    }
    console.log("never runs");
}
console.log(foo());
// Hello
// 42
```
这里 `return` 42 先执行，并将 foo() 函数的返回值设置为 42。然后 `try` 执行完毕，接着执行 `finally`。最后 foo() 函数执行完毕，console.log(..) 显示返回值。

`try` 中的 `throw` 也是如此：
```javascript
function foo() {
    try {
        throw 42;
    }
    finally {
        console.log("Hello");
    }
    console.log("never runs");
}
console.log(foo());
// Hello
// Uncaught Exception: 42
```

如果 `finally` 中抛出异常（无论是有意还是无意），函数就会在此处终止。如果此前 `try` 中已经有 `return` 设置了返回值，则该值会被丢弃：
```javascript
function foo() {
    try {
        return 42;
    }
    finally {
        throw "Oops!";
    }
    console.log("never runs");
}
console.log(foo());
// Uncaught Exception: Oops!
```

`continue` 和 `break` 等控制语句也是如此：
```javascript
for (var i = 0; i < 10; i++) {
    try {
        continue;
    }
    finally {
        console.log(i);
    }
}
// 0 1 2 3 4 5 6 7 8 9
```
`continue` 在每次循环之后，会在 i++ 执行之前执行 console.log(i)，所以结果是 0..9 而非 1..10。

>`ES6` 中新加入了 `yield` （参见本书的“异步和性能”部分），可以将其视为 `return` 的中间版本。然而与 `return` 不同的是，`yield` 在 `generator`（`ES6` 的另一个新特性）重新开始时才结束，这意味着 `try { .. yield .. }` 并未结束，因此 `finally` 不会在 `yield` 之后立即执行。

`finally` 中的 `return` 会覆盖 `try` 和 `catch` 中 `return` 的返回值：
```javascript
function foo() {
    try {
        return 42;
    }
    finally {
        // 没有返回语句，所以没有覆盖
    }
}
function bar() {
    try {
        return 42;
    }
    finally {
        // 覆盖前面的 return 42
        return;
    }
}
function baz() {
    try {
        return 42;
    }
    finally {
        // 覆盖前面的 return 42
        return "Hello";
    }
}
foo(); // 42
bar(); // undefined
baz(); // Hello
```
通常来说，在函数中省略 `return` 的结果和 `return`; 及 `return` `undefined`; 是一样的，但是在 `finally` 中省略 `return` 则会返回前面的 `return` 设定的返回值。

事实上，还可以将 `finally` 和带标签的 `break` 混合使用。例如：
```javascript
function foo() {
    bar: {
        try {
            return 42;
        }
        finally {
            // 跳出标签为bar的代码块
            break bar;
        }
    }
    console.log("Crazy");
    return "Hello";
}
console.log(foo());
// Crazy
// Hello
```
但切勿这样操作。利用 `finally` 加带标签的 `break` 来跳过 `return` 只会让代码变得晦涩难懂，即使加上注释也是如此。