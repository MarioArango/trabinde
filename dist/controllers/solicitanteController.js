"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _database = _interopRequireDefault(require("../database"));

var _crearToken = _interopRequireDefault(require("../util/crearToken"));

var _encriptacion = _interopRequireDefault(require("../util/encriptacion"));

var _cloudinary = _interopRequireDefault(require("cloudinary"));

var _bcryptjs = _interopRequireDefault(require("bcryptjs"));

var _fsExtra = _interopRequireDefault(require("fs-extra"));

_cloudinary["default"].config({
  cloud_name: 'drne6kexd',
  api_key: '889385581853261',
  api_secret: '_3Q8ijH8FhIfvf39YGnzAroj7Cs'
});

var solicitanteController = {}; //ITERACION 1

solicitanteController.registro_solicitante = function (req, res) {
  var _req$body = req.body,
      _nombre = _req$body._nombre,
      _apellidoPaterno = _req$body._apellidoPaterno,
      _apellidoMaterno = _req$body._apellidoMaterno,
      _dni = _req$body._dni,
      _distrito = _req$body._distrito,
      _emailSolicitantes = _req$body._emailSolicitantes,
      _password = _req$body._password;
  var sql = 'call SP_POST_RegistroSolicitante(?, ?, ?, ?, ?, ?, ?)';

  _database["default"].query('SELECT*FROM solicitantes WHERE emailSolicitantes = ?', [_emailSolicitantes], function (er, dt) {
    if (dt[0] == undefined) {
      _database["default"].query('SELECT*FROM persona AS p WHERE p.dni = ?', _dni, function (error, data) {
        if (data[0] == undefined) {
          _encriptacion["default"].password(_password).then(function (passwordEncriptado) {
            console.log(passwordEncriptado);

            _database["default"].query(sql, [_nombre, _apellidoPaterno, _apellidoMaterno, _dni, _distrito, _emailSolicitantes, passwordEncriptado], function (error, data) {
              if (!error) {
                res.status(200).send({
                  status: "Success",
                  message: "Registrado",
                  code: 200
                });
              } else {
                res.status(400).send({
                  status: "Error",
                  message: "No se pudo registrar",
                  code: 400
                });
              }
            });
          })["catch"](function (error) {
            console.log('No se pudo registrar');
          });
        } else {
          res.status(400).send({
            status: "Error",
            message: "DNI en uso",
            code: 400
          });
        }
      });
    } else {
      res.status(400).send({
        status: "Error",
        message: "Email en uso",
        code: 400
      });
    }
  });
};

solicitanteController.login_solicitante = function (req, res) {
  var _req$body2 = req.body,
      _emailSolicitantes = _req$body2._emailSolicitantes,
      _password = _req$body2._password;
  var sql = 'call SP_GET_LoginSolicitante(?, ?)';
  var sql2 = 'SELECT s.emailSolicitantes, s.password FROM solicitantes AS s WHERE s.emailSolicitantes = ?';

  _database["default"].query(sql2, [_emailSolicitantes], /*#__PURE__*/function () {
    var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(error, dat) {
      var passwordEncriptado, verf;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (error) {
                _context.next = 12;
                break;
              }

              if (!(dat.length != 0)) {
                _context.next = 9;
                break;
              }

              passwordEncriptado = dat[0].password;
              _context.next = 5;
              return _bcryptjs["default"].compare(_password, passwordEncriptado);

            case 5:
              verf = _context.sent;

              if (verf) {
                _database["default"].query(sql, [_emailSolicitantes, passwordEncriptado], function (error, data) {
                  if (!error) {
                    var tkn = _crearToken["default"].signToken(data[0][0].idSolicitantes);

                    res.status(200).header('auth-token', tkn).send({
                      status: "Login correcto",
                      data: data[0][0],
                      code: 200
                    });
                  } else {
                    res.status(400).send({
                      status: "Error",
                      message: "No se pudo, error de red",
                      code: 400
                    });
                  }
                });
              } else {
                res.status(400).send({
                  status: "Error",
                  message: "Contraseña incorrecta",
                  code: 400
                });
              }

              _context.next = 10;
              break;

            case 9:
              res.status(400).send({
                status: "Error",
                message: "Email no existente",
                code: 400
              });

            case 10:
              _context.next = 13;
              break;

            case 12:
              res.status(400).send({
                status: "Error",
                message: "Error de servidor",
                code: 400
              });

            case 13:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }());
};

solicitanteController.listar_servicios_trabajadores = function (req, res) {
  var sql = 'call SP_GET_ListarServiciosTrabajadores()';

  _database["default"].query(sql, function (error, data) {
    if (!error) {
      res.status(200).send({
        status: "Success",
        data: data[0],
        code: 200
      });
    } else {
      res.status(400).send({
        status: "Error",
        error: error,
        code: 400
      });
    }
  });
};

solicitanteController.buscador_servicios_trabajadores = function (req, res) {
  var sql = "call SP_GET_BuscadorServiciosTrabajadores(?)";
  var _nombreRubro = req.body._nombreRubro;

  _database["default"].query(sql, [_nombreRubro], function (error, data) {
    if (!error) {
      res.status(200).send({
        status: "Success",
        data: data[0],
        code: 200
      });
    } else {
      res.status(400).send({
        status: "Error",
        error: error,
        code: 400
      });
    }
  });
}; //ITERACION 2


solicitanteController.calificar_trabajador_individual = function (req, res) {
  var sql = "call SP_POST_CalificarTrabajadorIndividual(?,?,?)";
  var _req$body3 = req.body,
      _idTrabajadores = _req$body3._idTrabajadores,
      _idSolicitantes = _req$body3._idSolicitantes,
      _calificacionIndividual = _req$body3._calificacionIndividual;

  _database["default"].query(sql, [_idTrabajadores, _idSolicitantes, _calificacionIndividual], function (error, data) {
    if (!error) {
      res.status(200).send({
        status: "Success",
        message: "Calificacion asignada",
        code: 200
      });
    } else {
      res.status(400).send({
        status: "Error",
        error: error,
        code: 400
      });
    }
  });
};

solicitanteController.perfil_solicitante = function (req, res) {
  var _idSolicitantes = req.body._idSolicitantes;
  var sql = "call SP_GET_PerfilSolicitante(?)";

  _database["default"].query(sql, [_idSolicitantes], function (error, data) {
    if (!error) {
      res.status(200).send({
        status: "Success",
        data: data[0],
        code: 200
      });
    } else {
      res.status(400).send({
        status: "Error",
        message: "Perfil no enviado",
        code: 400
      });
    }
  });
}; //ITERACION 3 CHAT
//ITERACION 4 


solicitanteController.denunciar_trabajador = function (req, res) {
  //const { _idSolicitudes, _descripcionDenuncia, _urlPruebas} = req.body;
  var _req$body4 = req.body,
      _idSolicitudes = _req$body4._idSolicitudes,
      _descripcionDenuncia = _req$body4._descripcionDenuncia;
  var _urlPruebas = req.file.path;
  var sql = "call SP_POST_Denunciar(?,?,?)";

  _cloudinary["default"].v2.uploader.upload(_urlPruebas).then(function (result) {
    _database["default"].query(sql, [_idSolicitudes, _descripcionDenuncia, result.url], function (error, data) {
      if (!error) {
        _fsExtra["default"].unlink(_urlPruebas, function () {
          res.status(200).send({
            status: "Success",
            message: "Denuncia efectuada",
            code: 200
          });
        });
      } else {
        res.status(400).send({
          status: "Error",
          message: "Denuncia no enviada",
          code: 400
        });
      }
    });
  })["catch"](function (error) {
    console.log('No se obtuvo respuesta de cloudinary: ', error);
  });
};

solicitanteController.listar_contratos_con_trabajadores = function (req, res) {
  var _idSolicitantes = req.body._idSolicitantes;
  var sql = 'call SP_GET_ListarContratosConTrabajadores(?)';

  _database["default"].query(sql, [_idSolicitantes], function (error, data) {
    if (!error) {
      res.status(200).send({
        status: "Success",
        message: data[0],
        code: 200
      });
    } else {
      res.status(400).send({
        status: "Error",
        message: "Error en el servidor",
        code: 400
      });
    }
  });
};

var _default = solicitanteController;
exports["default"] = _default;