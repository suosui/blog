### 1. 统计连接
```shell
netstat -n | awk '/^tcp/ {++S[$NF]} END {for(a in S) print a, S[a]}'
```

### 2. 带宽进出情况
```shell
netstat
```

### 3. 网络连接状态
```shell
netstat -an # 如果有大量的处于 SYN_RECV 状态的连接，那可能是受到了 SYN Flood DDoS 攻击。
```

### 4. 查看每个进程的网络流量使用情况
```shell
sudo apt install nethogs
sudo nethogs
```
