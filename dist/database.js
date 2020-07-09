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
  host: process.env.HOST_DB,
  port: process.env.PORT_DB,
  user: process.env.USER_DB,
  password: process.env.PASSWORD_DB,
  database: process.env.DATABASE,
  dialect: process.env.DB_DIALECT
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