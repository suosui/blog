### 1. 获取容器列表
```shell
kubectl -n hpaas get pod
```

### 2. 进入容器
```shell
kubectl -n hpaas exec -it 容器id bash
```

### 3. 日志
```shell
kubectl -n hpaas logs -f 容器id                     # 打印容器日志
kubectl -n hpaas logs 容器id | grep "2022-10-27"    # 过滤日志
```


