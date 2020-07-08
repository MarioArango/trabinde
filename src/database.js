import dotenv from 'dotenv';
dotenv.config();
import mysql from 'mysql';
//import util from 'util';

const mysqlConnection = mysql.createConnection({
    host: process.env.HOST_DB,
    port: process.env.PORT_DB,
    user: process.env.USER_DB,
    password: process.env.PASSWORD_DB,
    database: process.env.DATABASE,
    dialect: process.env.DB_DIALECT
});

mysqlConnection.connect(function (err) {
    if (err) {
        console.error(`Error de conexion: ${err}`);
        return;
    }
    console.log(`Conectado a MySQL`);
});

//const query = util.promisify(mysqlConnection.query).bind(mysqlConnection);

export default mysqlConnection;
