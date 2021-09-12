# 原生函数

常用的原生函数有：
* String()  
* Number()  
* Boolean()
* Array()
* Object()
* Function()
* RegExp()
* Date()
* Error()
* Symbol()——ES6 中新加入的！

## 内部属性 [[Class]]
所有 `typeof` 返回值为 "`object`" 的对象（如数组）都包含一个内部属性 `[[Class]]`（我们可以把它看作一个内部的分类，而非传统的面向对象意义上的类）。这个属性无法直接访问，一般通过 `Object.prototype.toString(..)` 来查看。例如：

```javascript
Object.prototype.toString.call( [1,2,3] );
// "[object Array]"
Object.prototype.toString.call( /regex-literal/i );
// "[object RegExp]"
Object.prototype.toString.call( null );
// "[object Null]"
Object.prototype.toString.call( undefined );
// "[object Undefined]"
Object.prototype.toString.call( "abc" );
// "[object String]"
Object.prototype.toString.call( 42 );
// "[object Number]"
Object.prototype.toString.call( true );
// "[object Boolean]"
```

## 封装对象包装
封装对象（`object wrapper`） 扮演着十分重要的角色。 由于基本类型值没有 `.length` 和 `.toString()` 这样的属性和方法，需要通过封装对象才能访问，此时 `JavaScript` 会自动为基本类型值包装（`box` 或者 `wrap`）一个封装对象：
如果需要经常用到这些字符串属性和方法，比如在 `for` 循环中使用 `i < a.length`，那么从一开始就创建一个封装对象也许更为方便，这样 `JavaScript` 引擎就不用每次都自动创建了。  
但实际证明这并不是一个好办法，因为浏览器已经为 .length 这样的常见情况做了性能优化，直接使用封装对象来“提前优化”代码反而会降低执行效率。  
一般情况下，我们不需要直接使用封装对象。最好的办法是让 `JavaScript` 引擎自己决定什么时候应该使用封装对象。换句话说，就是应该优先考虑使用 `"abc"` 和 `42` 这样的基本类型值，而非 `new String("abc")` 和 `new Number(42)`。

### 封装对象释疑
使用封装对象时有些地方需要特别注意。  
比如 `Boolean`：
```javascript
var a = new Boolean( false );
if (!a) {
 console.log( "Oops" ); // 执行不到这里
}
```
我们为 `false` 创建了一个封装对象，然而该对象是真值（“`truthy`”，即总是返回 `true`），所以这里使用封装对象得到的结果和使用 `false` 截然相反。

## 拆封
如果想要得到封装对象中的基本类型值，可以使用 `valueOf()` 函数。  
在需要用到封装对象中的基本类型值的地方会发生隐式拆封。具体过程（即[强制类型转换](./js-强制类型转换.md)）。
```javascript
var a = new String( "abc" );
var b = a + ""; // b的值为"abc"
typeof a; // "object"
typeof b; // "string"
```

## 原生函数作为构造函数
关于数组（`array`）、对象（`object`）、函数（`function`）和正则表达式，我们通常喜欢以常量的形式来创建它们。实际上，使用常量和使用构造函数的效果是一样的（创建的值都是通过封装对象来包装）。如前所述，应该尽量避免使用构造函数，除非十分必要，因为它们经常会产生意想不到的结果。

### Array(..)

```javascript
var a = new Array( 1, 2, 3 );
a; // [1, 2, 3]
var b = [1, 2, 3];
b; // [1, 2, 3]
```
`Array` 构造函数只带一个数字参数的时候，该参数会被作为数组的预设长度（`length`），而非只充当数组中的一个元素。  
对此，不同浏览器的开发控制台显示的结果也不尽相同，这让问题变得更加复杂,例如：
```javascript
var a = new Array( 3 );
a.length; // 3
a;
```
> 在` Node(v14.17.5)` 中显示为 `[ <3 empty items> ]`（目前为止），这意味着它有三个值为 `undefined`的单元，但实际上单元并不存在（“空单元”这个叫法也同样不准确）。

从下面代码的结果可以看出它们的差别：
```javascript
var a = new Array( 3 );
var b = [ undefined, undefined, undefined ];
var c = [];
c.length = 3;
a;   // [ <3 empty items> ]
b;   // [ undefined, undefined, undefined ]
c;   // [ <3 empty items> ]
```
> 我们可以创建包含空单元的数组，如上例中的 c。只要将 length 属性设置为超过实际单元数的值，就能隐式地制造出空单元。另外还可以通过 delete b[1] 在数组 b 中制造出一个空单元。

更糟糕的是，上例中 `a` 和 `b` 的行为有时相同，有时又大相径庭：
```javascript
a.join( "-" ); // "--"
b.join( "-" ); // "--"
a.map(function(v,i){ return i; }); // [ <3 empty items> ]
b.map(function(v,i){ return i; }); // [ 0, 1, 2 ]
```
`a.map(..)` 之所以执行失败，是因为数组中并不存在任何单元，所以 `map(..)` 无从遍历。而`join(..)` 却不一样，它的具体实现可参考下面的代码：
```javascript
function fakeJoin(arr,connector) {
    var str = "";
    for (var i = 0; i < arr.length; i++) {
        if (i > 0) {
            str += connector;
        }
        if (arr[i] !== undefined) {
            str += arr[i];
        }
    }
    return str;
}
var a = new Array( 3 );
fakeJoin( a, "-" ); // "--"
```

从中可以看出，`join(..)` 首先假定数组不为空，然后通过 `length` 属性值来遍历其中的元素。而 `map(..)` 并不做这样的假定，因此结果也往往在预期之外，并可能导致失败。  
总之，永远不要创建和使用空单元数组。

### Object(..), Function(..), RegExp(..)
### Date(..), Error(..)
相较于其他原生构造函数，`Date(..)` 和 `Error(..)` 的用处要大很多，因为没有对应的常量形式来作为它们的替代。
### Symble(..)
### 原生原型
