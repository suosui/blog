###  下载NVM
`curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash`
###  重新打开终端(Terminal)
###  列出全部可以安装的版本号
`nvm ls-remote`
###  下载node脚本
`nvm install v6.8.1 && 
nvm install v6.17.1 && 
nvm install v7.10.1 && 
nvm install v8.8.1 && 
nvm install v8.16.0 && 
nvm install v9.11.2 && 
nvm install v10.12.0 && 
nvm install v10.15.3 &&
nvm install v11.15.0 &&
nvm install v12.1.0`
###  设定默认的 node 版本
`nvm alias default v8.16.0`
###  切换指定版本
`nvm use v8.16.0`
###  查看该系统已经安装的版本
`nvm ls`
###  查看当前使用的版本
`nvm current`

