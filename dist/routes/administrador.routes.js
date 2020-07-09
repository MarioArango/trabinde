"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = require("express");

var _administradorController = _interopRequireDefault(require("../controllers/administradorController"));

var _verificarToken = _interopRequireDefault(require("../middleware/verificarToken"));

var router = (0, _express.Router)(); //ITERACION 3

router.get('/login-administrador', _administradorController["default"].login_administrador);
router.get('/listar-trabajadores', _verificarToken["default"], _administradorController["default"].listar_trabajadores);
router.get('/listar-solicitantes', _verificarToken["default"], _administradorController["default"].listar_solicitantes);
router.put('/deshabilitar-habilitar-solicitante', _verificarToken["default"], _administradorController["default"].deshabilitar_habilitar_solicitante);
router.put('/deshabilitar-habilitar-trabajador', _verificarToken["default"], _administradorController["default"].deshabilitar_habilitar_trabajador); //ITERACION 4

router.get('/numero-denuncias-solicitante', _administradorController["default"].numero_denuncias_solicitante);
router.get('/numero-denuncias-trabajador', _administradorController["default"].numero_denuncias_trabajador);
router.get('/listar-denuncias-a-solicitantes', _verificarToken["default"], _administradorController["default"].listar_denuncias_a_solicitantes);
router.get('/listar-denuncias-a-trabajadores', _verificarToken["default"], _administradorController["default"].listar_denuncias_a_trabajadores);
var _default = router;
exports["default"] = _default;