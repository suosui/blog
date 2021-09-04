/**
 * 分布式锁
 */
const express = require('express')
const redis = require('./redisClient');
const mongo = require('./mongoClient');

const app = express()
const port = 3000;

app.get('/inventory/cars/cut', async (req, res) => {
  try {
    const carLeftRedisKey = 'carLeftRedisKey';
    // 1 获取分布式锁
    const clientId = await redis.getLock(carLeftRedisKey);
    if (clientId) {
      // 2 业务代码
      const left = await cutCarsLeft().catch(e => { console.log(e) });
      if (!left) {
        // 3 释放锁
        await redis.delLock(carLeftRedisKey, clientId);
        return res.send(`cars cuts failed`);
      }
      // 3 释放锁
      await redis.delLock(carLeftRedisKey, clientId);
      return res.send(`${left}`);
    }
    console.log(`cars cuts failed`)
    res.send(`cars cuts failed`);
  } catch (e) {
    console.log(e);
    res.send(`cars cuts failed`);
  }
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

const cutCarsLeft = async () => {
  const db = await mongo.connectDB();
  const cars = await db.collection('inventorys').findOne({ _id: 'cars' });
  if (cars.left) {
    cars.left += -1;
    let { matchedCount } = await db.collection('inventorys').updateOne({ _id: 'cars' }, { $set: { left: cars.left } });
    if (matchedCount) {
      console.log(cars.left);
      return cars.left;
    }
  }
}