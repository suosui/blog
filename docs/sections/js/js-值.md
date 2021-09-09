# JS值

## 数组

* 和其他强类型语言不同，在 `JavaScript` 中，数组可以容纳任何类型的值，可以是字符串、数字、对象（`object`），甚至是其他数组（多维数组就是通过这种方式来实现的）。

* 对数组声明后即可向其中加入值，不需要预先设定大小（参见 [Array(..)](./js-原生函数.md#Array(..))）。
* 使用 `delete` 运算符可以将单元从数组中删除，但是请注意，单元删除后，数组的 `length` 属性并不会发生变化。参考 [运算符优先级](./js-运算优先级.md)。
* 在创建“稀疏”数组（`sparse array`，即含有空白或空缺单元的数组）时要特别注意：
```javascript
var a = [];                       // a: []
a[0] = 1;                         // a: [1]
// 此处没有设置a[1]单元
a[2] = [3];                       // [ 1, <1 empty item>, [3] ]
a[1]; // undefined
a.length; // 3
```
上面的代码可以正常运行，但其中的“空白单元”（`empty slot`）可能会导致出人意料的结果。`a[1]` 的值为 `undefined`，但这与将其显式赋值为 `undefined（a[1] = undefined）`还是有所区别。详情请参见 [Array(..)](./js-原生函数.md#Array(..))。

数组通过数字进行索引，但有趣的是它们也是对象，所以也可以包含字符串键值和属性（但这些并不计算在数组长度内）：

```javascript
var a = [];                       // a: []
a[0] = 1;                         // a: [1]
a["foobar"] = 2;                  // a: [ 1, foobar: 2 ]
a.length; // 1
a["foobar"]; // 2
a.foobar; // 2
```
这里有个问题需要特别注意，如果字符串键值能够被强制类型转换为十进制数字的话，它就会被当作数字索引来处理
```javascript
var a = [ ];                      // []
a["13"] = 42;                     // [ <13 empty items>, 42 ]
a.length; // 14
```

### 类数组
有时需要将类数组（一组通过数字索引的值）转换为真正的数组，这一般通过数组工具函数（如 `indexOf(..)`、`concat(..)`、`forEach(..)` 等）来实现。

## 字符串
字符串经常被当成字符数组。字符串的内部实现究竟有没有使用数组并不好说，但 `JavaScript` 中的字符串和字符数组并不是一回事，最多只是看上去相似而已。
例如下面两个值：
```javascript
var a = "foo";
var b = ["f","o","o"];
```
字符串和数组的确很相似，它们都是类数组，都有 `length` 属性以及 `indexOf(..)`（从 `ES5`开始数组支持此方法）和 `concat(..)` 方法：

```javascript
a.length; // 3
b.length; // 3
a.indexOf( "o" ); // 1
b.indexOf( "o" ); // 1
var c = a.concat( "bar" ); // "foobar"
var d = b.concat( ["b","a","r"] ); // ["f","o","o","b","a","r"]
a === c; // false
b === d; // false
a; // "foo"
b; // ["f","o","o"]
```
但这并不意味着它们都是“字符数组”，比如：

```javascript
a[1] = "O";
b[1] = "O";
a; // "foo"
b; // ["f","O","o"]
```
`JavaScript` 中字符串是不可变的，而数组是可变的。并且 `a[1]` 在 `JavaScript` 中并非总是合
法语法，在老版本的 `IE` 中就不被允许（现在可以了）。正确的方法应该是 `a.charAt(1)`。

字符串不可变是指字符串的成员函数不会改变其原始值，而是创建并返回一个新的字符串。而数组的成员函数都是在其原始值上进行操作。
```javascript
c = a.toUpperCase();
a === c; // false
a; // "foo"
c; // "FOO"
b.push( "!" );
b; // ["f","O","o","!"]
```
许多数组函数用来处理字符串很方便。虽然字符串没有这些函数，但可以通过“借用”数组的非变更方法来处理字符串：
```javascript
a.join; // undefined
a.map; // undefined
var c = Array.prototype.join.call( a, "-" );
var d = Array.prototype.map.call( a, function(v){
 return v.toUpperCase() + ".";
} ).join( "" );
c; // "f-o-o"
d; // "F.O.O."
```

另一个不同点在于字符串反转（`JavaScript` 面试常见问题）。数组有一个字符串没有的可变更成员函数 `reverse()`：
```javascript
a.reverse; // undefined
b.reverse(); // ["!","o","O","f"]
b; // ["f","O","o","!"]
```
可惜我们无法“借用”数组的可变更成员函数，因为字符串是不可变的：
```javascript
Array.prototype.reverse.call( a ); // 返回值仍然是字符串"foo"的一个封装对象
```
一个变通（破解）的办法是先将字符串转换为数组，待处理完后再将结果转换回字符串：
```javascript
var c = a
 // 将a的值转换为字符数组
 .split( "" )
 // 将数组中的字符进行倒转
 .reverse()
 // 将数组中的字符拼接回字符串
 .join( "" );
c;  // "oof"
```

## 数字
`JavaScript` 只有一种数值类型：`number`（数字），包括“整数”和带小数的十进制数。此处“整数”之所以加引号是因为和其他语言不同，`JavaScript` 没有真正意义上的整数，这也是它一直以来为人诟病的地方。这种情况在将来或许会有所改观，但目前只有数字类型。`JavaScript` 中的“整数”就是没有小数的十进制数。所以 `42.0` 即等同于“整数”`42`。与大部分现代编程语言（包括几乎所有的脚本语言）一样，`JavaScript` 中的数字类型是基于 `IEEE 754` 标准来实现的，该标准通常也被称为“浮点数”。`JavaScript` 使用的是“双精度”格式（即 `64` 位`二进制`）。

### 数字的语法
特别大和特别小的数字默认用指数格式显示，与 `toExponential()` 函数的输出结果相同。例如：
```javascript
var a = 5E10;
a; // 50000000000
a.toExponential(); // "5e+10"
var b = a * a;
b; // 2.5e+21
var c = 1 / a;
c; // 2e-11
```

由于数字值可以使用 `Number` 对象进行封装（参见 [原生函数](./js-原生函数)），因此数字值可以调用 `Number`. prototype 中的方法,例如，`tofixed(..)` 方法可指定小数部分的显示位数：
```javascript
var a = 42.59;
a.toFixed( 0 ); // "43"
a.toFixed( 1 ); // "42.6"
a.toFixed( 2 ); // "42.59"
a.toFixed( 3 ); // "42.590"
a.toFixed( 4 ); // "42.5900"
```
请注意，上例中的输出结果实际上是给定数字的字符串形式，如果指定的小数部分的显示位数多于实际位数就用 `0` 补齐。   
`toPrecision(..)` 方法用来指定有效数位的显示位数：
```javascript
var a = 42.59;
a.toPrecision( 1 ); // "4e+1"
a.toPrecision( 2 ); // "43"
a.toPrecision( 3 ); // "42.6"
a.toPrecision( 4 ); // "42.59"
a.toPrecision( 5 ); // "42.590"
a.toPrecision( 6 ); // "42.5900" 
```

### 较小的数值
二进制浮点数最大的问题（不仅 `JavaScript`，所有遵循 `IEEE 754` 规范的语言都是如此），是会出现如下情况：
```javascript
0.1 + 0.2 === 0.3; // false
```
简单来说，二进制浮点数中的 `0.1` 和 `0.2` 并不是十分精确，它们相加的结果并非刚好等于`0.3`，而是一个比较接近的数字 `0.30000000000000004`，所以条件判断结果为 `false`。  
那么应该怎样来判断 `0.1 + 0.2 `和 `0.3` 是否相等呢？   
最常见的方法是设置一个误差范围值，通常称为“机器精度”`（machine epsilon）`，对 `JavaScript` 的数字来说，这个值通常是 `2^-52 (2.220446049250313e-16)`。   
从 `ES6` 开始，该值定义在 `Number.EPSILON` 中，我们可以直接拿来用，也可以为 `ES6` 之前的版本写 `polyfill`：
```javascript
if (!Number.EPSILON) {
 Number.EPSILON = Math.pow(2,-52);
}
```

```javascript
function numbersCloseEnoughToEqual(n1,n2) {
 return Math.abs( n1 - n2 ) < Number.EPSILON;
}
```
```javascript
var a = 0.1 + 0.2;
var b = 0.3;
numbersCloseEnoughToEqual( a, b ); // true
numbersCloseEnoughToEqual( 0.0000001, 0.0000002 ); // false
```
能够呈现的最大浮点数大约是 `1.798e+308`（这是一个相当大的数字），它定义在 `Number.MAX_VALUE` 中。最小浮点数定义在 `Number.MIN_VALUE` 中，大约是 `5e-324`，它不是负数，但无限接近于 `0` ！

### 整数的安全范围

数字的呈现方式决定了“整数”的安全值范围远远小于 `Number.MAX_VALUE`。能够被“安全”呈现的最大整数是 `2^53 - 1`，即 `9007199254740991`，在 `ES6` 中被定义为`Number.MAX_SAFE_INTEGER`。最小整数是 `-9007199254740991`，在 `ES6` 中被定义为 `Number`. `MIN_SAFE_INTEGER`。   

>有时 JavaScript 程序需要处理一些比较大的数字，如数据库中的 64 位 ID 等。由于
JavaScript 的数字类型无法精确呈现 64 位数值，所以必须将它们保存（转换）为字符串。

### 整数检测

要检测一个值是否是整数，可以使用 `ES6` 中的 `Number.isInteger(..)` 方法：
```javascript
Number.isInteger( 42 ); // true
Number.isInteger( 42.000 ); // true
Number.isInteger( 42.3 ); // false
```
也可以为 `ES6` 之前的版本 `polyfill` `Number.isInteger(..)` 方法：
```javascript
if (!Number.isInteger) {
    Number.isInteger = function (num) {
        return typeof num == "number" && num % 1 == 0;
    };
```
}
要检测一个值是否是安全的整数，可以使用 `ES6` 中的 `Number.isSafeInteger(..)` 方法：
```javascript
Number.isSafeInteger( Number.MAX_SAFE_INTEGER ); // true
Number.isSafeInteger( Math.pow( 2, 53 ) ); // false
Number.isSafeInteger( Math.pow( 2, 53 ) - 1 ); // true
```
可以为 `ES6` 之前的版本 `polyfill` `Number.isSafeInteger(..)` 方法：
```javascript
if (!Number.isSafeInteger) {
    Number.isSafeInteger = function (num) {
        return Number.isInteger(num) &&
            Math.abs(num) <= Number.MAX_SAFE_INTEGER;
    };
}
```

### 32位有符号整数
虽然整数最大能够达到 `53` 位，但是有些数字操作（如数位操作）只适用于 `32` 位数字，所以这些操作中数字的安全范围就要小很多，变成从 `Math.pow(-2,31)`（`-2147483648`，约`－21` 亿）到 `Math.pow(2,31) - 1`（`2147483647`，约 `21` 亿）。  
`a` | `0` 可以将变量 `a` 中的数值转换为 `32` 位有符号整数，因为数位运算符 | 只适用于 `32` 位整数（它只关心 `32` 位以内的值，其他的数位将被忽略）。因此与 `0` 进行操作即可截取 `a` 中的 `32` 位数位。
## 特殊数值
`JavaScript` 数据类型中有几个特殊的值需要开发人员特别注意和小心使用。
### 不是值的值
`undefined` 类型只有一个值，即 `undefined`。`null` 类型也只有一个值，即 `null`。它们的名称既是类型也是值。
`undefined` 和 `null` 常被用来表示“空的”值或“不是值”的值。二者之间有一些细微的差别。例如：
* `null` 指空值（empty value）
* `undefined` 指没有值（missing value）

或者：
* `undefined` 指从未赋值
* `null` 指曾赋过值，但是目前没有值
`null` 是一个特殊关键字，不是标识符，我们不能将其当作变量来使用和赋值。然而 `undefined` 却是一个标识符，可以被当作变量来使用和赋值。

### undefined
在非严格模式下，我们可以为全局标识符 `undefined` 赋值（这样的设计实在是欠考虑！）：
```javascript
function foo() {
 undefined = 2; // 非常糟糕的做法！
}
foo();
function foo() {
 "use strict";
 undefined = 2; // TypeError!
}
foo();
```
在非严格和严格两种模式下，我们可以声明一个名为 `undefined` 的局部变量。再次强调最好不要这样做！
```javascript
function foo() {
    "use strict";
    var undefined = 2;
    console.log(undefined); // 2
}
foo();
```
永远不要重新定义 `undefined`。

### void 运算符
`undefined` 是一个内置标识符（除非被重新定义，见前面的介绍），它的值为 `undefined`，通过 `void` 运算符即可得到该值。 表达式 `void` ___ 没有返回值，因此返回结果是 `undefined`。`void` 并不改变表达式的结果，只是让表达式不返回值：
```javascript
var a = 42;
console.log( void a, a ); // undefined 42
```
`void` 运算符在其他地方也能派上用场，比如不让表达式返回任何结果（即使其有副作用）。

### 特殊的数字
数字类型中有几个特殊的值，下面将详细介绍。

1. 不是数字的数字     

如果数学运算的操作数不是数字类型（或者无法解析为常规的十进制或十六进制数字），
就无法返回一个有效的数字，这种情况下返回值为 `NaN`  
`NaN` 意指“不是一个数字”（not a number），这个名字容易引起误会，后面将会提到。将它
理解为“无效数值”“失败数值”或者“坏数值”可能更准确些。例如：
```javascript
var a = 2 / "foo"; // NaN
typeof a === "number"; // true
```
换句话说，“不是数字的数字”仍然是数字类型。
> `NaN` 是一个特殊值，它和自身不相等，是唯一一个非自反（自反，`reflexive`，即 x === x 不成立）的值。而 `NaN` != `NaN` 为 true。  

 `ES6` 开始我们可以使用工具函数` Number.isNaN(..)`。`ES6` 之前的浏览器的 `polyfill` 如下：
 ```javascript
if (!Number.isNaN) {
    Number.isNaN = function (n) {
        return (
            typeof n === "number" &&
            window.isNaN(n)
        );
    };
}
var a = 2 / "foo";
var b = "foo";
Number.isNaN(a); // true
Number.isNaN(b); // false——好！
 ```
实际上还有一个更简单的方法，即利用 `NaN` 不等于自身这个特点。`NaN` 是 `JavaScript` 中唯一一个不等于自身的值。
```javascript
if (!Number.isNaN) {
    Number.isNaN = function (n) {
        return n !== n;
    };
}
```
## 值和引用
略