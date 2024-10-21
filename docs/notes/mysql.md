### 1. 连接数据库
```shell
mysql -u root -p
```

### 2. 选择数据库
```shell
use test;
```

### 3. 查看数据库
```shell
show databases;
```

### 4. 查看表
```shell
show tables;
```

### 5. 查看表结构
```shell
desc table_name;
```
### 6. 删除表
```shell
drop table table_name;
```

### 7. 查看表ddl
```shell
show create table table_name;
```

### 8. 备份数据库
```shell
mysqldump -u root -p test > test.sql
```

### 9. 还原数据库
```shell
mysql -u root -p test < test.sql
```

### 10. 查看数据库大小
```shell
select table_schema, sum(data_length + index_length) / 1024 / 1024 as total_size from information_schema.tables group by table_schema;
```

### 11. 查看表大小
```shell
select table_name, table_rows, data_length, index_length, round(((data_length + index_length) / 1024 / 1024), 2) "size in MB" from information_schema.tables where table_schema = 'test';
```

### 12. 查看表索引
```shell
show index from table_name;
```

### 13. 查看表状态
```shell
show table status like 'table_name';
```

### 14.备份指定表
```shell
mysqldump -u root -p test table_name > table_name.sql
```

### 15.还原指定表
```shell
mysql -u root -p test < table_name.sql
```

### 17. 数据目录
```shell
SHOW VARIABLES LIKE 'datadir';
```