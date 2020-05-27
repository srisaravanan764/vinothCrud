import mongodb from "mongodb";
import assert from "assert";
import config from "../config";
import logger from "../libs/log";

const COUNTRY_REGION_MAP = config.MONGO_DB.COUNTRY_REGION_MAP || {};
const ReadPreference = mongodb.ReadPreference;
const _database = {};

function MongoDao() {}

export default MongoDao;

MongoDao.initDb = async () => {
  try {
    // assert required DB configuration
    assertMongoDbConnectionVaribles();
    // create mongo db client
    let options = { useNewUrlParser: true };
    _database.mongoClient = await new mongodb.MongoClient(
      config.MONGO_DB.URI,
      options
    );
    // connect to Mongo DB
    const client = await _database.mongoClient.connect();
    _database.dbConnection = await client.db(config.MONGO_DB.DB_NAME);
    return Promise.resolve(_database);
  } catch (err) {
    logger.error(
      "error",
      "mongoDao",
      "MongoDao.initDb",
      "Error occured while connect to MongoDB..."
    );
    return Promise.reject(err);
  }
};

MongoDao.getCollection = (collectionName, country) => {
  const regionName = COUNTRY_REGION_MAP[country];
  let readPreference;
  // if no prefered region mapped to country, the defaut collection will return
  if (!regionName)
    readPreference = new ReadPreference([ReadPreference.NEAREST]);
  else
    readPreference = new ReadPreference([
      ReadPreference.NEAREST,
      { region: regionName }
    ]);
  return _database.dbConnection.collection(collectionName, {
    readPreference: readPreference
  });
};

MongoDao.insert = (collectionName, doc, country) => {
  return new Promise((resolve, reject) => {
    MongoDao.getCollection(collectionName, country).insertOne(
      doc,
      (err, result) => {
        if (err) reject(err);
        resolve(result);
      }
    );
  });
};

MongoDao.updateOne = (collectionName, condition, doc, country) => {
  return new Promise((resolve, reject) => {
    MongoDao.getCollection(collectionName, country).updateOne(
      condition,
      doc,
      (err, result) => {
        if (err) reject(err);
        resolve(result);
      }
    );
  });
};

MongoDao.findOne = (collectionName, condition, country) => {
  return new Promise((resolve, reject) => {
    MongoDao.getCollection(collectionName, country).findOne(
      condition,
      (err, result) => {
        if (err) reject(err);
        resolve(result);
      }
    );
  });
};

MongoDao.findOneAndDelete = (collectionName, condition, country) => {
  return new Promise((resolve, reject) => {
    MongoDao.getCollection(collectionName, country).remove(
      condition,
      (err, result) => {
        if (err) reject(err);
        resolve(result);
      }
    );
  });
};

MongoDao.findAll = async (collectionName, condition, country) => {
  const dbConnection = await MongoDao.getCollection(collectionName, country);
  return new Promise((resolve, reject) => {
    dbConnection.find(condition).toArray((err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });
};

function assertMongoDbConnectionVaribles() {
  assert.notEqual(
    config.MONGO_DB,
    null,
    "Mongo DB configurations cannot be null or empty"
  );
  assert.notEqual(
    config.MONGO_DB.URI,
    null,
    "Mongo DB URI cannot be null or empty"
  );
  assert.notEqual(
    config.MONGO_DB.DB_NAME,
    null,
    "Mongo DB Database name cannot be null or empty"
  );
}
