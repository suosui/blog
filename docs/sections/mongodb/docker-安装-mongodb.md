### 拉去mongodb镜像
```shell
docker pull mongo
```
### 创建配置文件及目录
```shell
mkdir -p /data/mongo/conf # 在macos上需要把/data换成/Users/username username是你的用户名
mkdir -p /data/mongo/data # 在macos上需要把/data换成/Users/username username是你的用户名
mkdir -p /data/mongo/log # 在macos上需要把/data换成/Users/username username是你的用户名
```
```shell
cd /data/mongo/conf
vim mongodb.conf
```

```shell
#端口
port=27017
#数据库文件存放目录
dbpath=/data/mongo/data
#日志文件存放路径
logpath=/data/mongo/log
#使用追加方式写日志
logappend=true
#以守护线程的方式运行，创建服务器进程
fork=true
#最大同时连接数
maxConns=100
#不启用验证
#noauth=true
#每次写入会记录一条操作日志
journal=true
#存储引擎有mmapv1、wiredTiger、mongorocks
storageEngine=wiredTiger
#访问IP
bind_ip=0.0.0.0
#用户验证
#auth=true
```

#### 启动mongodb
```shell
docker run -d -p 27017:27017 -v /data/mongo/data:/data/db -v /data/mongo/conf:/data/conf -v /data/mongo/log:/data/log --name mongo mongo
```