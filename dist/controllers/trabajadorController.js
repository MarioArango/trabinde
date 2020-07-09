"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _dotenv = _interopRequireDefault(require("dotenv"));

var _database = _interopRequireDefault(require("../database"));

var _crearToken = _interopRequireDefault(require("../util/crearToken"));

var _encriptacion = _interopRequireDefault(require("../util/encriptacion"));

var _cloudinary = _interopRequireDefault(require("cloudinary"));

var _bcryptjs = _interopRequireDefault(require("bcryptjs"));

var _fsExtra = _interopRequireDefault(require("fs-extra"));

_dotenv["default"].config();

_cloudinary["default"].config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

var trabajadorController = {}; //ITERACION 1

trabajadorController.registro_trabajador = function (req, res) {
  var _req$body = req.body,
      _nombre = _req$body._nombre,
      _apellidoPaterno = _req$body._apellidoPaterno,
      _apellidoMaterno = _req$body._apellidoMaterno,
      _dni = _req$body._dni,
      _distrito = _req$body._distrito,
      _emailTrabajadores = _req$body._emailTrabajadores,
      _password = _req$body._password,
      _telefono = _req$body._telefono;
  var _foto = req.file.path;
  var sql = 'call SP_POST_RegistroTrabajador(?,?,?,?,?,?,?,?,?)';

  _database["default"].query('SELECT*FROM trabajadores WHERE emailTrabajadores = ?', [_emailTrabajadores], function (er, dt) {
    if (dt[0] == undefined) {
      _database["default"].query('SELECT*FROM persona AS p WHERE p.dni = ?', [_dni], function (error, data) {
        if (data[0] == undefined) {
          _encriptacion["default"].password(_password).then(function (passwordEncriptado) {
            _cloudinary["default"].v2.uploader.upload(_foto).then(function (result) {
              _database["default"].query(sql, [_nombre, _apellidoPaterno, _apellidoMaterno, _dni, _distrito, result.url, _emailTrabajadores, passwordEncriptado, _telefono], function (error, data) {
                if (!error) {
                  _fsExtra["default"].unlink(_foto, function () {
                    res.status(200).send({
                      status: "Success",
                      message: "Registrado",
                      code: 200
                    });
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
              console.log('No se obtuvo respuesta de cloudinary: ', error);
            });
          })["catch"](function (error) {
            console.log('Error de red');
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

trabajadorController.login_trabajador = function (req, res) {
  var _req$body2 = req.body,
      _emailTrabajadores = _req$body2._emailTrabajadores,
      _password = _req$body2._password;
  var sql = 'call SP_GET_LoginTrabajador(?, ?)';
  var sql2 = 'SELECT t.emailTrabajadores, t.password FROM trabajadores AS t WHERE t.emailTrabajadores = ?';

  _database["default"].query(sql2, [_emailTrabajadores], /*#__PURE__*/function () {
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
                _database["default"].query(sql, [_emailTrabajadores, passwordEncriptado], function (error, data) {
                  if (!error) {
                    var tkn = _crearToken["default"].signToken(data[0][0].idTrabajadores);

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
}; //ITERACION 2


trabajadorController.subir_publicacion_galeria = function (req, res) {
  //const { _idTrabajadores, _urlimagen, _descripcion } = req.body;
  var _req$body3 = req.body,
      _idTrabajadores = _req$body3._idTrabajadores,
      _descripcion = _req$body3._descripcion;
  var _urlimagen = req.file.path;
  var sql = 'call SP_POST_SubirPublicacionGaleria(?, ?, ?)';

  _cloudinary["default"].v2.uploader.upload(_urlimagen).then(function (result) {
    _database["default"].query(sql, [_idTrabajadores, result.url, _descripcion], function (error, data) {
      if (!error) {
        _fsExtra["default"].unlink(_urlimagen, function () {
          res.status(200).send({
            status: "Success",
            message: "Publicación subida",
            code: 200
          });
        });
      } else {
        res.status(400).send({
          status: "Error",
          message: "No se pudo subir la publicación",
          code: 400
        });
      }
    });
  })["catch"](function (error) {
    console.log('No se obtuvo respuesta de cloudinary: ', error);
  });
};

trabajadorController.perfil_publico_trabajador = function (req, res) {
  var _idTrabajadores = req.body._idTrabajadores;
  var sql1 = 'call SP_GET_PerfilPrivadoTrabajador(?)';
  var sql2 = 'call SP_GET_ListarPublicaciones(?)';

  _database["default"].query(sql1, [_idTrabajadores], function (error, data) {
    var perfil = data[0][0];

    _database["default"].query(sql2, [_idTrabajadores], function (err, dat) {
      perfil.publicaciones = dat[0];

      if (!error) {
        res.status(200).send({
          status: "Success",
          data: perfil,
          code: 200
        });
      } else {
        res.status(400).send({
          status: "Error",
          message: "Trabajador no encontrado",
          code: 400
        });
      }
    });
  });
};

trabajadorController.perfil_privado_trabajador = function (req, res) {
  var _idTrabajadores = req.body._idTrabajadores;
  var sql = 'call SP_GET_PerfilPrivadoTrabajador(?)';

  _database["default"].query(sql, [_idTrabajadores], function (error, data) {
    if (!error) {
      res.status(200).send({
        status: "Success",
        data: data[0],
        code: 200
      });
    } else {
      res.status(400).send({
        status: "Error",
        message: "Trabajador no encontrado",
        code: 400
      });
    }
  });
};

trabajadorController.editar_foto_perfil_trabajador = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(req, res) {
    var _idPersona, _foto, sql;

    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            //const { _idPersona, _foto } = req.body;
            _idPersona = req.body._idPersona;
            _foto = req.file.path;
            sql = 'call SP_PUT_EditarFotoPerfilTrabajador(?,?)';

            _cloudinary["default"].v2.uploader.upload(_foto).then(function (result) {
              _database["default"].query(sql, [_idPersona, result.url], function (error, data) {
                if (!error) {
                  _fsExtra["default"].unlink(_foto, function () {
                    res.status(200).send({
                      status: "Success",
                      message: "Foto actualizada",
                      code: 200
                    });
                  });
                } else {
                  res.status(400).send({
                    status: "Error",
                    message: "No se pudo actulizar su foto de perfil",
                    code: 400
                  });
                }
              });
            })["catch"](function (error) {
              console.log('No se obtuvo respuesta de cloudinary: ', error);
            });

          case 4:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}(); //ITERACION 4

/*trabajadorController.notificaciones = (req, res) => {
//SOCKET
};*/


trabajadorController.denunciar_solicitante = function (req, res) {
  //const { _idSolicitudes, _descripcionDenuncia, _urlPruebas } = req.body;
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

trabajadorController.listar_contratos_con_solicitantes = function (req, res) {
  var _idTrabajadores = req.body._idTrabajadores;
  var sql = 'call SP_GET_ListarContratosConSolicitantes(?)';

  _database["default"].query(sql, [_idTrabajadores], function (error, data) {
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

var _default = trabajadorController;
exports["default"] = _default;