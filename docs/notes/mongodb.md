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
mongo ip -u userName -p
mongo -host 127.0.0.1:6230 -u userName -p
```

### 7. 从库开放查询权限
```shell
rs.secondaryOk()
```