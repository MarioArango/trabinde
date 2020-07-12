//import dotenv from 'dotenv';
//dotenv.config();
const mysql = require('mysql');
//import util from 'util';

const mysqlConnection = mysql.createConnection({
    host: 'us-cdbr-east-02.cleardb.com',
    user: 'b9d3e2959e62be',
    password: 'd66d928b',
    database: 'heroku_e57934221f5d2a7'
});

mysqlConnection.connect();

//const query = util.promisify(mysqlConnection.query).bind(mysqlConnection);


module.exports = mysqlConnection;
