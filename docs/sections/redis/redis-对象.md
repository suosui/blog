# 概念

&emsp;在前面的数个章节里，我们陆续介绍了Redis用到的所有主要数据结构，比如简单动态字符串（SDS）、双端链表、字典、压缩列表、整数集合等等。   
&emsp;Redis并没有直接使用这些数据结构来实现键值对数据库，而是基于这些数据结构创建了一个对象系统，这个系统包含字符串对象、列表对象、哈希对象、集合对象和有序集合对象这五种类型的对象，每种对象都用到了至少一种我们前面所介绍的数据结构。    
&emsp;通过这五种不同类型的对象，Redis可以在执行命令之前，根据对象的类型来判断一个对象是否可以执行给定的命令。使用对象的另一个好处是，我们可以针对不同的使用场景，为对象设置多种不同的数据结构实现，从而优化对象在不同场景下的使用效率。    
&emsp;除此之外，Redis的对象系统还实现了基于引用计数技术的内存回收机制，当程序不再使用某个对象的时候，这个对象所占用的内存就会被自动释放；另外，Redis还通过引用计数技术实现了对象共享机制，这一机制可以在适当的条件下，通过让多个数据库键共享同一个对象来节约内存。


### 对象的类型与编码
&emsp;Redis使用对象来表示数据库中的键和值，每次当我们在Redis的数据库中新创建一个键值对时，我们至少会创建两个对象，一个对象用作键值对的键（键对象），另一个对象用作键值对的值（值对象）    
&emsp;Redis中的每个对象都由一个redisObject结构表示，该结构中和保存数据有关的三个属性分别是type属性、encoding属性和ptr属性

```c
typedef struct redisObject {
    unsigned type:4;     // 类型
    unsigned encoding:4; // 编码
    void *ptr;           // 指向底层实现数据结构的指针
} robj;
// type：对象的type属性记录了对象的类型，这个属性的值可以是枚举列出的常量的其中一个
enum type {
    REDIS_STRING  // 字符串对象
    REDIS_LIST    // 列表对象
    REDIS_HASH    // 哈希对象
    REDIS_SET     // 集合对象
    REDIS_ZSET    // 有序集合对象
}
```

&emsp;对于Redis数据库保存的键值对来说，键总是一个字符串对象，而值则可以是字符串对象、列表对象、哈希对象、集合对象或者有序集合对象的其中一种    
````
当我们称呼一个数据库键为“字符串键”时，我们指的是“这个数据库键所对应的值为字
符串对象”；
````
```
当我们称呼一个键为“列表键”时，我们指的是“这个数据库键所对应的值为列表对象”
```

### 编码和底层实现
&emsp;对象的ptr指针指向对象的底层实现数据结构，而这些数据结构由对象的encoding属性决
定。    
&emsp;encoding属性记录了对象所使用的编码，也即是说这个对象使用了什么数据结构作为对
象的底层实现，这个属性的值可以是下列枚举列出的常量的其中一个。
```c
enum encoding {
    REDIS_ENCODING_INT         // long 类型的整数
    REDIS_ENCODING_EMBSTR      // embstr编码的动态字符串
    REDIS_ENCODING_RAW         // 简单动态字符串
    REDIS_ENDCODING_HT         // 字典
    REDIS_ENCODING_LINKEDLIST  // 双端列表
    REDIS_ENCODING_ZIPLIST     // 压缩列表
    REDIS_ENCODING_INTSET      // 整数集合
    REDIS_ENCODING_SKIPLIST    // 跳跃表和字典
}
```
&emsp;每种类型的对象都至少使用了两种不同的编码，表列出了每种类型的对象可以使用的
编码
 <table>
　　　        <thead>
　　　            <tr>
　　　                <th>类型</th>
　　　                <th>编码</th>
                      <th>对象</th>
　　　            </tr>
　　　        </thead>
　　　        <tbody>
　　　            <tr>
　　　                <td>REDIS_STRING</td>
　　　                <td>REDIS_ENCODING_INT</td>
                     <td>使用整数值实现的字符串对象</td>
　　　            </tr>
　　　            <tr>
　　　                <td>REDIS_STRING</td>
　　　                <td>REDIS_ENCODING_EMBSTR</td>
                     <td>使用embstr编码的简单动态字符串对象</td>
　　　            </tr>
　　　            <tr>
　　　              　<td>REDIS_STRING</td>
　　　                <td>REDIS_ENCODING_RAW</td>
                     <td>使用简单动态字符串实现的字符串对象</td>
　　　            </tr>
　　　            <tr>
　　　              　<td>REDIS_LIST</td>
　　　                <td>REDIS_ENCODING_ZIPLIST</td>
                     <td>使用压缩列表实现的列表对象</td>
　　　            </tr>
　　　            <tr>
　　　                 <td>REDIS_LIST</td>
　　　                <td>REDIS_ENCODING_LINKEDLIST</td>
                     <td>使用双端列表实现的列表对象</td>
　　　            </tr>
                    <tr>
　　　                 <td>REDIS_HASH</td>
　　　                <td>REDIS_ENCODING_ZIPLIST</td>
                     <td>使用压缩列表实现的哈希对象</td>
　　　            </tr>
                   <tr>
　　　                 <td>REDIS_HASH</td>
　　　                <td>REDIS_ENCODING_HT</td>
                     <td>使用字典实现的哈希对象</td>
　　　            </tr>
                   <tr>
　　　                 <td>REDIS_SET</td>
　　　                <td>REDIS_ENCODING_INTSET</td>
                     <td>使用整数集合实现的集合对象</td>
　　　            </tr>
                   <tr>
　　　                 <td>REDIS_SET</td>
　　　                <td>REDIS_ENCODING_HT</td>
                     <td>使用字典实现的集合对象</td>
　　　            </tr>
                   <tr>
　　　                 <td>REDIS_ZSET</td>
　　　                <td>REDIS_ENCODING_ZIPLIST</td>
                     <td>使用压缩列表实现的有序集合对象</td>
　　　            </tr>
                   <tr>
　　　                 <td>REDIS_ZSET</td>
　　　                <td>REDIS_ENCODING_SKIPLIST</td>
                     <td>使用跳跃表和字典实现的有序集合对象</td>
　　　            </tr>
 　　　       </tbody>
　　　    </table>
&emsp;通过encoding属性来设定对象所使用的编码，而不是为特定类型的对象关联一种固定的
编码，极大地提升了Redis的灵活性和效率，因为Redis可以根据不同的使用场景来为一个对
象设置不同的编码，从而优化对象在某一场景下的效率。    

&emsp;举个例子，在列表对象包含的元素比较少时，Redis使用压缩列表作为列表对象的底层实
现：    
```
·因为压缩列表比双端链表更节约内存，并且在元素数量较少时，在内存中以连续块方式
保存的压缩列表比起双端链表可以更快被载入到缓存中；
 ```   
```
·随着列表对象包含的元素越来越多，使用压缩列表来保存元素的优势逐渐消失时，对象
就会将底层实现从压缩列表转向功能更强、也更适合保存大量元素的双端链表上面；
其他类型的对象也会通过使用多种不同的编码来进行类似的优化
```
