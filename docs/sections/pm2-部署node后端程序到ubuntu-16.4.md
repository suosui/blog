### 前提：ubuntu 已配置node环境
* curl -sL https://deb.nodesource.com/setup_11.x | sudo -E bash -
* apt-get install -y nodejs
* apt-get install npm
* npm install pm2@latest -g
### 拉取代码
* mkdir /etc/projects
* cd /etc/projects
* git clone https://github.com/suosui/lego-bak.git lego-back
* cd lego-back
* npm install
### 创建app.json 到~/.pm2 目录下
内容如下：
```javascpirt
{
  "apps" : [{
  "name"        : "lego-bak",
    "script"      : "bin/www",
    "watch"       : true,
    "node_args"   : "--harmony",
    "merge_logs"  : true,
    "cwd"         : "/etc/projects/lego-bak",
    "env": {
      "NODE_ENV": "production",
      "AWESOME_SERVICE_API_TOKEN": "xxx"
    }
   }
  ]
}
```   

### 启动项目
* pm2 start ~/app.json --env production
* pm2 list