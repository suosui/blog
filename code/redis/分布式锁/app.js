/**
 * 分布式锁
 */
const express = require('express');
const moment = require('moment');
const redis = require('../lib/redisClient');
const mongo = require('../lib/mongoClient');
const logger = require("../lib/logger").logger();

const app = express();                              // express 对象
const port = 3000;                                  // 监听的端口
const shoseLeftRedisKey = 'shoseInventoryRedisKey'; // 分布式锁的key
let db;                                             // mongo数据库客户端
let reqCnt = 0;

/**
 * 初始化函数
 */
const init = async () => {
    db = await mongo.connectDB();
    await initShoseLeft();
    logger.info(`app listening at http://localhost:${port}`);
}

/**
 * 初始化服务
 */
app.listen(port, init);

/**
 * 削减库存路由
 * 比如：我们要削减的是某个鞋子的库存
 */
app.get('/shose/cut', async (req, res) => {
    reqCnt++;
    const reqCntTmp = reqCnt;
    try {
        // 1 获取分布式锁
        logger.info({ reqCnt: reqCntTmp, aciton: '上锁' });
        const clientId = await redis.getLock(shoseLeftRedisKey);
        if (clientId) {
            logger.info({ reqCnt: reqCntTmp, aciton: '上锁成功' });
            // 2 业务代码
            const left = await cutShose().catch(e => { console.log(e) });
            if (!left) {
                // 3 释放锁
                await redis.delLock(shoseLeftRedisKey, clientId);
                return res.send(`cars cuts failed`);
            }
            // 3 释放锁
            logger.info({ reqCnt: reqCntTmp, aciton: '释放锁' });
            await redis.delLock(shoseLeftRedisKey, clientId);
            return res.send(`${left}`);
        }
        logger.info(`cars cuts failed`)
        res.send(`cars cuts failed`);
    } catch (e) {
        logger.error(e);
        res.send(`cars cuts failed`);
    }
});

/**
 * 从数据库中削减库存
 * @returns 
 */
const cutShose = async () => {
    const shose = await db.collection('inventorys').findOne({ _id: 'shose' });
    if (shose.left) {
        shose.left += -1;
        let { matchedCount } = await db.collection('inventorys').updateOne({ _id: 'shose' }, { $set: { left: shose.left } });
        if (matchedCount) {
            logger.info({ left: shose.left });
            return shose.left;
        }
    }
}


const initShoseLeft = async () => {
    await db.collection('inventorys').updateOne({ _id: 'shose' }, { $set: { left: 10000 } }, { upsert: true });
}


