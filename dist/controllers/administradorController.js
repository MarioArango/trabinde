"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _database = _interopRequireDefault(require("../database"));

var _crearToken = _interopRequireDefault(require("../util/crearToken"));

var administradorController = {}; //ITERACION 3

administradorController.login_administrador = function (req, res) {
  var _req$body = req.body,
      _dni = _req$body._dni,
      _password = _req$body._password;
  var sql = 'call SP_GET_LoginAdministrador(?,?)';

  _database["default"].getConnection(sql, [_dni, _password], function (error, data) {
    if (!error) {
      var tkn = _crearToken["default"].signToken(data[0][0].idAdministradores);

      res.status(200).header('auth-token', tkn).send({
        status: "Success",
        data: data[0][0],
        code: 200
      });
    } else {
      res.status(400).send({
        status: "Error",
        message: "Administrador no encontrado",
        code: 400
      });
    }
  });
};

administradorController.listar_trabajadores = function (req, res) {
  var sql = 'call SP_GET_AdministradorListarTrabajadores()';

  _database["default"].getConnection(sql, function (error, data) {
    if (!error) {
      res.status(200).send({
        status: "Success",
        message: data[0],
        code: 200
      });
    } else {
      res.status(400).send({
        status: "Error",
        message: "No se logro obtener los trabajadores",
        code: 400
      });
    }
  });
};

administradorController.listar_solicitantes = function (req, res) {
  var sql = 'call SP_GET_AdministradorListarSolicitantes()';

  _database["default"].getConnection(sql, function (error, data) {
    if (!error) {
      res.status(200).send({
        status: "Success",
        message: data[0],
        code: 200
      });
    } else {
      res.status(400).send({
        status: "Error",
        message: "No se logro obtener los solicitantes",
        code: 400
      });
    }
  });
};

administradorController.deshabilitar_habilitar_solicitante = function (req, res) {
  var _dni = req.body._dni;
  var sql = 'call SP_PUT_AdministradorDeshabilitarHabilitarSolicitante(?)';
  var sql1 = 'SELECT s.estadoUsuario FROM solicitantes AS s JOIN persona AS p ON s.idPersona = p.idPersona WHERE p.dni = ?';

  _database["default"].getConnection(sql1, [_dni], function (error, data) {
    var estadoUsuario = data[0].estadoUsuario;

    _database["default"].getConnection(sql, [_dni], function (err, dat) {
      if (!error) {
        if (estadoUsuario == 1) {
          res.status(200).send({
            status: "Success",
            message: "Solicitante deshabilitado",
            code: 200
          });
        } else {
          res.status(200).send({
            status: "Success",
            message: "Solicitante habilitado",
            code: 200
          });
        }
      } else {
        res.status(400).send({
          status: "Error",
          message: "No se deshabilitar el usuario",
          code: 400
        });
      }
    });
  });
};

administradorController.deshabilitar_habilitar_trabajador = function (req, res) {
  var _dni = req.body._dni;
  var sql = 'call SP_PUT_AdministradorDeshabilitarHabilitarTrabajador(?)';
  var sql1 = 'SELECT t.estadoUsuario FROM trabajadores AS t JOIN persona AS p ON t.idPersona = p.idPersona WHERE p.dni = ?';

  _database["default"].getConnection(sql1, [_dni], function (error, data) {
    var estadoUsuario = data[0].estadoUsuario;

    _database["default"].getConnection(sql, [_dni], function (err, dat) {
      if (!error) {
        if (estadoUsuario == 1) {
          res.status(200).send({
            status: "Success",
            message: "Trabajador deshabilitado",
            code: 200
          });
        } else {
          res.status(200).send({
            status: "Success",
            message: "Trabajador habilitado",
            code: 200
          });
        }
      } else {
        res.status(400).send({
          status: "Error",
          message: "No se deshabilitar el usuario",
          code: 400
        });
      }
    });
  });
}; //ITERACION 4
//FOTO


administradorController.numero_denuncias_solicitante = function (req, res) {
  var _idSolicitantes = req.body._idSolicitantes;
  var sql = 'call SP_GET_AdministradorNumeroDeDenunciasDelSolicitantes(?)';

  _database["default"].getConnection(sql, [_idSolicitantes], function (error, data) {
    if (!error) {
      res.status(200).send({
        status: "Success",
        data: data[0][0],
        code: 200
      });
    } else {
      res.status(400).send({
        status: "Error",
        message: "No se pudo obtener el numero de denuncias",
        code: 400
      });
    }
  });
};

administradorController.numero_denuncias_trabajador = function (req, res) {
  var _idTrabajadores = req.body._idTrabajadores;
  var sql = 'call SP_GET_AdministradorNumeroDeDenunciasDelTrabajador(?)';

  _database["default"].getConnection(sql, [_idTrabajadores], function (error, data) {
    if (!error) {
      res.status(200).send({
        status: "Success",
        data: data[0][0],
        code: 200
      });
    } else {
      res.status(400).send({
        status: "Error",
        message: "No se pudo obtener el numero de denuncias",
        code: 400
      });
    }
  });
};

administradorController.listar_denuncias_a_solicitantes = function (req, res) {
  var _idSolicitantes = req.body._idSolicitantes;
  var sql = 'call SP_GET_ListarDenunciasASolicitantes(?)';

  _database["default"].getConnection(sql, [_idSolicitantes], function (error, data) {
    if (!error) {
      res.status(200).send({
        status: "Success",
        data: data[0],
        code: 200
      });
    } else {
      res.status(400).send({
        status: "Error",
        message: "No se pudo obtener",
        code: 400
      });
    }
  });
};

administradorController.listar_denuncias_a_trabajadores = function (req, res) {
  var _idTrabajadores = req.body._idTrabajadores;
  var sql = 'call SP_GET_ListarDenunciasATrabajadores(?)';

  _database["default"].getConnection(sql, [_idTrabajadores], function (error, data) {
    if (!error) {
      res.status(200).send({
        status: "Success",
        data: data[0],
        code: 200
      });
    } else {
      res.status(400).send({
        status: "Error",
        message: "No se pudo obtener",
        code: 400
      });
    }
  });
};

var _default = administradorController;
exports["default"] = _default;