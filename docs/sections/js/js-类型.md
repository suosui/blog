# JS类型

 ECMAScript 语言中所有的值都有一个对应的语言类型。ECMAScipt 语言类型包括 `Undefined`, `NUll`, `Boolean`, `String`, `Number`和`Object`。

为什么说 JavaScript 是否有类型也很重要呢？要正确合理地进行类型转换（参见第 4 章），我们必须掌握 JavaScript 中的各个类型及其内在行为。几乎所有的 JavaScript 程序都会涉及某种形式的强制类型转换，处理这些情况时我们需要有充分的把握和自信。

## 内置类型
JavaScript 有七种内置类型：
1. null (空值)
2. undefined (未定义)
3. boolean (布尔值)
4. number (数字)
5. string (字符串)
6. object (对象)
7. symbol (符号)

除对象之外，其他统称为“基本类型”。我们可以用typeof运算符来查看值的类型，它返回的是类型的字符串值。
```javascript
typeof undefined    === 'undefined'; // true;
typeof true         === 'boolean';   // true;
typeof 42           === 'number';    // true
typeof "42"         === 'string';    // true
typeof { life: 42 } === 'object';    // true

// ES6中新加如的类型
typeof Symbol()     === 'symbol';    // true
```
