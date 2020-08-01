//import dotenv from 'dotenv';
//dotenv.config();
const mysql = require('mysql');
//import util from 'util';

/*const mysqlConnection = mysql.createPool({
    connectionLimit: 10,
    host: 'us-cdbr-east-02.cleardb.com',
    user: 'b9d3e2959e62be',
    password: 'd66d928b',
    database: 'heroku_e57934221f5d2a7'
});*/
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
