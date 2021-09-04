前提：ubuntu 已经配置 nodejs 环境和 npm 和nginx.　1 nodejs: [链接](https://github.com/suosui/blog/wiki/NVM%E7%89%88%E6%9C%AC%E7%AE%A1%E7%90%86%E5%B9%B6%E4%B8%8B%E8%BD%BD%E7%9B%B8%E5%85%B3node%E7%89%88%E6%9C%AC). 2 nginx: apt-get install nginx. 3 npm:   apt-get install npm

### 1 进入到服务器目录进入到nginx目录

`cd /etc/nginx/sites-enabled`

### 2 编辑配置

`vi default`
`&& modify "root /var/www/html" to "root /var/www/lego/dist"`

### 3 创建项目代码目录

`mkdir projects`
`&& cd projects`

### 4 拉取远程代码到服务器

`git clone https://github.com/suosui/lego.git
&& cd lego
&& npm install`

### 5 构建项目

`npm run build`

### 6 构建的目录复制到nginx 指定目录当中

`\cp -r dist/ /var/www/lego/dist/`
### 7 查看nginx配置是否正确
`systemctl status nginx.service`

### 8 重启nginx

`service nginx restart`