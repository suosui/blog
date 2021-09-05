### 安装
　　apt-get updata && apt-get install mysql-server
### 测试-安装
　　sudo netstat -tap | grep mysql
### 配置    
　　vi /etc/mysql/mysql.conf.d/mysqld.cnf     
　　bind-address = your mysql service ip     
　　mysql -u root -p    
　　grant all on *.* to root@'your ip' identified by 'your pass' with grant option;    
　　flush privileges;
### 重启
　　service mysql restart