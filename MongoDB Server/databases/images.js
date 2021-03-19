let mongoose = require('mongoose');
let ObjectId = require('mongodb').ObjectID;

// make sure to run mongod.exe

mongoose.Promise = global.Promise;
// required url for connection
let mongo_url = 'mongodb://localhost:27017/images';

mongoose.Promise = global.Promise;
try {
    connection = mongoose.connect(mongo_url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        checkServerIdentity: false,
    });
    console.log('connection to mongodb worked!');

// db.dropDatabase();

} catch (e) {
    console.log('error in db connection: ' + e.message);
}
