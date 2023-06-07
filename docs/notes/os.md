### 1. 抓取端口号
```shell
netstat -tunlp | grep 端口号  # centos
lsof -i 端口号                # ubuntu,macos
```

### 2. 从远程下载文件
```shell
scp -r root@远程ip:/root/file.zip ~/Repository/db/
```

### 3. 显示文件夹信息
```shell
alias ll='ls -lG' # macos
```

### 4. 采集系统资源信息
```shell
vmstat 2
```
### 5. 查找文件
```shell
find / -name filename
```
