if (!process.env.MONGODB_URI) {
    console.log('Error: Can\'t find MONGODB_URI in config. Please set MONGODB_URI');
    process.exit(1);
}

const assert = require('assert');
const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient(process.env.MONGODB_URI, {useNewUrlParser: true});

var mongodb = {};

client.connect(function(err) {
    assert.equal(null, err);
    mongodb.db = client.db();
});

module.exports = mongodb;
