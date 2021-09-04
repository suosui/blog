### 准侧
1. 找到依赖其它语句执行结果的语句
2. 将互相依赖的语句包裹在 async 函数中
3. 并发执行 async 函数 (promise.all or promise.race)
### 示例
* [地狱代码](https://gist.github.com/suosui/422f2bcc49b4cae2cbef166b95ab1624#file-wrong-js)
* [优雅代码](https://gist.github.com/suosui/422f2bcc49b4cae2cbef166b95ab1624#file-elegant-js)   
