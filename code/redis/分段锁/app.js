/**
 * 分段锁
 */
const express = require('express');
const moment = require('moment');
const redis = require('../lib/redisClient');
const mongo = require('../lib/mongoClient');
const logger = require("../lib/logger").logger();

const app = express();
const port = 3000;
const preKey = 'carleft_';
const dividedRedisKeys = [];
let reqCnt = 0;
let db;

/**
 * 初始化函数
 */
const init = async () => {
    // 连接数据库
    db = await mongo.connectDB();
    // 分配库存
    logger.info(`分库`);
    dividCarsLeft();
    logger.info(`app listening at http://localhost:${port}`);
}

/**
 * 注册监听服务
 */
app.listen(port, init);

/**
 * 减库存
 */
app.get('/inventory/cars/cut', async (req, res) => {
    reqCnt++;
    const reqCntTmp = reqCnt;
    const cut = 1;
    try {
        const errMsg = await cutCarsLeftWithSegmentLock(cut, reqCntTmp);
        if (errMsg) {
            return res.send(`${errMsg}`);
        } else {
            return res.send(`success`);
        }
    } catch (e) {
        logger.error(e);
        return res.send(`cars cuts failed`);
    }
});

/**
 * 获取库存
 */
app.get('/inventory/cars/left', async (req, res) => {
    let left = await getLeft();
    console.log(left);
    console.log(reqCnt);
    return res.send(`${left} `);
});

/**
 * 分段锁 实现 减库存
 * @param {*} cut 
 * @param {*} reqCntTmp 
 * @param {*} retry 
 * @returns 
 */
const cutCarsLeftWithSegmentLock = async (cut, reqCntTmp, retry = 10) => {
    retry--;
    if (retry > 0) {
        // 1 获取分布式锁
        logger.info({ reqCnt: reqCntTmp, aciton: '上锁' });
        const { clientId, key } = await redis.getSegLock(dividedRedisKeys);
        if (retry && clientId) {
            logger.info({ reqCnt: reqCntTmp, aciton: '上锁成功' });
            // 2 业务代码
            left = await cutCarsLeft(key, cut).catch(e => { console.log(e) });
            // 3 释放锁
            logger.info({ reqCnt: reqCntTmp, aciton: '释放锁' });
            await redis.delLock(key, clientId);
            if (left > 0 && retry > 0) {
                return await cutCarsLeftWithSegmentLock(left, retry, left);
            }
        } else {
            logger.error({ reqCnt: reqCntTmp, aciton: '上锁失败' });
            return `加分段锁失败！`;
        }
    } else if (cut > 0) {
        return `库存不足！`;
    }
}

/**
 * 减库存函数
 * @param {*} redisKey 
 * @param {*} cut 
 * @returns 
 */
const cutCarsLeft = async (redisKey, cut) => {
    // 获取分库的库存
    const cars = await db.collection('inventorys_sub').findOne({ _id: redisKey });
    let origin = cars.left;     // 原始库存    
    let left = origin - cut;    // 削减后的库存
    let uQuery = { $set: {} };
    let toReturn = 0;
    if (left >= 0) {
        toReturn = 0;
        uQuery.$set.left = left;
    } else {
        toReturn = Math.abs(left);
        uQuery.$set.left = 0;
    }
    await db.collection('inventorys_sub').updateOne({ _id: redisKey }, uQuery);
    return toReturn;
}

/**
 * 库存分配到分段库中
 * @returns 
 */
const dividCarsLeft = async () => {
    try {
        // 获取整体库存
        await db.collection('inventorys').updateOne({ _id: 'cars' }, { $set: { left: 100000 } });
        const cars = await db.collection('inventorys').findOne({ _id: 'cars' });
        const gap = 1000;
        let i = 1;
        let left = cars.left;
        // 分配相应的库存到相应的分库中去
        while (left > 0) {
            left -= gap;
            if (left > 0) {
                await db.collection('inventorys_sub').updateOne({ _id: `${preKey}${i}` }, { $set: { left: gap } }, { upsert: true });
            } else {
                await db.collection('inventorys_sub').updateOne({ _id: `${preKey}${i}` }, { $set: { left: gap + left } }, { upsert: true });
            }
            dividedRedisKeys.push(`${preKey}${i}`);
            i++;
        }
        keysCnt = i - 1;
        return;
    } catch (e) {
        logger.error(e);
    }
}

/**
 * 获取库存函数
 * @returns 
 */
const getLeft = async () => {
    let leftTotal = 0;
    for (let key of dividedRedisKeys) {
        cars = await db.collection('inventorys_sub').findOne({ _id: key });
        leftTotal += cars.left;
    }
    return leftTotal;
}


