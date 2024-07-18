
[【前】Redis](./Redis.md)   
[【后】Redis-List](./redis-List.md)
### 数据结构
``` c
typedef char *sds;

/* Note: sdshdr5 is never used, we just access the flags byte directly.
 * However is here to document the layout of type 5 SDS strings. */
struct __attribute__ ((__packed__)) sdshdr5 {
    unsigned char flags [^1]; /* 8位，低三位用来表示字符串的类型, 其他5位表示buf实际用到的字节数 */
    char buf[];
};
struct __attribute__ ((__packed__)) sdshdr8 {
    uint8_t len; /* buf实际用了多少字节 */
    uint8_t alloc; /* 实际分配了多少字节 */
    unsigned char flags; /* 8位，低三位用来表示字符串的类型, 其他5位未被使用 */
    char buf[];
};
struct __attribute__ ((__packed__)) sdshdr16 {
    uint16_t len; /* buf实际用了多少字节 */
    uint16_t alloc; /* 实际分配了多少字节 */
    unsigned char flags; /* 8位，低三位用来表示字符串的类型, 其他5位未被使用 */
    char buf[];
};
struct __attribute__ ((__packed__)) sdshdr32 {
    uint32_t len; /* buf实际用了多少字节 */
    uint32_t alloc; /* 实际分配了多少字节 */
    unsigned char flags; /* 8位，低三位用来表示字符串的类型, 其他5位未被使用 */
    char buf[];
};
struct __attribute__ ((__packed__)) sdshdr64 {
    uint64_t len; /* buf实际用了多少字节 */
    uint64_t alloc; /* 实际分配了多少字节 */
    unsigned char flags; /* 8位，低三位用来表示字符串的类型, 其他5位未被使用 */
    char buf[];
};
```
:question: 为什么有5,8,16,32,64这几种类型的结构体？   
:key: 为了节省内存。对于rednodejs 一个字符串占几个字节is内存是非常宝贵的，要尽量的节省内存。因为C语言中int有不同的长度，有的是1个字节（8位），有的是2个字节（16位），有的是4个字节（32位），有的是8个字节（64位），所以根据buf的长度来选择合适的结构体。   
:question: 为什么要用__attribute__ ((__packed__))?
:key: 为了防止编译器对结构体进行优化, 内存对齐[^2]。

### 特性
* 空间预分配
```
  如果对SDS进行修改之后，SDS的长度（也即是len属性的值）将小于1MB，那么程序分
配和len属性同样大小的未使用空间(free)。
  如果对SDS进行修改之后，SDS的长度将大于等于1MB，那么程序会分配1MB的未使用
空间。
```
* 惰性空间释放
```
惰性空间释放用于优化SDS的字符串缩短操作：当SDS的API需要缩短SDS保存的字符串
时，程序并不立即使用内存重分配来回收缩短后多出来的字节，而是使用free属性将这些字
节的数量记录起来，并等待将来使用
```
* 二进制安全
```
C字符串中的字符必须符合某种编码（比如ASCII），并且除了字符串的末尾之外，字符
串里面不能包含空字符，否则最先被程序读入的空字符将被误认为是字符串结尾，这些限制
使得C字符串只能保存文本数据，而不能保存像图片、音频、视频、压缩文件这样的二进制。所有SDS API都会以处理二进制的方式来处理SDS存放在buf数组里的数
据，程序不会对其中的数据做任何限制、过滤、或者假设，数据在写入时是什么样的，它被
读取时就是什么样，这也是我们将SDS的buf属性称为字节数组的原因——Redis不是用这个数组来保存字符，
而是用它来保存一系列二进制数据
数据
```

### 与C字符串的的区别
　 <table>
　　　        <thead>
　　　            <tr>
　　　                <th>C字符串</th>
　　　                <th>SDS</th>
　　　            </tr>
　　　        </thead>
　　　        <tbody>
　　　            <tr>
　　　                <td>获取字符串长度的时间复杂度为O(N)</td>
　　　                <td>获取字符串长度的时间复杂度为O(1)</td>
　　　            </tr>
　　　            <tr>
　　　                <td>API是不安全的，可能会造成缓冲区溢出</td>
　　　                <td>API是安全的，不会造成缓冲区溢出</td>
　　　            </tr>
　　　            <tr>
　　　                <td>修改字符串长度N次必然需要执行N次内存重新分配</td>
　　　                <td>修改字符串长度N次最多需要执行N次内存分配</td>
　　　            </tr>
　　　            <tr>
　　　                <td>只能保存文本数据</td>
　　　                <td>可以保存文本或者二进制数据</td>
　　　            </tr>
　　　            <tr>
　　　                <td>可以使用所有<string.h>库中的函数</td>
 　　　               <td>可以使用一部分<string.h>库中的函数</td>
　　　            </tr>
 　　　       </tbody>
　　　    </table>

[【前】Redis](./Redis.md)   
[【后】Redis-List](./redis-List.md)   

[^1]: C语言里一个char占一个字节（8位）。
[^2]: 内存对齐：结构体的成员变量在内存中的地址是按照成员变量的声明顺序来的，但是在内存中的地址并不是按照声明顺序来的，而是按照成员变量的类型和大小来的。比如一个int类型的变量在内存中的地址是4的倍数，一个char类型的变量在内存中的地址是1的倍数。这样做的目的是为了提高内存的读取速度。