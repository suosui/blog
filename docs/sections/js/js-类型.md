# JS类型

 `ECMAScript` 语言中所有的值都有一个对应的语言类型。ECMAScipt 语言类型包括 `Undefined`, `NUll`, `Boolean`, `String`, `Number`和`Object`。

为什么说 JavaScript 是否有类型也很重要呢？要正确合理地进行类型转换（参见第 4 章），我们必须掌握 `JavaScript` 中的各个类型及其内在行为。几乎所有的 `JavaScript` 程序都会涉及某种形式的强制类型转换，处理这些情况时我们需要有充分的把握和自信。

## 内置类型
`JavaScript` 有七种内置类型：
1. null (空值)
2. undefined (未定义)
3. boolean (布尔值)
4. number (数字)
5. string (字符串)
6. object (对象)
7. symbol (符号)

除对象之外，其他统称为“基本类型”。我们可以用`typeof`运算符来查看值的类型，它返回的是类型的字符串值。
```javascript
1 typeof undefined    === 'undefined'; // true;
2 typeof true         === 'boolean';   // true;
3 typeof 42           === 'number';    // true
4 typeof "42"         === 'string';    // true
5 typeof { life: 42 } === 'object';    // true

// ES6中新加如的类型
6 typeof Symbol()     === 'symbol';    // true

typeof null         === "object";    // true 
//正确的返回结果应该是 "null"，但这个 bug 由来已久，在 JavaScript 中已经存在了将近二十年，也许永远也不会修复，因为这牵涉到太多的 Web 系统，“修复”它会产生更多的bug，令许多系统无法正常工作。
// 我们需要使用复合条件来检测 null 值的类型：
var a = null;
7 (!a && typeof a === "object"); // true

8 typeof function a(){ /* .. */ } === "function"; // true
```
`typeof` 运算符总是会返回一个字符串：   
```javascript
typeof 42 // string
typeof 42 首先返回字符串 "number"，然后 typeof "number" 返回 "string"。
```
`typeof`伪代码 [ECMA-262](https://tc39.es/ecma262/)
```javascript
1. Let val be the result of evaluating UnaryExpression.// typeof是一元运算符，所以
2. If val is a Reference Record, then // 如果val是引用类型                                   
       a. If IsUnresolvableReference(val) is true, return "undefined". // 变量在未持有值的时候为 ”undefined“
3. Set val to ? GetValue(val). // 通过GetValue返回一个String。
4. Return a String according to Table //根据GetValue返回的String 和 Table返回Result
```
```
                     ┌───────────────────────────────────┐─────────────┐
                     │          Type of val              │    Result   |
                     |───────────────────────────────────|─────────────|
                     │ Undefined                         │ "undefined" |
                     |───────────────────────────────────|─────────────|
                     │ Null                              │ "object"    |
                     |───────────────────────────────────|─────────────|
                     │ Boolean                           │ "boolean"   |
                     |───────────────────────────────────|─────────────|
                     │ Number                            │ "number"    |
                     |───────────────────────────────────|─────────────|
                     │ String                            │ "string"    |
                     |───────────────────────────────────|─────────────|
                     │ Symbole                           │ "symbol"    |
                     |───────────────────────────────────|─────────────|
                     | BigInt                            | "bigint"    |
                     |───────────────────────────────────|─────────────|
                     │ Object(does not implement[[Call]])│ "object"    |
                     |───────────────────────────────────|─────────────|
                     │ Object (implements [[Call]])      │ "function"  |
                     └───────────────────────────────────┘─────────────┘
                                             Table
```

## undefined 和 undeclared

变量在未持有值的时候为 `undefined`。此时 `typeof` 返回 `"undefined"`：
```javascript
var a;
typeof a; // "undefined"
var b = 42;
var c;
// later 
b = c;
typeof b; // "undefined"
typeof c; // "undefined"
```

相反，还没有在作用域中声明过的变量，是 `undeclared` 的。
```javascript
var a;
a; // undefined
b; // ReferenceError: b is not defined
```
> 对于 undeclared（或者 not defined）变量，typeof 照样返回 "undefined"。请注意虽然 b 是一个 undeclared 变量，但 typeof b 并没有报错。这是因为 typeof 有一个特殊的安全防范机制。

## typof Undeclared

该安全防范机制对在浏览器中运行的 `JavaScript` 代码来说还是很有帮助的，因为多个脚本文件会在共享的全局命名空间中加载变量。   
举一个简单的例子：

如果 `A.js` 文件中没有声明变量 `a` :

```javascript
/**
* file: A.js
*/

// 这样会报错 
if(a){
 console.log("i am a");
}

// 这样是安全的
if(typeof DEBUG !== "undefined"){
    console.log("i am a");
}
```