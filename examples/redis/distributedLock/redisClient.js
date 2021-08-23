const redis = require("redis"),
    client = redis.createClient();

client.on("error", function (err) {
    console.log("Error " + err);
});

const setKey = (key, value) => {
    return new Promise((resolve, reject) => {
        client.set(key, value, (err, replay) => {
            if (err) {
                reject(err);
            } else {
                resolve(replay);
            }
        })
    })
};

const getKey = (key) => {
    return new Promise((resolve, reject) => {
        client.get(key, (err, replay) => {
            if (err) {
                reject(err);
            } else {
                resolve(replay);
            }
        })
    })
};

const delKey = (key) => {
    return new Promise((resolve, reject) => {
        client.del(key, (err, replay) => {
            if (err) {
                reject(err);
            } else {
                resolve(replay);
            }
        })
    })
};

const setNx = (key, value, expire) => {
    return new Promise((resolve, reject) => {
        client.set(key, value, 'NX', expire, (err, replay) => {
            if (err) {
                reject(err);
            } else {
                resolve(replay);
            }
        })
    })
}

const getLock = async (key) => {
    const clienId = Math.random() * 100; //模拟客户端Id
    try {
        const result = await setNx(key, clienId, 10); //防止死锁,10秒
        if (result == 0) {
            return;
        }
        return clienId;
    } catch (error) {
        console.log(error)
        return;
    }
}

const delLock = async (key, clienId) => {
    try {
        if (clienId == await redis.getKey(key)) {// 注意：判断和释放要用lua脚本写，保证原子性
            return await redis.delKey(key);
        }
    } catch (err) {
        console.log(err)
    }
}


module.exports = {
    setKey,
    getKey,
    setNx,
    delKey,
    getLock,
    delLock,
};