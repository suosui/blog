### 1. 重启
```shell
nginx -s reload
```

### 2. 只允许某些方法
```shell
add_header Allow "GET, POST, HEAD" always;
if ( $request_method !~ ^(GET|POST|HEAD)$ ) {
    proxy_pass http://back-end;
}
```