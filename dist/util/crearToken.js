"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

var _moment = _interopRequireDefault(require("moment"));

//NOS AYUDA CON LAS FECHAS
var token = {};

token.signToken = function (id) {
  var payload = {
    id: id,
    iat: (0, _moment["default"])().unix(),
    //CUANDO FUE CREADO EL TOKEN
    exp: (0, _moment["default"])().add(1, 'minute').unix() //CUANDO VA EXPIRAR EL TOKEN
    //MOMENT AÑADE TANTO TIEMPO AL TIEMPO UNIX QUE SE CREO ARRIBA

  };
  return _jsonwebtoken["default"].sign(payload, process.env.TOKEN_SECRET);
};

var _default = token;
exports["default"] = _default;