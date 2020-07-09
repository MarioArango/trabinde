"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = require("express");

var _solicitanteController = _interopRequireDefault(require("../controllers/solicitanteController"));

var _verificarToken = _interopRequireDefault(require("../middleware/verificarToken"));

var router = (0, _express.Router)(); //ITERACION 1

router.post('/registro-solicitante', _solicitanteController["default"].registro_solicitante);
router.get('/login-solicitante', _solicitanteController["default"].login_solicitante);
router.get('/listar-servicios-trabajadores', _verificarToken["default"], _solicitanteController["default"].listar_servicios_trabajadores);
router.get('/buscador-servicios-trabajadores', _verificarToken["default"], _solicitanteController["default"].buscador_servicios_trabajadores); //ITERACION 2

router.post('/calificar-trabajador-individual', _verificarToken["default"], _solicitanteController["default"].calificar_trabajador_individual);
router.get('/perfil-solicitante', _verificarToken["default"], _solicitanteController["default"].perfil_solicitante); //ITERACION 4

router.post('/denunciar-trabajador', _verificarToken["default"], _solicitanteController["default"].denunciar_trabajador);
router.get('/listar-contratos-con-trabajadores', _verificarToken["default"], _solicitanteController["default"].listar_contratos_con_trabajadores);
var _default = router;
exports["default"] = _default;