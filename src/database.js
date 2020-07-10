//import dotenv from 'dotenv';
//dotenv.config();
const mysql = require('mysql');
//import util from 'util';

const mysqlConnection = mysql.createPool({
    connectionLimit: 10,
    host: '',
    user: '',
    password: '',
    database: ''
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
