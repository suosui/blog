### 数据结构
```c
typedef struct listNode {
    struct listNode * prev; // 前置节点
    struct listNode * next; // 后置节点
    void * value;           // 节点的值
} listNode;

typedef struct list {
    listNode * head;                       // 表头结点
    listNode * tail;                       // 表位节点
    usigned long len;                      // 链表所包含的节点数量
    void *(*dup)(void *ptr);               // 节点值赋值函数
    void (*free)(void *ptr);               // 节点释放函数
    int (*match)(void *ptr, void *key);    // 节点值对比函数
} list;
```
### 特性
* 双端
```
链表节点带有prev和next指针，获取某个节点的前置节点和后置节点的复杂度都
是O（1）。
```
* 无环
```
表头节点的prev指针和表尾节点的next指针都指向NULL，对链表的访问以
NULL为终点。
```
* 带表头指针和表尾指针
```
通过list结构的head指针和tail指针，程序获取链表的表头节点
和表尾节点的复杂度为O（1）。
```
* 带链表长度计数器
```
程序使用list结构的len属性来对list持有的链表节点进行计数，程序
获取链表中节点数量的复杂度为O（1）
```
* 多态
```
链表节点使用void*指针来保存节点值，并且可以通过list结构的dup、free、
match三个属性为节点值设置类型特定函数，所以链表可以用于保存各种不同类型的值。
```