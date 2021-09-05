## 前提
* 已经配置好了http协议能够访问的网站
* ubuntu 16.4 (其他版本同样适用)
* 已经配置好域名
* 假设你的域名是 www.test.com
## 创建letsencrypt.conf
* `vi /etc/nginx/snippets/letsencrypt.conf`
* 添加    
　location ^~ /.well-known/acme-challenge/ {    
　　　　　default_type "text/plain";    
　　　　　root /var/www/letsencrypt;     
　}
* `sudo mkdir -p /var/www/letsencrypt/.well-known/acme-challenge`
## 创建ssl.conf
* `vi /etc/nginx/snippets/ssl.conf`
* 添加   
    ssl_session_timeout 1d;   
    ssl_session_cache shared:SSL:50m;   
    ssl_session_tickets off;   
    
    ssl_protocols TLSv1.2;    
    ssl_ciphers EECDH+AESGCM:EECDH+AES;    
    ssl_ecdh_curve secp384r1;    
    ssl_prefer_server_ciphers on;    
    
    ssl_stapling on;    
    ssl_stapling_verify on;
    
    add_header Strict-Transport-Security "max-age=15768000; includeSubdomains; preload";    
    add_header X-Frame-Options DENY;    
    add_header X-Content-Type-Options nosniff;
## 修改http配置 (80端口)  
* 找到80端口的配置文件 exa:/etc/nginx/sites-avaliable 
* 添加    
   server{    
　　　　listen 80;    
　　　　server_name _;    
　　　　include /etc/nginx/snippets/letsencrypt.conf; # 需要增加的内容    
　　}
* `nginx -t && service nginx reload`
## 安装certbot
　　sudo apt-get install software-properties-common    
　　sudo add-apt-repository ppa:certbot/certbot    
　　sudo apt-get update    
　　sudo apt-get install certbot
## certbot执行对域名的认证
`certbot certonly --webroot --agree-tos --no-eff-email --email yourname@163.com -w /var/www/letsencrypt -d www.test.com`
## 修改https配置(403端口)
server {   
　　　server_name www.test.com;   
　　　listen 443 ssl http2;  
　　　listen [::]:443 ssl http2;    
    
　　　ssl_certificate /etc/letsencrypt/live/www.test.com/fullchain.pem;   # 需添加的内容    
　　　ssl_certificate_key /etc/letsencrypt/live/www.test.com/privkey.pem;  #  需添加的内容    
　　　ssl_trusted_certificate /etc/letsencrypt/live/www.test.com/fullchain.pem; # 需添加的内容    
　　　include /etc/nginx/snippets/ssl.conf; # 需添加的内容     
        
　　　root /var/www/html;    
　　　index index.html;    
　　　location / {    
　　　　　root /var/www/lego/dist;    
　　　　　index index.html;    
　　　　　try_files $uri $uri/ /index.html;     
　　　}    
　　　location /api/{    
　　　　　proxy_pass http://45.76.30.117:3000;    
　　　}       　  
}
## 强制http重定向到https
server {    
　　　listen 80;    
　　　server_name www.test.com;    

　　　include /etc/nginx/snippets/letsencrypt.conf;    

　　　location / {    
　　　　　　return 301 https://www.test.com$request_uri; #需修改的内容    
   　　　}    
}
### 参考自：https://www.jianshu.com/p/3c67562b88a5 作者：无关山