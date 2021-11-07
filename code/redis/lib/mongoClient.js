const { MongoClient } = require('mongodb');
const blubird = require('bluebird')

const dbConfig = {
  connectionString: process.env.DB_STRING || 'mongodb://127.0.0.1:27017/local',
  connectHost: process.env.DB_HOST || 'mongodb://127.0.0.1:27017',
  dbname: process.env.DB_NAME || 'local',
  username: process.env.DB_USERNAME || '',
  password: process.env.DB_PASSWORD || '',
}
const mongoPromise = blubird.promisify(MongoClient.connect);

let client;
const connectDB = async () => {
  try {
    client = await mongoPromise(dbConfig.connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const db = {
      collection: name => {
        return client.db(dbConfig.dbname).collection(name);
      }
    }
    console.log(`Mongodb链接成功`);
    return db;
  } catch (e) {
    console.error(e);
    throw new Error('Mongodb链接出错');
  }
}

const closeDB = () => {
  try {
    client.close();
  } catch (e) {
    console.error(`error while closing clients`, e);
  }
}


module.exports = {
  closeDB: closeDB,
  connectDB: connectDB
}