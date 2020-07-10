//import dotenv from 'dotenv';
//dotenv.config();
const mysql = require('mysql');
//import util from 'util';

const mysqlConnection = mysql.mysqlConnection({
    connectionLimit: 10,
    host: 'us-cdbr-east-02.cleardb.com',
    user: 'b9d3e2959e62be',
    password: 'd66d928b',
    database: 'heroku_e57934221f5d2a7'
});

mysqlConnection.connect(function (err) {
    if (err) {
        console.error(`Error de conexion: ${err}`);
        return;
    }
    console.log(`Conectado a MySQL`);
});

//const query = util.promisify(mysqlConnection.query).bind(mysqlConnection);


module.exports = mysqlConnection;
