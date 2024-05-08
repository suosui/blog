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
db.setProfilingLevel(2) // 设置日志级别
db.system.profile.find({"ns" : {$nin:["test.oplog.rs","test.system.profile"]},}).limit(5).sort( { ts : -1 } ).pretty()
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