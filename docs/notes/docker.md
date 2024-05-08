### grep
docker logs nginx 2>&1 | grep "127." 

### 进入容器
 docker exec -it 名称 bash

### 倒入文件到container
docker cp /local/dir mongo:/container/dir