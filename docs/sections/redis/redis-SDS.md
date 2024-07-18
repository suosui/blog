
[【前】Redis](./Redis.md)   
[【后】Redis-List](./redis-List.md)
### 数据结构
``` c
typedef char *sds;

/* Note: sdshdr5 is never used, we just access the flags byte directly.
 * However is here to document the layout of type 5 SDS strings. */
struct __attribute__ ((__packed__)) sdshdr5 {
    unsigned char flags; /* 8位，低三位用来表示字符串的类型, 其他5位表示buf实际用到的字节数 */
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
```
为了节省内存。对于Redis内存是非常宝贵的，要尽量的节省内存。因为C语言中int有不同的长度，有的是1个字节（8位），有的是2个字节（16位），有的是4个字节（32位），有的是8个字节（64位），所以根据buf的长度来选择合适的结构体。
```
:question: 为什么要用```__attribute__ ((__packed__))```?   
```
为了不让编译器对结构体进行优化, 内存对齐[^2],```__attribute__ ((__packed__))```就是告诉编译器不能进行内存对齐。    
```
:question:为什么不能对sds数据结构进行内存对齐呢？    
```
为了方便根据sds指针（准确的说是buf的起始地址）来推导出sdshdr结构体。用一个图片来说明这个结构体的内存布局:
```

```
                            sds(pointer)
                             ｜
                             ｜
                             ｜
      sdshdr5                ｜
           ┌──────────────── v ──────┐
           | ┌───────┐───────┐─────┐ |
           | | alloc | flags | buf | |
           | └───────┘───────┘─────┘ | 
           └─────────────|──────｜───┘
                         |      ｜
                _ _ _ _ _|      ｜_________     
               |                          |
               v  |                       |
   [0][0][1][0][1]|[0][0][0]              |
    higher 5 bit  | lower 3 bit           v
          flag(8bit)                [t][e][s][t][\0]
                                       char buf[]
```
```
如上图，Redis 使用字符串的时候，都是使用的 sds 这个指针（buf的起始地址）。Redis 只需要从 sds 指针往前找一个字节，就可以拿到这个 flags 值，通过读这个 flags 的低三位值，Redis 就可以知道当前的这个 sds 实例，是 5 种类型的哪一种(flag的低3位转换成十进制0、1、2、3、4 分别对应了 sdshdr5 到 64 这五个 sdshdr 结构体)。比如，图里面的 flags 低三位是 ```000```，那就是 sdshdr5，这样也就确定了 len 和 alloc 的具体长度都是 8 位。接下来 Redis 就可以继续往前读数据，拿到 len 和 alloc 值。根据这两个值，我们就可以从 sds 指针往后的位置，读写 buf 数组了。   
所以Redis的sds不能让编译器进行内存对齐，否则就无法通过sds指针来推导出sdshdr结构体了。
```   


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
[^2]: 内存对齐：元素是按照定义顺序一个一个放到内存中去的，但并不是紧密排列的。从结构体存储的首地址开始，每个元素放置到内存中时，它都会认为内存是按照自己的大小（通常它为4或8）来划分的，因此元素放置的位置一定会在自己宽度的整数倍上开始，这就是所谓的内存对齐。