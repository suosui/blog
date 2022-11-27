### 添加秘钥
```shell
ssh-add ~/.ssh/私钥名称
```
### 解决 git permission denied
```shell
ssh-agent bash
ssh-add ~/.ssh/your privatekey
ssh -T -ai ~/.ssh/your privatekey git@github.com
git push
```

### git 设置，取消代理
```shell
git config --global https.proxy http://127.0.0.1:1080
git config --global https.proxy https://127.0.0.1:1080
git config --global --unset http.proxy
git config --global --unset https.proxy
npm config delete proxy
```

### git 修改message
```shell
git commit --amend
```

### 同时 修改 远程(本地)tag的message
```shell
1 git tag -fa 'v1.x.x' HEAD -m "v1.x.x release" 修改本地tag的message
2 git push origin --delete 'v1.x.x' 删除远程tag
3 git push --tags 更新远程tag
```

### git 重命名分支
```shell
1.重命名 git branch -m oldBranchName newBranchName
2.删除远程分支：git push origin :oldBranchName
3.将重命名过的分支提交：git push origin newBranchName
4.切换到修改后的分支：git checkout newBranch
5.把当前的本地分支与远程分支关联: git branch --set-upstream-to=origin/newBranch
```

### git 打tag
```shell
git tag -a v1.4 -m "test" d5a65e9
git push --tags
```

### git 查看tag信息
```shell
git show tag标识
```

### git 删除 本地/远程分支
```shell
本地
git branch -d 分支名
远程
git push origin --delete 分支名
```

### git wiki 上传图片
```shell
git clone https://github.com/suosui/blog.wiki.git
cd blog.wiki && mkdir images
cp ~/filepath/1.png ~/blog.wiki/images
git add . && git push origin master
reference the file(photo)： 注意 图片路径 必须是下面这种格式 https://raw.githubusercontent.com/wiki/[username]/[repository]/[filename]
```

### git强制提交本地分支覆盖远程分支
```shell
git push origin 分支名 --force
```

### git 放弃本地修改，远程分支强制覆盖本地
```shell
git fetch --all
git reset --hard origin/分支名如master
```
