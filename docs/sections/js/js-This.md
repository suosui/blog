
- [This]](#This)
 * [它的作用域](#它的作用域)
 * [调用位置](#调用位置)
 * [绑定规则](#绑定规则)
   * [默认绑定](默认绑定)
   * [隐士绑定](隐士绑定)
   * [显式绑定](显式绑定)
   * [new绑定](new绑定)
 * [优先级](#优先级)
 * [绑定例外](#绑定例外)


# 作用域

## 它的作用域
需要明确的是，`this` 在任何情况下都不指向函数的词法作用域。在 `JavaScript` 内部，作用域确实和对象类似，可见的标识符都是它的属性。但是作用域“对象”无法通过 `JavaScript` 代码访问，它存在于 `JavaScript` 引擎内部。
## 调用位置
在理解 `this` 的绑定过程之前，首先要理解调用位置：调用位置就是函数在代码中被调用的位置（而不是声明的位置）。只有仔细分析调用位置才能回答这个问题：这个 `this` 到底引用的是什么。  
通常来说，寻找调用位置就是寻找“函数被调用的位置”，但是做起来并没有这么简单，因为某些编程模式可能会隐藏真正的调用位置。  
最重要的是要分析调用栈（就是为了到达当前执行位置所调用的所有函数）。我们关心的调用位置就在当前正在执行的函数的前一个调用中。

## 绑定规则

### 默认绑定
### 隐士绑定
### 显式绑定
### new绑定

## 优先级

## 绑定例外