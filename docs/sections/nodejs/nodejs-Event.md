## Event

## 介绍

`Event` 是 `Nodejs` 对 `发布\订阅` 模式的简单实现. 简单概括就是: `Event` 在模块内会维护一个全局的 key-value 的 `Map`. 通过`Event.on` 和 `Event.addlistner`, `Event.one` 把回调函数(异步/同步)存入`Map`(`key-callback`). 再由 `Event.emit` 根据 `key` 去执行相应的回调(`callbak`).

## 订阅 

### once

### on

### addlistner

## 发布

### emit



## 参考资料

* [手写一个基于发布订阅模式的js事件处理中心(EventEmitter)](https://juejin.cn/post/6985156199192723487)