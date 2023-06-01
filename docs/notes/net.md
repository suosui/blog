### 1. 统计连接
```shell
netstat -n | awk '/^tcp/ {++S[$NF]} END {for(a in S) print a, S[a]}'
```

### 2. 带宽进出情况
```shell
netsta
```
