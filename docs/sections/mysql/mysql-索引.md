### B+树索引

* 每个索引都对应一棵B+树，B+树分为好多层，最下边一层是叶子节点，其余的是内节点。所有用户记录都存储在B+树的叶子节点，所有目录项记录都存储在内节点。

* `InnoDB`存储引擎会自动为主键（如果没有它会自动帮我们添加）建立聚簇索引，聚簇索引的叶子节点包含完整的用户记录。

* 我们可以为自己感兴趣的列建立二级索引，二级索引的叶子节点包含的用户记录由索引列 + 主键组成，所以如果想通过二级索引来查找完整的用户记录的话，需要通过回表操作，也就是在通过二级索引找到主键值之后再到聚簇索引中查找完整的用户记录。

* B+树中每层节点都是按照索引列值从小到大的顺序排序而组成了双向链表，而且每个页内的记录（不论是用户记录还是目录项记录）都是按照索引列的值从小到大的顺序而形成了一个单链表。如果是联合索引的话，则页面和记录先按照联合索引前边的列排序，如果该列值相同，再按照联合索引后边的列排序。

* 通过索引查找记录是从B+树的根节点开始，一层一层向下搜索。由于每个页面都按照索引列的值建立了`Page Directory`（页目录），所以在这些页面中的查找非常快。

### 索引的代价

* 空间上的代价  
这个是显而易见的，每建立一个索引都要为它建立一棵B+树，每一棵B+树的每一个节点都是一个数据页，一个页默认会占用16KB的存储空间，一棵很大的B+树由许多数据页组成，那可是很大的一片存储空间呢。

* 时间上的代价  
每次对表中的数据进行增、删、改操作时，都需要去修改各个B+树索引。而且我们讲过，B+树每层节点都是按照索引列的值从小到大的顺序排序而组成了双向链表。不论是叶子节点中的记录，还是内节点中的记录（也就是不论是用户记录还是目录项记录）都是按照索引列的值从小到大的顺序而形成了一个单向链表。而增、删、改操作可能会对节点和记录的排序造成破坏，所以存储引擎需要额外的时间进行一些记录移位，页面分裂、页面回收啥的操作来维护好节点和记录的排序。如果我们建了许多索引，每个索引对应的B+树都要进行相关的维护操作，这还能不给性能拖后腿么？

### 建立索引需要注意

1. B+树索引适用于下边这些情况：
* 全值匹配
* 匹配左边的列
* 匹配范围值
* 精确匹配某一列并范围匹配另外一列
* 用于排序
* 用于分组

2. 在使用索引时需要注意下边这些事项：
* 只为用于搜索、排序或分组的列创建索引
* 为列的基数大的列创建索引
* 索引列的类型尽量小
* 可以只对字符串值的前缀建立索引
* 只有索引列在比较表达式中单独出现才可以适用索引
* 为了尽可能少的让聚簇索引发生页面分裂和记录移位的情况，建议让主键拥有AUTO_INCREMENT属性。
* 定位并删除表中的重复和冗余索引
* 尽量使用覆盖索引进行查询，避免回表带来的性能损耗。