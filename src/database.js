import dotenv from 'dotenv';
dotenv.config();
import mysql from 'mysql';
//import util from 'util';

const mysqlConnection = mysql.createConnection({
    host: 'us-cdbr-east-02.cleardb.com',
    port: 3306,
    user: 'b6eb6851569774',
    password: '21d8ae96',
    database: 'heroku_677a3052d794aa4',
    dialect: 'mysql'
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
