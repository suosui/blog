# 数据结构
```c
typedef struct dictht {//哈希表
    dictEntry **table;      // 哈希表数组
    unsigned long size;     // 哈希表大小
    unsigned long sizemask; // 哈希表大小掩码，用于计算索引值
                            // 总是等于size-1
    unsigned long used;     // 该哈希表已有节点的数量
}
// table属性是一个数组，数组中的每个元素都是一个指向dictEntry结构的指针，每个dictEntry结构保存着一个键值对。
// size属性记录了哈希表的大小，也即是table数组的大小，而used属性则记录了哈希表目前已有节点（键值对）的数量。
// sizemask属性的值总是等于size1，这个属性和哈希值一起决定一个键应该被放到table数组的哪个索引上面。
```
```c
typedef struct dictEntry {//哈希表节点
    void *key;                  // 键
    union {                     // 值
        void *val;
        uint64_tu64;
        int64_ts64;
    } v;
    struct dictEntry *next;    // 指向下个哈希表节点，形成链表
} dictEntry;
// key属性保存着键值对中的键，而v属性则保存着键值对中的值，其中键值对的值可以是一个指针，或者是一个uint64_t整数，又或者是一个int64_t整数。
// next属性是指向另一个哈希表节点的指针，这个指针可以将多个哈希值相同的键值对连接在一次，以此来解决键冲突（collision）的问题。
```
```c
typedef struct dict {//字典
    dictType *type; // 类型特定函数
    void *privdata; // 私有数据
    dictht ht[2];   // 哈希表
    int rehashidx;  // rehas索引 当rehash不进行时，值为-1
} dict;
//type属性和privdata属性是针对不同类型的键值对，为创建多态字典而设置的。type属性是一个指向dictType结构的指针，每个dictType结构保存了一簇用于操作特定类型键值对的函数，Redis会为用途不同的字典设置不同的类型特定函数。
// 而privdata属性则保存了需要传给那些类型特定函数的可选参数。
// ht属性是一个包含两个项的数组，数组中的每个项都是一个dictht哈希表，一般情况下，字典只使用ht[0]哈希表，ht[1]哈希表只会在对ht[0]哈希表进行rehash时使用。
// 除了ht[1]之外，另一个和rehash有关的属性就是rehashidx，它记录了rehash目前的进度，如果目前没有在进行rehash，那么它的值为-1。
```
```c
typedef struct dictType {
    unsigned int (*hashFunction)(const void *key);    // 计算哈希值的函数
    void *(*keyDup)(void *privdata, const void *key); // 复制键的函数
    void *(*valDup)(void *privdata, const void *obj); // 复制值的函数
    int (*keyCompare) (void *privdata, const void *key1, const void *key2); // 对比键的函数
    void (*keyDestructor)(void *privdata, void *key); // 销毁键的函数
    void (*valDestructor)(void *privdata, void *obj); // 销毁值的函数
} dictType;

```
# 哈希算法

当要将一个新的键值对添加到字典里面时，程序需要先根据键值对的键计算出哈希值和
索引值，然后再根据索引值，将包含新键值对的哈希表节点放到哈希表数组的指定索引上
面。
Redis计算哈希值和索引值的方法如下：

* 使用字典设置的哈希函数，计算键key 的哈希值    
````hash = dict->type->hashFunction(key);````     
* 使用哈希表的sizemask 属性和哈希值，计算出索引值    
* 根据情况不同，ht[x] 可以是ht[0] 或者ht[1]    
 ```index = hash & dict->ht[x].sizemask;```    

当字典被用作数据库的底层实现，或者哈希键的底层实现时，Redis使用 *MurmurHash2* [原理](https://huagetai.github.io/posts/fcfde8ff/) [代码](https://blog.csdn.net/xyblog/article/details/50593648) 算法来计算键的哈希值。

# 解决冲突
当有两个或以上数量的键被分配到了哈希表数组的同一个索引上面时，我们称这些键发
生了冲突（collision）。
Redis的哈希表使用链地址法（separate chaining）来解决键冲突，每个哈希表节点都有一个next指针，多个哈希表节点可以用next指针构成一个单向链表，被分配到同一个索引上的多个节点可以用这个单向链表连接起来，这就解决了键冲突的问题。
举个例子，假设程序要将键值对k2和v2添加到哈希表里面，并且计算得出k2的索引值为2，那么键k1和k2将产生冲突，而解决冲突的办法就是使用next指针将键k2和k1所在的节点连接起来。因为dictEntry节点组成的链表没有指向链表表尾的指针，所以为了速度考虑，程序总是将新节点添加到链表的表头位置（复杂度为O（1）），排在其他已有节点的前面。

# rehash
随着操作的不断执行，哈希表保存的键值对会逐渐地增多或者减少，为了让哈希表的负载因子（load factor）维持在一个合理的范围之内，当哈希表保存的键值对数量太多或者太少时，程序需要对哈希表的大小进行相应的扩展或者收缩。

扩展和收缩哈希表的工作可以通过执行rehash（重新散列）操作来完成，Redis对字典的
哈希表执行rehash的步骤如下：
1. 为字典的ht[1]哈希表分配空间，这个哈希表的空间大小取决于要执行的操作，以及
ht[0]当前包含的键值对数量（也即是ht[0].used属性的值）：
* 如果执行的是扩展操作，那么ht[1]的大小为第一个大于等于ht[0].used*2的2
n（2的n次
方幂）；
* 如果执行的是收缩操作，那么ht[1]的大小为第一个大于等于ht[0].used的2
n。
2. 将保存在ht[0]中的所有键值对rehash到ht[1]上面：rehash指的是重新计算键的哈希值
和索引值，然后将键值对放置到ht[1]哈希表的指定位置上。
3. 当ht[0]包含的所有键值对都迁移到了ht[1]之后（ht[0]变为空表），释放ht[0]，将
ht[1]设置为ht[0]，并在ht[1]新创建一个空白哈希表，为下一次rehash做准备。

## 哈希表的扩展与收缩
* 服务器目前没有在执行BGSAVE命令或者BGREWRITEAOF命令，并且哈希表的负载
因子大于等于1。
* 服务器目前正在执行BGSAVE命令或者BGREWRITEAOF命令，并且哈希表的负载因
子大于等于5。

其中哈希表的负载因子可以通过公式：
```c
// 负载因子= 哈希表已保存节点数量/哈希表大小
load_factor = ht[0].used / ht[0].size
```
根据BGSAVE命令或BGREWRITEAOF命令是否正在执行，服务器执行扩展操作所需的
负载因子并不相同，这是因为在执行BGSAVE命令或BGREWRITEAOF命令的过程中，Redis
需要创建当前服务器进程的子进程，而大多数操作系统都采用写时复制（copy-on-write）技术来优化子进程的使用效率，所以在子进程存在期间，服务器会提高执行扩展操作所需的负
载因子，从而尽可能地避免在子进程存在期间进行哈希表扩展操作，这可以避免不必要的内
存写入操作，最大限度地节约内存。    
*另一方面，当哈希表的负载因子小于0.1时，程序自动开始对哈希表执行收缩操作。*

# 渐进式rehash
扩展或收缩哈希表需要将ht[0]里面的所有键值对rehash到ht[1]里面，但
是，这个rehash动作并不是一次性、集中式地完成的，而是分多次、渐进式地完成的。    

这样做的原因在于，如果ht[0]里只保存着四个键值对，那么服务器可以在瞬间就将这些
键值对全部rehash到ht[1]；但是，如果哈希表里保存的键值对数量不是四个，而是四百万、
四千万甚至四亿个键值对，那么要一次性将这些键值对全部rehash到ht[1]的话，庞大的计算
量可能会导致服务器在一段时间内停止服务。    

因此，为了避免rehash对服务器性能造成影响，服务器不是一次性将ht[0]里面的所有键
值对全部rehash到ht[1]，而是分多次、渐进式地将ht[0]里面的键值对慢慢地rehash到ht[1]。    

以下是哈希表渐进式rehash的详细步骤：
* 为ht[1]分配空间，让字典同时持有ht[0]和ht[1]两个哈希表
* 在字典中维持一个索引计数器变量rehashidx，并将它的值设置为0，表示rehash工作
正式开始
* 在rehash进行期间，每次对字典执行添加、删除、查找或者更新操作时，程序除了执
行指定的操作以外，还会顺带将ht[0]哈希表在rehashidx索引上的所有键值对rehash到ht[1]，
当rehash工作完成之后，程序将rehashidx属性的值增一
* 随着字典操作的不断执行，最终在某个时间点上，ht[0]的所有键值对都会被rehash至
ht[1]，这时程序将rehashidx属性的值设为-1，表示rehash操作已完成

渐进式rehash的好处在于它采取分而治之的方式，将rehash键值对所需的计算工作均摊
到对字典的每个添加、删除、查找和更新操作上，从而避免了集中式rehash而带来的庞大计
算量。

## 渐进式rehash
因为在进行渐进式rehash的过程中，字典会同时使用ht[0]和ht[1]两个哈希表，所以在渐
进式rehash进行期间，字典的删除（delete）、查找（find）、更新（update）等操作会在两
个哈希表上进行。例如，要在字典里面查找一个键的话，程序会先在ht[0]里面进行查找，如
果没找到的话，就会继续到ht[1]里面进行查找，诸如此类    

另外，在渐进式rehash执行期间，新添加到字典的键值对一律会被保存到ht[1]里面，而
ht[0]则不再进行任何添加操作，这一措施保证了ht[0]包含的键值对数量会只减不增，并随着
rehash操作的执行而最终变成空表

