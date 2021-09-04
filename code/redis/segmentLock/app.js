/**
 * 分段锁
 */
const express = require('express')
const redis = require('./redisClient');
const mongo = require('./mongoClient');

const app = express()
const port = 3000;
const preKey = 'carleft_'
const dividedRedisKeys = [];
let reqCnt = 0;

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
    dividCarsLeft();
})

app.get('/inventory/cars/cut', async (req, res) => {
    const cut = req.query.cut;
    const retry = 3;
    try {
        let errMsg = await cutCarsLeftWithSegmentLock(Number(cut), retry);
        if (errMsg) {
            return res.send(`${errMsg}`);
        } else {
            let left = await getLeft();
            return res.send(`${left}`);
        }
    } catch (e) {
        console.log(e);
        return res.send(`cars cuts failed`);
    }
})

app.get('/inventory/cars/left', async (req, res) => {
    let left = await getLeft();
    console.log(left);
    console.log(reqCnt)
    return res.send(`${left} `);
})

const cutCarsLeftWithSegmentLock = async (cut, retry) => {
    if (retry) {
        // 1 获取分布式锁
        const { clientId, key } = await redis.getSegLock(dividedRedisKeys, dividedRedisKeys.length);
        if (retry && clientId) {
            // 2 业务代码
            left = await cutCarsLeft(key, cut).catch(e => { console.log(e) });
            if (!left) {
                return `cars cuts failed`
            }
            // 3 释放锁
            reqCnt++;
            await redis.delLock(key, clientId);
        } else {
            return `get lock failed get lock failed or retry ${retry}`;
        }
    } else {
        return `retry has no left`;
    }
}

const cutCarsLeft = async (redisKey, cut, retry = 3) => {
    retry--;
    let left = await redis.getKey(redisKey);
    left = Number(left);
    if (left - cut >= 0) {
        left += -cut;
        await redis.setKey(redisKey, left);
        return left;
    } else {
        return cutCarsLeftWithSegmentLock(cut, retry)
    }
}

/**
 * 把库存分配到redis子库中
 * @returns 
 */
const dividCarsLeft = async () => {
    try {
        const db = await mongo.connectDB();
        const cars = await db.collection('inventorys').findOne({ _id: 'cars' });
        const gap = 1000;
        let i = 1;
        let left = cars.left;
        while (left > 0) {
            left -= gap;
            if (left > 0) {
                await redis.setKey(`${preKey}${i}`, gap);
            } else {
                await redis.setKey(`${preKey}${i}`, gap + left);
            }
            dividedRedisKeys.push(`${preKey}${i}`);
            i++;
        }
        keysCnt = i - 1;
        return;
    } catch (e) {
        console.log(e);
    }
}

const getLeft = async () => {
    let leftTotal = 0;
    for (let key of dividedRedisKeys) {
        left = await redis.getKey(key);
        leftTotal += Number(left);
    }
    return leftTotal;
}