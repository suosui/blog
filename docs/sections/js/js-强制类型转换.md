# 强制类型转换

* `JavaScript` 是一种动态类型语言，变量没有类型限制，可以随时赋予任意值。  
* 虽然变量的数据类型是不确定的，但是各种运算符对数据类型是有要求的。如果运算符发现，运算子的类型与预期不符，就会自动转换类型。比如，减法运算符预期左右两侧的运算子应该是数值，如果不是，就会自动将它们转为数值。

## 值类型转换
将值从一种类型转换为另一种类型通常称为类型转换（`type casting`），这是显式的情况；隐式的情况称为强制类型转换（`coercion`）。  
也可以这样来区分：类型转换发生在静态类型语言的编译阶段，而强制类型转换则发生在动态类型语言的运行时（`runtime`）。  
二者的区别显而易见：我们能够从代码中看出哪些地方是显式强制类型转换，而隐式强制类型转换则不那么明显，通常是某些操作产生的副作用。  
例如：
```javascript
var a = 42;
var b = a + ""; // 隐式强制类型转换
var c = String( a ); // 显式强制类型转换
```
对变量 `b` 而言，强制类型转换是隐式的；由于 `+` 运算符的其中一个操作数是字符串，所以是字符串拼接操作，结果是数字 `42` 被强制类型转换为相应的字符串 `"42"`。  
而 `String(..)` 则是将 `a` 显式强制类型转换为字符串。  
## 抽象值操作
介绍显式和隐式强制类型转换之前，我们需要掌握字符串、数字和布尔值之间类型转换的基本规则。`ES5` 规范第 9 节中定义了一些“抽象操作”（即“仅供内部使用的操作”）和转换规则。这里我们着重介绍 `ToString`、`ToNumber` 和 `ToBoolean`，附带讲一讲 `ToPrimitive`。

## toString
规范的 9.8 节中定义了抽象操作 `ToString`，它负责处理非字符串到字符串的强制类型转换。
* 基本类型值的字符串化规则为：`null` 转换为 `"null"`，`undefined` 转换为 `"undefined"`，`true`转换为 `"true"`。
* 数字的字符串化则遵循通用规则，不过极小和极大的数字使用指数形式:
```javascript
// 1.07 连续乘以七个 1000
var a = 1.07 * 1000 * 1000 * 1000 * 1000 * 1000 * 1000 * 1000;
// 七个1000一共21位数字
a.toString(); // "1.07e21"
```

* 对普通对象来说，除非自行定义，否则 `toString()`（`Object.prototype.toString()`）返回内部属性 `[[Class]]` 的值，如 "`[object Object]`"。如果对象有自己的 toString() 方法，字符串化时就会调用该方法并使用其返回值。

* 数组的默认 `toString()` 方法经过了重新定义，将所有单元字符串化以后再用 `","` 连接起来：
```javascript
var a = [1,2,3];
a.toString(); // "1,2,3"
```

* `JSON.stringify(..)` 在将 `JSON` 对象序列化为字符串时也用到了 `ToString`。对大多数简单值来说，JSON 字符串化和 `toString()` 的效果基本相同，只不过序列化的结果总是字符串：
```javascript
JSON.stringify( 42 ); // "42"
JSON.stringify( "42" ); // ""42"" （含有双引号的字符串）
JSON.stringify( null ); // "null"
JSON.stringify( true ); // "true"
```
所有安全的 `JSON` 值（`JSON-safe`）都可以使用 `JSON.stringify(..)` 字符串化。安全的`JSON` 值是指能够呈现为有效 `JSON` 格式的值。为了简单起见，我们来看看什么是不安全的 `JSON` 值。`undefined`、`function`、`symbol（ES6+`）和`包含循环引用`（对象之间相互引用，形成一个无限循环）的对象都不符合 `JSON`结构标准，支持 `JSON` 的语言无法处理它们。    

1) `JSON.stringify(..)` 在对象中遇到 `undefined`、`function` 和 `symbol` 时会自动将其忽略，在
数组中则会返回 `null`（以保证单元位置不变）。例如：
```javascript
JSON.stringify( undefined );                   // undefined
JSON.stringify( function(){} );                // undefined
JSON.stringify([1,undefined,function(){},4]);  // "[1,null,null,4]"
JSON.stringify({ a:2, b:function(){} });       // "{"a":2}"
```
2) 对包含循环引用的对象执行 `JSON.stringify(..)` 会出错。
3) 如果对象中定义了 `toJSON()` 方法，`JSON` 字符串化时会首先调用该方法，然后用它的返回值来进行序列化。如果要对含有非法 `JSON` 值的对象做字符串化，或者对象中的某些值无法被序列化时，就需要定义 `toJSON()` 方法来返回一个安全的 `JSON` 值。例如：
```javascript
var o = {};
var a = {
    b: 42,
    c: o,
    d: function () { }
};
// 在a中创建一个循环引用
o.e = a;
// 循环引用在这里会产生错误
// JSON.stringify( a );
// 自定义的JSON序列化
a.toJSON = function () {
    // 序列化仅包含b
    return { b: this.b };
};
JSON.stringify(a); // "{"b":42}"
```
很多人误以为 `toJSON()` 返回的是 `JSON` 字符串化后的值，其实不然，除非我们确实想要对字符串进行字符串化（通常不会！）。`toJSON()` 返回的应该是一个适当的值，可以是任何类型，然后再由 `JSON.stringify(..)` 对其进行字符串化。也就是说，`toJSON()` 应该“返回一个能够被字符串化的安全的 `JSON` 值”，而不是“返回一个 `JSON` 字符串”。

### ToNumber
有时我们需要将非数字值当作数字来使用，比如数学运算。为此 `ES5` 规范在 9.3 节定义了抽象操作 `ToNumber`。  
* 其中 `true` 转换为 `1`，`false` 转换为 `0`。`undefined` 转换为 `NaN`，`null` 转换为 `0`。  
* `ToNumber` 对字符串的处理基本遵循数字常量的相关规则 / 语法。处理失败时返回 `NaN`（处理数字常量失败时会产生语法错误）。不同之处是 `ToNumber` 对以 `0` 开头的`十六进制`数并不按`十六进制`处理。  
* 对象（包括数组）会首先被转换为相应的基本类型值，如果返回的是非数字的基本类型值，则再遵循以上规则将其强制转换为数字。为了将值转换为相应的基本类型值，抽象操作 `ToPrimitive`（参见 ES5 规范 9.1 节）会首先（通过内部操作 `DefaultValue`，参见 `ES5` 规范 8.12.8 节）检查该值是否有 valueOf() 方法。如果有并且返回基本类型值，就使用该值进行强制类型转换。如果没有就使用 `toString()`的返回值（如果存在）来进行强制类型转换。如果 `valueOf()` 和 `toString()` 均不返回基本类型值，会产生 `TypeError` 错误。例如:
```javascript
var a = {
    valueOf: function () {
        return "42";
    }
};
var b = {
    toString: function () {
        return "42";
    }
};
var c = [4, 2];
c.toString = function () {
    return this.join(""); // "42"
};
Number(a); // 42
Number(b); // 42
Number(c); // 42
Number(""); // 0
Number([]); // 0
Number(["abc"]); // NaN
```

### ToBoolean

首先也是最重要的一点是，`JavaScript` 中有两个关键词 `true` 和 `false`，分别代表布尔类型中的真和假。我们常误以为数值 `1` 和 `0` 分别等同于 `true` 和 `false`。在有些语言中可能是这样，但在 `JavaScript` 中布尔值和数字是不一样的。虽然我们可以将 `1` 强制类型转换为 `true`，将 `0` 强制类型转换为 `false`，反之亦然，但它们并不是一回事。

1. 假值  
`ES5` 规范 9.2 节中定义了抽象操作 `ToBoolean`，列举了布尔强制类型转换所有可能出现的结果。
以下这些是假值：  
• `undefined`  
• `null`  
• `false`  
• `+0`、`-0` 和 `NaN`  
• `""`  
假值的布尔强制类型转换结果为 `false`。
2. 真值  
真值就是假值列表之外的值。

## 显示强制类型转换
显式强制类型转换是那些显而易见的类型转换，很多类型转换都属于此列。

### 字符串和数字之间的显式转换
字符串和数字之间的转换是通过 `String(..)` 和 `Number(..)` 这两个内建函数（原生构造函数）来实现的，请注意它们前面没有 `new` 关键字，并不创建封装对象。下面是两者之间的显式强制类型转换：
```javascript
var a = 42;
var b = String( a );
var c = "3.14";
var d = Number( c );
b; // "42"
d; // 3.14
```
`String(..)` 遵循前面讲过的 `ToString` 规则，将值转换为字符串基本类型。`Number(..)` 遵循前面讲过的 `ToNumber` 规则，将值转换为数字基本类型。

### 显示解析数字字符串
解析字符串中的数字和将字符串强制类型转换为数字的返回结果都是数字。但解析和转换两者之间还是有明显的差别。例如：
```javascript
var a = "42";
var b = "42px";
Number( a ); // 42
parseInt( a ); // 42
Number( b ); // NaN
parseInt( b ); // 42
```
解析允许字符串中含有非数字字符，解析按从左到右的顺序，如果遇到非数字字符就停止。而转换不允许出现非数字字符，否则会失败并返回 `NaN`。
### 显示转换为布尔值
与前面的 `String(..)` 和 `Number(..)` 一样，`Boolean(..)`（不带 `new`）是显式的 `ToBoolean` 强制类型转换：
```javascript
var a = "0";
var b = [];
var c = {};
var d = "";
var e = 0;
var f = null;
var g;
Boolean( a ); // true
Boolean( b ); // true
Boolean( c ); // true
Boolean( d ); // false
Boolean( e ); // false
Boolean( f ); // false
Boolean( g ); // false
```
虽然 `Boolean(..)` 是显式的，但并不常用。和前面讲过的 `+` 类似，一元运算符 `!` 显式地将值强制类型转换为布尔值。但是它同时还将真值反转为假值（或者将假值反转为真值）。所以显式强制类型转换为布尔值最常用的方法是 `!!`，因为第二个 `!` 会将结果反转回原值：
```javascript
var a = "0";
var b = [];
var c = {};
var d = "";
var e = 0;
var f = null;
var g;
!!a; // true
!!b; // true
!!c; // true
!!d; // false
!!e; // false
!!f; // false
!!g; // false
```
在 `if(..)..` 这样的布尔值上下文中，如果没有使用 `Boolean(..)` 和 `!!`，就会自动隐式地进行 `ToBoolean` 转换。建议使用 `Boolean(..)` 和 `!!` 来进行显式转换以便让代码更清晰易读。  
显式 `ToBoolean` 的另外一个用处，是在 `JSON` 序列化过程中将值强制类型转换为 `true` 或 `false`：
```javascript
var a = [
    1,
    function () { /*..*/ },
    2,
    function () { /*..*/ }
];
JSON.stringify(a); // "[1,null,2,null]"
JSON.stringify(a, function (key, val) {
    if (typeof val == "function") {
        // 函数的ToBoolean强制类型转换
        return !!val;
    }
    else {
        return val;
    }
});
// "[1,true,2,true]"
```

## 隐士强制类型转换

### 隐式地简化
略

### 字符串和数字之间的隐式强制类型转换
前面我们讲了字符串和数字之间的显式强制类型转换，现在介绍它们之间的隐式强制类型转换。先来看一些会产生隐式强制类型转换的操作。  
通过重载，`+` 运算符即能用于数字加法，也能用于字符串拼接。`JavaScript` 怎样来判断我们要执行的是哪个操作？例如： 
```javascript
var a = "42";
var b = "0";
var c = 42;
var d = 0;
a + b; // "420"
c + d; // 42
```
这里为什么会得到 `"420"` 和 `42` 两个不同的结果呢？通常的理解是，因为某一个或者两个操作数都是字符串，所以 `+` 执行的是字符串拼接操作。这样解释只对了一半实际情况要复杂得多。例如：
```javascript
var a = [1,2];
var b = [3,4];
a + b; // "1,23,4"
```
a 和 b 都不是字符串，但是它们都被强制转换为字符串然后进行拼接。原因何在？   

如果某个操作数是字符串或者能够通过以下步骤转换为字符串的话，+ 将进行拼接操作。如果其中一个操作数是对象（包括数组），则首先对其调用ToPrimitive 抽象操作（规范 9.1 节），该抽象操作再调用 [[DefaultValue]]（规范 8.12.8节），以数字作为上下文。

你或许注意到这与 `ToNumber` 抽象操作处理对象的方式一样（参见 [ToNumber](###ToNumber)）。因为数组的`valueOf()` 操作无法得到简单基本类型值，于是它转而调用 toString()。因此上例中的两个数组变成了 "1,2" 和 "3,4"。+ 将它们拼接后返回 "1,23,4"。

### 布尔值到数字的隐式强制类型转换
略

### 隐式强制类型转换为布尔值

现在我们来看看到布尔值的隐式强制类型转换，它最为常见也最容易搞错。  
相对布尔值，数字和字符串操作中的隐式强制类型转换还算比较明显。下面的情况会发生布尔值隐式强制类型转换。  

(1) `if (..)` 语句中的条件判断表达式。  
(2) `for ( .. ; .. ; .. )` 语句中的条件判断表达式（第二个）。  
(3) `while (..)` 和 `do..while(..)` 循环中的条件判断表达式。   
(4) `? :` 中的条件判断表达式。  
(5) 逻辑运算符 `||`（逻辑或）和 `&&`（逻辑与）左边的操作数（作为条件判断表达式）。  

例如：
```javascript
var a = 42;
var b = "abc";
var c;
var d = null;
if (a) {
    console.log("yep"); // yep
}
while (c) {
    console.log("nope, never runs");
}
c = d ? a : b;
c; // "abc"
if ((a && d) || c) {
    console.log("yep"); // yep
}
```
上例中的非布尔值会被隐式强制类型转换为布尔值以便执行条件判断。

#### || 和 &&



## 宽松等和严格等
## 抽象关系比较