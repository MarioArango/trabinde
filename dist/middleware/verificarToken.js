"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _dotenv = _interopRequireDefault(require("dotenv"));

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

_dotenv["default"].config();

var verificarToken = function verificarToken(req, res, next) {
  var token = req.header('auth-token');

  try {
    if (!token) return res.status(401).send({
      status: 'Error',
      message: 'Token no existente',
      code: 401
    });

    var payload = _jsonwebtoken["default"].verify(token, process.env.TOKEN_SECRET);

    req.payload = payload;
    next();
  } catch (error) {
    if (error.name == 'TokenExpiredError') {
      return res.status(401).send({
        status: 'Error',
        message: 'Token expirado',
        code: 401
      });
    }

    return res.status(400).send({
      status: 'Error',
      message: 'Token incorrecto',
      code: 400
    });
  }
};

var _default = verificarToken;
exports["default"] = _default;