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
### 14.1 备份多张表
```shell
mysqldump -u root -p test table1 table2 > tables.sql
```
### 14.2 备份多个表并压缩
```shell
mysqldump -u root -p test table1 table2 | gzip > tables.sql.gz
```


### 15.还原指定表
```shell
mysql -u root -p test < table_name.sql
```
### 15.1 从 .sql.gz 文件还原（如果你使用了压缩）
```shell
gunzip < tables.sql.gz | mysql -u root -p test
```

### 17. 数据目录
```shell
SHOW VARIABLES LIKE 'datadir';
```

### 18. 当前活跃的事务
```sql
SELECT 
    trx_id AS '事务ID',
    trx_state AS '事务状态',
    trx_started AS '开始时间',
    trx_wait_started AS '等待开始时间',
    trx_mysql_thread_id AS '线程ID',
    trx_query AS '最后执行的语句',
    trx_tables_in_use AS '使用的表数量',
    trx_tables_locked AS '锁定的表数量'
FROM 
    information_schema.INNODB_TRX;
```

### 19. 查看所有数据库大小
```sql
SELECT 
    table_schema AS `Database`, 
    ROUND(SUM(data_length + index_length) / 1024 / 1024 / 1024, 2) AS `Size (GB)`
FROM 
    information_schema.tables
GROUP BY 
    table_schema
ORDER BY 
    `Size (GB)` DESC;
```

### 20. 查看所有表大小
```sql
SELECT 
    table_name AS `Table Name`, 
    ROUND((data_length + index_length) / 1024 / 1024 / 1024, 2) AS `Size (GB)`
FROM 
    information_schema.tables
WHERE 
    table_schema = 'your_database_name'
ORDER BY 
    `Size (GB)` DESC;
```