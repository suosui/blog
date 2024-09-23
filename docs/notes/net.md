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

### 5. 查看当前 MTU 设置
```shell
ip link show
```
#### 5.1 将接口 eth0 的 MTU 设置为 1500
```shell
sudo ip link set dev eth0 mtu 1500
```
#### 5.2  检查和验证
```shell
ping -M do -s 1472 google.com
```

### 6 使用 ethtool 获取网卡速率
```shell
sudo ethtool eth0
```

### 7 通过系统监控工具查看带宽
```shell
sudo apt install nload bmon
nload eth0
```