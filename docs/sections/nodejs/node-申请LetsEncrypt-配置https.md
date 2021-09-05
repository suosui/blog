前提：代码已经部署到服务器上(ubuntu)

### 1 首先安装certbot

`sudo apt-get install certbot`

### 2 获取证书
首先停止你服务器上的服务，保证80端口没有被占用并且你的域名被正确解析到你的服务器，否则在证书获取过程中会出现错误。

`sudo certbot certonly --standalone -d legosbak.cloud -d www.legosbak.cloud    #把legosbak.cloud换成你的域名`

证书文件被保存到了/etc/letsencrypt/live/你的域名/，其中的fullchain.pem和privkey.pem是我们接下来需要用到的完整证书链及私钥

### 4 启动https

const express = require('express')    
const fs = require('fs')    
const http = require('http')    
const https = require('https')    
    
const app = express()    
const port = 80        //HTTP访问端口号，默认80，可更改为你希望的端口号    
const SSLport = 443    //HTTPS访问端口号，默认443，可更改为你希望的端口号    
    
const options = {    
　　　key: fs.readFileSync('/etc/letsencrypt/live/diunar.tk/privkey.pem'),     //异步读取私钥文件    
　　　cert: fs.readFileSync('/etc/letsencrypt/live/diunar.tk/fullchain.pem'),  //异步读取证书文件    
　　　requestCert: false,        //是否请求客户端证书    
　　　rejectUnauthorized: false  //是否拒绝无信任CA颁发的证书的客户端连接请求    
}    
    
http.createServer(app).listen(port, () => console.log(`HTTP server is listening on port ${port}`))                   //创建http服务监听     
https.createServer(options, app).listen(SSLport, () => console.log(`HTTPS server is listening on port ${SSLport}`))  //创建https服务监听     
    
app.get('/', function(req, res) {    
　　　if (req.protocol == 'https') {    
　　　　　res.send("This is HTTPS Server")    
　　　} else {    
　　　　　res.send("This is HTTP Server")    
　　　}    
})
### 5 通过http和https访问
`http://www.legosbak.cloud`
`https:///www.legosbak.cloud`