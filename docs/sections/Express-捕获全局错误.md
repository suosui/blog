# 方法一
修改 express 路由层    
`const express = require('express');`    
`const Layer = require('express/lib/router/layer');`    
    
`Object.defineProperty(Layer.prototype, 'handle', {`    
　　`enumerable: true,`    
　　`get() {`    
　　　　　　`return this.__handle;`    
　　　　`},`    
　　`set(fn) {`    
　　　　`if (fn.length === 4) {`    
　　　　`this.__handle = fn;`    
　　　　`} else {`    
　　　　　　`this.__handle = (req, res, next) =>`    
　　　　　　`Promise.resolve(fn(req, res, next)).catch(next);`    
　　　　`}`    
　　　`},`    
　　`});`    
    
# 方法二
安装express-async-errors

`cnpm install express-async-errors --save`

`const express = require('express');`    
`require('express-async-errors');`