const mysql = require('mysql');
//import util from 'util';

const mysqlConnection = mysql.createPool({
    connectionLimit: process.env.CONNECTIONLIMIT,
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

/*mysqlConnection.connect(function (err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }

    console.log('connected as id ' + mysqlConnection.threadId);
});*/

//const query = util.promisify(mysqlConnection.query).bind(mysqlConnection);


module.exports = mysqlConnection;
