#### 将d2-admin作为远程仓库，添加到repo1中，设置别名为other
* mkdir repo1 && cd repo1 
* git remote add other https://github.com/d2-projects/d2-admin.git
#### 从d2-admin仓库中抓取数据到本仓库
* git fetch other 　　
#### 将d2-admin仓库抓去的master分支作为新分支checkout到本地，新分支名设定为d2-admin　　　　　　　　　　　　　　　　　　　　　
* git checkout -b d2-admin other/master 　
#### 切换回repo2的master分支　　　　　　　　　
* git checkout master
#### 将d2-admin合并入master分支 　　　　　　　　　　　　　　　　　　　　　
* git merge d2-admin --allow-unrelated-histories 　
#### 将本地d2-admin分支推送到远程　　　　　　　　
* git push origin d2-admin:d2-admin 　　　　　　　　　　　　　　