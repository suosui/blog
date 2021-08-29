const util = require('./util');
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
        client.set(key, value, 'EX', expire, 'NX', (err, replay) => {
            if (err) {
                reject(err);
            } else {
                resolve(replay);
            }
        })
    })
}

const getLock = async (key) => {
    const clienId = Math.random() * 10000; //模拟客户端Id
    try {
        const result = await setNx(key, clienId, 10); //防止死锁,10秒
        if (result === 'OK') {
            return clienId;
        }
    } catch (error) {
        console.log(error)
        return;
    }
}

const delLock = async (key, clienId) => {
    const script = "if redis.call('get',KEYS[1]) == ARGV[1] then" +
        "   return redis.call('del',KEYS[1]) " +
        "else" +
        "   return 0 " +
        "end";
    try {
        const result = await client.eval(script, 1, key, clienId);
        if (result === 1) {
            return true;
        }
    } catch (err) {
        console.log(err)
    }
}


const getSegLock = async (keys, len) => {
    const timeout = 1000;
    let isTimeout = false;
    let hasReturnd = false;
    setTimeout(() => {
        if (!hasReturnd) {
            isTimeout = true;
        }
    }, timeout);
    randomIdx = util.getRandomInt(0, len - 1);
    let clientId = await getLock(`${keys[randomIdx]}_tmp`);
    if (!clientId) {
        hasReturnd = true;
        return await getSegLock(keys, len);
    } else {
        if (!isTimeout) {
            return { clientId, key: keys[randomIdx] };
        }
        await delLock(`${keys[randomIdx]}_tmp`, clientId);
    }
}

module.exports = {
    setKey,
    getKey,
    setNx,
    delKey,
    getLock,
    delLock,
    getSegLock,
};