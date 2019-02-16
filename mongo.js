if (!process.env.MONGODB_URI) {
    console.log('Error: Can\'t find MONGODB_URI in config. Please set MONGODB_URI');
    process.exit(1);
}

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');


const client = new MongoClient(process.env.MONGODB_URI, {useNewUrlParser: true});

var mongodb;

client.connect(function(err, db) {
    assert.equal(null, err);
    mongodb=db;
});

module.exports = mongodb;
