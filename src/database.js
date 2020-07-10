//import dotenv from 'dotenv';
//dotenv.config();
const mysql = require('mysql');
//import util from 'util';

const mysqlConnection = mysql.createPool({
    connectionLimit: 10,
    host: 'us-cdbr-east-02.cleardb.com',
    user: 'b6eb6851569774',
    password: '21d8ae96',
    database: 'heroku_677a3052d794aa4'
});

/*mysqlConnection.connect(function (err) {
    if (err) {
        console.error(`Error de conexion: ${err}`);
        return;
    }
    console.log(`Conectado a MySQL`);
});*/

//const query = util.promisify(mysqlConnection.query).bind(mysqlConnection);


module.exports = mysqlConnection;
