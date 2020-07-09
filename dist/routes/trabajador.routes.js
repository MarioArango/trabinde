"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = require("express");

var _trabajadorController = _interopRequireDefault(require("../controllers/trabajadorController"));

var _verificarToken = _interopRequireDefault(require("../middleware/verificarToken"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var router = (0, _express.Router)(); //ITERACION 1

router.post('/registro-trabajador', _trabajadorController["default"].registro_trabajador);
router.get('/login-trabajador', _trabajadorController["default"].login_trabajador); //ITERACION 2

router.post('/subir-publicacion-galeria', _verificarToken["default"], _trabajadorController["default"].subir_publicacion_galeria);
router.get('/perfil-publico-trabajador', _verificarToken["default"], _trabajadorController["default"].perfil_publico_trabajador);
router.get('/perfil-privado-trabajador', _verificarToken["default"], _trabajadorController["default"].perfil_privado_trabajador);
router.put('/editar-foto-perfil-trabajador', _verificarToken["default"], _trabajadorController["default"].editar_foto_perfil_trabajador); //ITERACION 4

router.post('/denunciar-solicitante', _verificarToken["default"], _trabajadorController["default"].denunciar_solicitante);
router.get('/listar-contratos-con-solicitantes', _verificarToken["default"], _trabajadorController["default"].listar_contratos_con_solicitantes);
var _default = router;
exports["default"] = _default;