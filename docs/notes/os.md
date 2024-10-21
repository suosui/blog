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

### 6. 更改文件夹权限
```shell
sudo chown -R a:b /path/to/directory
```

### tar.gz
```shell
解压 tar zxvf 文件名.tar.gz
压缩 tar zcvf 文件名.tar.gz 待压缩的文件名
```

### 虚拟磁盘库容
```bash
lsblk # 查看磁盘信息
df -h # 查看磁盘使用情况
df -T /data # 查看指定目录的文件系统类型

resize2fs /dev/vdb # 扩容文件系统 对于 ext4 文件系统
xfs_growfs /data # 扩容文件系统 对于 xfs 文件系统

df -h /data # 验证扩展是否成功
```

