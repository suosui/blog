# 介绍
字符串对象的编码可以是int、raw或者embstr。
* 如果一个字符串对象保存的是整数值，并且这个整数值可以用long类型来表示，那么字符串对象会将整数值保存在字符串对象结构的ptr属性里面（将void*转换成long），并将字符串对象的编码设置为int。

```shell
redis> SET number 123
OK
redis> OBJECT ENCODING number
"int"
```

```
┌───────────────────────┐
│      redisObject      │
|───────────────────────|
│         type          │
|     REDIS_STRING      |
|───────────────────────|
│        encoding       │
|   REDIS_ENCODING_INT  |
|───────────────────────|
│          ptr          │--> 123
|───────────────────────|
│          ...          │
└───────────────────────┘
     int编码字符串对象
```

* 如果字符串对象保存的是一个字符串值，并且这个字符串值的长度大于32字节，那么字
符串对象将使用一个简单动态字符串（SDS）来保存这个字符串值，并将对象的编码设置为
raw。

```shell
redis> SET story "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife..."
OK
redis> STRLEN story
(integer) 37
redis> OBJECT ENCODING story
"raw"
```

```
┌───────────────────────┐
│      redisObject      │
|───────────────────────|          ┌────────┐
│         type          │      ->  | sdshdr |
|     REDIS_STRING      |     /    |────────|
|───────────────────────|    /     |  free  |
│        encoding       │   /      |   0    |
|   REDIS_ENCODING_RAW  |  /       |────────|
|───────────────────────| /        |  len   |
│          ptr          │/         |   37   |
|───────────────────────|          |────────|   ┌─────────────────────────────┐
│          ...          │          |  buf   |-> |'I'|'t'|' '|'i'|'is'|...|'\0'|
└───────────────────────┘          └────────┘   └─────────────────────────────┘
                              raw编码的字符串对象
```

* 如果字符串对象保存的是一个字符串值，并且这个字符串值的长度小于等于32字节，那
么字符串对象将使用embstr编码的方式来保存这个字符串值。

```shell
redis> SET msg "hello"
OK
redis> OBJECT ENCODING msg
"embstr"
```

```
┌─────────────────────────────┐──────────────────┐
│      redisObject            │         sdshdr   |
|─────────────────────────────|──────────────────|
│ type │ encoding | prt | ... | free | len | buf |
└────────────────────────────────────────────────┘   
           embstr编码创建的内存块结构
```

embstr编码是专门用于保存短字符串的一种优化编码方式，这种编码和raw编码一样，
都使用redisObject结构和sdshdr结构来表示字符串对象，但raw编码会调用两次内存分配函数来分别创建redisObject结构和sdshdr结构，而embstr编码则通过调用一次内存分配函数来分配一块连续的空间，空间中依次包含redisObject和sdshdr两个结构.

> embstr编码的字符串对象在执行命令时，产生的效果和raw编码的字符串对象执行命令
时产生的效果是相同的，但使用embstr编码的字符串对象来保存短字符串值有以下好处:
1. embstr编码将创建字符串对象所需的内存分配次数从raw编码的两次降低为一次。
2. 释放embstr编码的字符串对象只需要调用一次内存释放函数，而释放raw编码的字符串
对象需要调用两次内存释放函数。
3. 因为embstr编码的字符串对象的所有数据都保存在一块连续的内存里面，所以这种编码
的字符串对象比起raw编码的字符串对象能够更好地利用缓存带来的优势。

最后要说的是，可以用long double类型表示的浮点数在Redis中也是作为字符串值来保存
的。如果我们要保存一个浮点数到字符串对象里面，那么程序会先将这个浮点数转换成字符
串值，然后再保存转换所得的字符串值, 在有需要的时候，程序会将保存在字符串对象里面的字符串值转换回浮点数值，执行某些操作，然后再将执行操作所得的浮点数值转换回字符串值，并继续保存在字符串对象里面。

``` shell
redis> SET pi 3.14
OK
redis> OBJECT ENCODING pi
"embstr"

redis> INCRBYFLOAT pi 2.0
"5.14"
redis> OBJECT ENCODING pi
"embstr"
```

# 编码转换
int编码的字符串对象和embstr编码的字符串对象在条件满足的情况下，会被转换为raw
编码的字符串对象。    
* 对于int编码的字符串对象来说，如果我们向对象执行了一些命令，使得这个对象保存的
不再是整数值，而是一个字符串值，那么字符串对象的编码将从int变为raw。

```shell
redis> SET number 122
OK
redis> OBJECT ENCODING number
"int"
redis> APPEND number " is a good number!"
(integer) 23
redis> GET number
"122 is a good number!"
redis> OBJECT ENCODING number
"raw"
```

* 因为Redis没有为embstr编码的字符串对象编写任何相应的修改程序（只有int编码的字符串对象和raw编码的字符串对象有这些程序），所以embstr编码的字符串对象实际上是只读的。当我们对embstr编码的字符串对象执行任何修改命令时，程序会先将对象的编码从embstr转换成raw，然后再执行修改命令。因为这个原因，embstr编码的字符串对象在执行修改命令之后，总会变成一个raw编码的字符串对象。
