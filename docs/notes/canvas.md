## centos node12 install canvas

### 1. pack centos environment
```shell
yum install gcc-c++ cairo-devel pango-devel libjpeg-turbo-devel giflib-devel
```

### 2. install canvas
```shell
npm i canvas
```

### problems
> 1: Error: /lib64/libstdc++.so.6: version `CXXABI_1.3.9' not found:

if not found CXXABI_1.3.9，update libstdc++.so.6
```shell
download libstdc++.so.6.0.26(link: https://cdn.frostbelt.cn/software/libstdc%2B%2B.so.6.0.26)
copy to /usr/lib64/, and :
cd /usr/lib64/
ln -snf ./libstdc++.so.6.0.26 libstdc++.so.6
```
if Error: /lib64/libc.so.6: version `GLIBC_2.18' not found
install GLIBC_2.18:
```
curl -O http://ftp.gnu.org/gnu/glibc/glibc-2.18.tar.gz
tar zxf glibc-2.18.tar.gz
cd glibc-2.18/
mkdir build
cd build/
../configure --prefix=/usr
make -j2
make install
```

after all installed re npm i canvas
