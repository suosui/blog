### 1. 当前数据库操作
```javascript
db.currentOp()
```

### 2. 数据库连接情况
```javascript
db.serverStatus().connections
```

### 3. 慢查询

> **两个最常见的坑**
> 1. `system.profile` 是 **capped collection，默认只有 1MB**。按每条记录约 4KB 算只能存约 250 条；繁忙库上每秒上百次写入，**这个环形缓冲区 1~2 秒就绕一圈**。慢查询不是没记录，是记完一秒就被冲掉了 —— 不扩容根本查不到。
> 2. `.sort({ts: -1})` 是"**最近**的 N 条"，不是"**最慢**的 N 条"。要按代价排序，不是按时间。

#### 3.0 先确认现状

```javascript
use hb                          // profiling 是按库设置的，必须先切库
db.getProfilingStatus()         // 看 was(级别) / slowms / sampleRate
db.system.profile.stats()       // 看 maxSize(是不是 1MB) / count / avgObjSize
```

#### 3.1 配置 profiling

改 profile 集合大小必须先关 profiling 再重建（官方流程，drop 会丢掉现有采样）：

```javascript
use hb
db.setProfilingLevel(0)                                    // 关
db.system.profile.drop()                                   // 删
db.createCollection("system.profile",
  { capped: true, size: 256 * 1024 * 1024 })                // 重建 256MB
db.setProfilingLevel(1, { slowms: 100 })                    // 只记 >100ms
```

`level: 1` + `slowms: 100` = "只记慢的"。保留时长从 1 秒涨到几天，且不再被 0ms 噪音挤占。

- `level: 0` 关闭，`level: 1` 只记超过 `slowms` 的，`level: 2` 记全部。
- **别用 `slowms: 0` / `level: 2` 常驻**，那本身就是可观测的写入负担。
- `sampleRate` 采样的是**已超过 `slowms` 的那部分**操作，不是全量流量。想轻量抽样全部流量要写 `{ slowms: 0, sampleRate: 0.01 }`（全量的 1%）。
- 注意 `slowms` / `sampleRate` 是 profiler 和 **mongod 慢查询日志共用**的，改它会同时影响日志输出。

#### 3.2 筛选：按代价排，且必须带投影

profile 文档可能有几十 KB（内嵌大命令时单条能到 55KB），**不投影的话 20 条就是 200KB+**，客户端会被拖死。

```javascript
// ✗ 反例：这是"最近 5 条"，繁忙库上基本只能捞到噪音
db.system.profile.find({ns: {$nin: ["test.oplog.rs", "test.system.profile"]}})
  .limit(5).sort({ts: -1}).pretty()
```

**A. 最慢的 N 条**

```javascript
db.system.profile.find(
  {
    ns: { $ne: "hb.system.profile" },      // 排除"查慢查询"这个动作本身
    appName: { $ne: "Navicat" },           // 排除客户端工具
    millis: { $gte: 100 }
  },
  { ts:1, millis:1, op:1, ns:1, planSummary:1,
    keysExamined:1, docsExamined:1, nreturned:1, nModified:1,
    "storage.data.bytesRead":1, "storage.data.timeReadingMicros":1,
    queryHash:1, planCacheKey:1, _id:0 }
).sort({ millis: -1 }).limit(20)
```

**B. 全表扫描**

```javascript
db.system.profile.find(
  { planSummary: /COLLSCAN/, ns: { $ne: "hb.system.profile" } },
  { ts:1, millis:1, ns:1, docsExamined:1, nreturned:1, command:1, _id:0 }
).sort({ docsExamined: -1 }).limit(20)
```

`limit: 1` + `nreturned: 0` + `docsExamined` 很大 = **最典型的缺索引信号**：有索引时是点查，无索引时"找不到"必须扫完全表才能确认。

只看带 filter 的（绕开 `getMore`，因为 getMore 记录里没有 filter）：

```javascript
db.system.profile.find(
  { planSummary: /COLLSCAN/, op: { $in: ["query", "command"] },
    "command.getMore": { $exists: false },
    ns: { $ne: "hb.system.profile" } },
  { ts:1, ns:1, millis:1, docsExamined:1, nreturned:1,
    "command.filter":1, "command.pipeline":1, "command.sort":1, _id:0 }
).sort({ docsExamined: -1 }).limit(30)
```

**C. 扫描放大（扫一堆只返回几条）** —— 比单纯看 millis 更能发现隐患

```javascript
db.system.profile.aggregate([
  { $match: { ns: { $ne: "hb.system.profile" }, docsExamined: { $gt: 100 } } },
  { $project: {
      ts:1, ns:1, op:1, millis:1, planSummary:1, docsExamined:1, nreturned:1,
      ratio: { $divide: ["$docsExamined", { $max: [{ $ifNull: ["$nreturned", 1] }, 1] }] }
  } },
  { $match: { ratio: { $gte: 50 } } },
  { $sort: { ratio: -1 } }, { $limit: 20 }
])
```

**D. 磁盘读 —— 抓文档臃肿**

`storage` 字段只在发生真实磁盘 I/O（WiredTiger 缓存未命中）时才出现，天然高信噪比：

```javascript
db.system.profile.find(
  { "storage.data.bytesRead": { $exists: true } },
  { ts:1, millis:1, op:1, ns:1, planSummary:1, docsExamined:1, nModified:1,
    "storage.data.bytesRead":1, "storage.data.timeReadingMicros":1, _id:0 }
).sort({ "storage.data.timeReadingMicros": -1 }).limit(20)
```

**"扫得很少但读得很多" = 文档臃肿**，这是 `millis` 和 `docsExamined` 都看不出来的维度。
典型实例：`docsExamined: 8` / `nModified: 8` 却 `bytesRead: 457005`、`timeReadingMicros: 186342` —— 索引完美（IXSCAN 耗时 0ms），188ms 全花在 FETCH 把 8 个约 57KB 的胖文档拉进内存。这种情况加索引没用，要减文档体积。

**E. 内存排序 / 落盘排序**

```javascript
db.system.profile.find(
  { hasSortStage: true, ns: { $ne: "hb.system.profile" } },
  { ts:1, millis:1, ns:1, planSummary:1, "execStats.usedDisk":1,
    "execStats.totalDataSizeSorted":1, _id:0 }
).sort({ "execStats.totalDataSizeSorted": -1 }).limit(20)
```

`usedDisk: true` 说明排序超出了 100MB 内存上限落了盘。

**F. 按总耗时聚合 —— 实战里最该先跑的一条**

单看最慢的一条会误导：**一条 5ms 的语句跑 10000 次，比一条 188ms 贵得多**。按 `queryHash` 归组看总账：

```javascript
db.system.profile.aggregate([
  { $match: { ns: { $ne: "hb.system.profile" }, appName: { $ne: "Navicat" } } },
  { $group: {
      _id: { hash: "$queryHash", ns: "$ns", op: "$op", plan: "$planSummary" },
      count:          { $sum: 1 },
      totalMs:        { $sum: "$millis" },
      maxMs:          { $max: "$millis" },
      avgDocsExam:    { $avg: "$docsExamined" },
      avgReturned:    { $avg: "$nreturned" },
      totalBytesRead: { $sum: { $ifNull: ["$storage.data.bytesRead", 0] } }
  } },
  { $sort: { totalMs: -1 } },
  { $limit: 20 }
])
```

拿 `queryHash` 反查一条样本看具体语句：

```javascript
db.system.profile.findOne({ queryHash: "A300CFDE" }, { command: 1, _id: 0 })
```

高频低耗时的操作（次数极高、单次 0ms）只有这个视角能看见，按 millis 排序永远排不出来。

**G. 写放大排行（针对索引过载）**

```javascript
db.system.profile.aggregate([
  { $match: { op: { $in: ["insert", "update"] } } },
  { $group: {
      _id: "$ns",
      ops:  { $sum: 1 },
      keys: { $sum: { $ifNull: ["$keysInserted", 0] } },
      docs: { $sum: { $ifNull: ["$ninserted", 1] } }
  } },
  { $project: { ops:1, keys:1, docs:1,
      keysPerDoc: { $divide: ["$keys", { $max: ["$docs", 1] }] } } },
  { $sort: { keys: -1 } }
])
```

`keysPerDoc` 就是"每插入一个文档要维护几个索引项"。十几个字段的小文档却要写 25 个索引项，就是纯写入负担，配合 `$indexStats`（见第 15 节）确认哪些索引从没被用过。

#### 3.3 从 getMore 回溯到原始 find

`getMore` 记录里**没有 filter**，而且 `docsExamined` 只是单批的量。用 `lsid` 把整条游标时间线拉出来：

```javascript
db.system.profile.find(
  { "command.lsid.id": UUID("7b39762a-2394-4daa-bd69-167159e8b6c3") },
  { ts:1, op:1, ns:1, millis:1, docsExamined:1, nreturned:1,
    "command.find":1, "command.filter":1, "command.pipeline":1,
    "command.getMore":1, "command.batchSize":1, planSummary:1, _id:0 }
).sort({ ts: 1 })
```

对齐技巧：`getMore` 的 `batchSize` = 原 `limit` − 首批返回数（如 `899 = 1000 − 101`），可以据此确认是同一个游标。一次查询的真实扫描量要把 find 和它所有 getMore 加起来。

#### 3.4 更可靠的来源：mongod 日志

**mongod 默认就会把超过 `slowms` 的操作写进日志**，不需要开 profiler。日志文件不是 capped，能留几天到几周 —— 比 `system.profile` 可靠得多。日常巡检优先看日志，`system.profile` 留给需要 `execStats` 细节的专项排查。

4.4+ 是结构化 JSON 日志：

```shell
grep '"Slow query"' /var/log/mongodb/mongod.log \
| jq -c 'select(.attr.durationMillis > 200)
         | {t: .t."$date", ns: .attr.ns, ms: .attr.durationMillis,
            plan: .attr.planSummary, examined: .attr.docsExamined,
            returned: .attr.nreturned, read: .attr.storage.data.bytesRead}' \
| tail -50
```

4.2 及更早是纯文本，抓行尾耗时：

```shell
grep -E ' [0-9]{3,}ms$' /var/log/mongodb/mongod.log | tail -50
```

k8s 部署把路径换成 `kubectl logs <mongo-pod>`。

#### 3.5 索引与执行计划

```javascript
db.collection.getIndexes()                                   // 获取索引（动手前必看）
db.collection.countDocuments()                               // 对照 docsExamined 判断是否全扫
db.collection.createIndex({ username: 1 }, { unique: true }) // 创建索引
db.collection.dropIndex({ username: 1 })                     // 删除索引
db.collection.dropIndex('indexName')                         // 按名字删
db.collection.find(query).limit(1).explain("executionStats") // 看 totalDocsExamined / stage
db.currentOp({ active: true, secs_running: { $gte: 3 } })     // 现场抓正在跑的慢操作
db.killOp(opid)                                              // 杀死慢查询
```

副本集上建索引走滚动重建，或至少避开业务高峰。建完重跑 `explain`，确认 `stage` 从 `COLLSCAN` 变成 `IXSCAN`、`totalDocsExamined` 掉到接近 `nReturned`。

#### 3.6 顺手能筛出来的无效查询

```javascript
// 空 $in —— 永远匹配不到任何文档，纯浪费一次往返（缺 if (!arr.length) return 前置判断）
db.system.profile.find(
  { $or: [ { "command.q.taskKey.$in": { $size: 0 } },
           { "command.filter.$in": { $size: 0 } } ] },
  { ts:1, ns:1, op:1, "command.q":1, "command.filter":1, nMatched:1, _id:0 })

// nMatched / nreturned 为 0 却扫了很多 —— 判空缺失或缺索引
db.system.profile.find(
  { docsExamined: { $gt: 100 },
    $or: [ { nreturned: 0 }, { nMatched: 0 } ],
    ns: { $ne: "hb.system.profile" } },
  { ts:1, ns:1, op:1, millis:1, docsExamined:1, nreturned:1,
    nMatched:1, planSummary:1, "command.filter":1, _id:0 }
).sort({ docsExamined: -1 }).limit(20)
```

另外注意 `$truncated` 字段：出现它说明命令大到触发了 profiler 截断（约 50KB），这本身就是"命令体积异常"的信号 —— 通常是 ORM 把整个文档/表单定义快照塞进了 `$set`。

#### 3.7 排查顺序小结

1. `getProfilingStatus()` + `system.profile.stats()` —— 确认采样配置和保留时长（**最常见的失败点**）
2. **F**（按 `queryHash` 总耗时）—— 找高频常客，不是找单条最慢
3. **B / C**（COLLSCAN、扫描放大）—— 找缺索引和增长中的债，这类往往还没到 100ms
4. **D**（`bytesRead`）—— 找文档臃肿，加索引解决不了的那类
5. **G** + `$indexStats` —— 找索引过载
6. `explain("executionStats")` 验证，重跑对应筛选确认指标下降

### 4. 操作日志
```javascript
db.oplog.rs.find().skip(1).limit(1).toArray()
```

### 5. 重启mongo
```shell
systemctl restart mongod
```

### 6. 连接远程
```shell
mongo ip -u username -p
mongo -host 127.0.0.1:6230 -u username -p
```

### 7. 从库开放查询权限
```shell
rs.secondaryOk()
```

### 8. show collections size
```javascript
var collectionNames = db.getCollectionNames(),
  stats = [];
collectionNames.forEach(function (n) {
  stats.push(db[n].stats());
});
for (var c in stats) {
  // skip views
  if (!stats[c]["ns"]) continue;
  print(stats[c]["ns"].padEnd(40) + ": " + (''+stats[c]["size"]).padEnd(12) + " (" + (stats[c]["storageSize"] / 1073741824).toFixed(3).padStart(8) + "GB)");
}
```

### 9. 登录副本集
```shell
mongo "mongodb://primary-host:27017/?replicaSet=副本集名称"

```
or

```shell
mongo --host 副本集名称/host1:port1,host2:port2,host3:port3,host4:port4
```


### 10. 获取副本集状态
```shell
rs.status()
```

### 11. 在docker中restore mongo
```shell
docker cp /path/to/backup/backup.tar.gz container:/backup.tar.gz
docker exec -it container bash
tar -zxvf /backup.tar.gz
mongorestore --host localhost --port 27017 --db dbname --username username --password password /backup/dbname
```

### 11. 查询最新的记录
```javascript
db.collectionName.aggregate([
  {
    $match: {
        
    }
  },
  {
    $sort: {
        createdAt: -1 // 根据createdAt字段降序排序
    }
  },
  {
    $group: {
      _id: "$colum_key", // 
      latestRecord: { $first: "$$ROOT" } // 获取每组的最新记录
    }
  },
  {
    $replaceRoot: {
      newRoot: "$latestRecord" // 将结果格式调整为记录本身
    }
  }
])
```

### 12. mongorestore with gzip
```shell
mongorestore --host 127.0.0.1 --port 29019 --username 'admin' --password 'admin' --authenticationDatabase admin --gzip --dir pathToDumpDir 
```
```shell
mongorestore --host 127.0.0.1 --port 29019 --username 'admin' --password 'admin' --authenticationDatabase admin --gzip pathToDumpDir/dbName/  --db dbName
```
```shell
mongorestore --host 127.0.0.1 --port 29019  --gzip pathToDumpDir/dbName/collection.bson.gz --db dbName --collection collectionName
```

#### 13. mongodump with gzip
```shell
mongodump --host ip:host --db dbName --collection collectionName  --username test --password password --authenticationDatabase admin --gzip --out /
```

#### 14. 索引构建进度
```shell
tail -n 50 /data/mongodb/logs/mongodb.log | grep "index build"
```

#### 15. 索引命中状态
```javascript
db.cust_flowtask.aggregate([
  { $indexStats: {} }
])
```