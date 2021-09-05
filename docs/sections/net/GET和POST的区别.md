**区别**
* GET在浏览器回退时是无害的，而POST会再次提交请求。
* GET产生的URL地址可以被Bookmark，而POST不可以。
* GET请求会被浏览器主动cache，而POST不会，除非手动设置。
* GET请求只能进行url编码，而POST支持多种编码方式。
* GET请求参数会被完整保留在浏览器历史记录里，而POST中的参数不会被保留。
* GET请求在URL中传送的参数是有长度限制的，而POST么有。
* 对参数的数据类型，GET只接受ASCII字符，而POST没有限制。
* GET比POST更不安全，因为参数直接暴露在URL上，所以不能用来传递敏感信息。
* GET参数通过URL传递，POST放在Request body中。    

**本质区别**    

GET：浏览器发送一次请求。1 header和data一并发送出去，服务器响应200（返回数据）。    
POST：浏览器发送两次请求。1 发送header，服务器响应100 continue，2 再发送data，服务器响应200 ok（返回数据）。    

**注意**
以上区别统统是客户端决定的。也就是浏览器。