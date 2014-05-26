var mysql = require("mysql");
var mysqlPool = mysql.createPool({
    host: '172.17.104.23',
    user: 'cssx001',
    password: 'dongbeihu123!',
    database: 'td_oa',
    port: 3306
});
module.exports = mysqlPool;