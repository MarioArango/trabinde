"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _dotenv = _interopRequireDefault(require("dotenv"));

var _mysql = _interopRequireDefault(require("mysql"));

_dotenv["default"].config();

//import util from 'util';
var mysqlConnection = _mysql["default"].createConnection({
  host: 'us-cdbr-east-02.cleardb.com',
  user: 'b6eb6851569774',
  password: '21d8ae96',
  database: 'heroku_677a3052d794aa4',
  dialect: 'mysql'
});

mysqlConnection.connect(function (err) {
  if (err) {
    console.error("Error de conexion: ".concat(err));
    return;
  }

  console.log("Conectado a MySQL");
}); //const query = util.promisify(mysqlConnection.query).bind(mysqlConnection);

var _default = mysqlConnection;
exports["default"] = _default;