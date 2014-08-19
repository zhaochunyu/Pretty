
var settings = require('../settings'),
    mongodb = require("mongodb"),
    poolModule = require('generic-pool');
var pool = poolModule.Pool({
    name : 'mongodb',
    create : function(callback) {
//    	mongodb://[username:password@]host1[:port1][,host2[:port2],...[,hostN[:portN]]][/[database][?options]]
//        mongodb.MongoClient.connect('mongodb://'+settings.username+':'+settings.password+'@'+settings.host+':27017/'+settings.db, {

    	mongodb.MongoClient.connect('mongodb://'+settings.host+':27017/'+settings.db, {
            server:{poolSize:1}
        }, function(err, db){
            callback(err, db);
        });
    },
    destroy : function(db) {
        db.close();
    }
});
module.exports = pool;
