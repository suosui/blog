### 1. 当前数据库操作
```javascript
db.currentOp()
```

### 2. 数据库连接情况
```javascript
db.serverStatus().connections
```

### 3. 慢查询
```javascript
use test  // 选择数据库;
db.setProfilingLevel(2) // 设置日志级别
db.system.profile.find({"ns" : {$nin:["test.oplog.rs","test.system.profile"]},}).limit(5).sort( { ts : -1 } ).pretty()

db.collection.getIndexes() // 获取索引
db.collection.createIndex({ username: 1 }, { unique: true }) // 创建索引
db.collection.dropIndex({ username: 1 }) 或者 db.collection.dropIndex('indexName')// 删除索引
db.collection.find(query).explain("executionStats") // 查看查询执行情况
db.db.currentOp() // 查看当前操作
db.killOp(opid) // 杀死慢查询
```

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