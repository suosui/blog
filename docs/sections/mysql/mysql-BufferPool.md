>出处： [MySQL 是怎样运行的：从根儿上理解 MySQL](https://juejin.cn/book/6844733769996304392)

1. 磁盘太慢，用内存作为缓存很有必要。

2. `Buffer Pool`本质上是`InnoDB`向操作系统申请的一段连续的内存空间，可以通过`innodb_buffer_pool_size`来调整它的大小。

3. `Buffer Pool`向操作系统申请的连续内存由控制块和缓存页组成，每个控制块和缓存页都是一一对应的，在填充足够多的控制块和缓存页的组合后，`Buffer Pool`剩余的空间可能产生不够填充一组控制块和缓存页，这部分空间不能被使用，也被称为碎片。

4. `InnoDB`使用了许多链表来管理`Buffer Pool`。

5. `free`链表中每一个节点都代表一个空闲的缓存页，在将磁盘中的页加载到`Buffer Pool`时，会从`free`链表中寻找空闲的缓存页。

6. 为了快速定位某个页是否被加载到`Buffer Pool`，使用表空间号 + 页号作为`key`，缓存页作为`value`，建立哈希表。

7. 在`Buffer Pool`中被修改的页称为脏页，脏页并不是立即刷新，而是被加入到`flush`链表中，待之后的某个时刻同步到磁盘上。

8. `LRU`链表分为`young`和`old`两个区域，可以通过`innodb_old_blocks_pct`来调节`old`区域所占的比例。首次从磁盘上加载到Buffer Pool的页会被放到old区域的头部，在`innodb_old_blocks_time`间隔时间内访问该页不会把它移动到`young`区域头部。在`Buffer Pool`没有可用的空闲缓存页时，会首先淘汰掉`old`区域的一些页。

9. 我们可以通过指定`innodb_buffer_pool_instances`来控制`Buffer Pool`实例的个数，每个`Buffer Pool`实例中都有各自独立的链表，互不干扰。

10. 自`MySQL 5.7.5`版本之后，可以在服务器运行过程中调整`Buffer Pool`大小。每个`Buffer Pool`实例由若干个`chunk`组成，每个`chunk`的大小可以在服务器启动时通过启动参数调整。

11. 可以用下边的命令查看`Buffer Pool`的状态信息：
```shell
SHOW ENGINE INNODB STATUS\G
```