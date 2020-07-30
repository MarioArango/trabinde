const { Router } = require('express');
const trabajadorController = require('../controllers/trabajadorController');
const verificarToken = require('../middleware/verificarToken');

const router = Router();

//ITERACION 1
router.post('/registro-trabajador', trabajadorController.registro_trabajador);
router.post('/login-trabajador', trabajadorController.login_trabajador);

//ITERACION 2

router.post('/subir-publicacion-galeria', verificarToken, trabajadorController.subir_publicacion_galeria);

router.post('/perfil-publico-trabajador', verificarToken, trabajadorController.perfil_publico_trabajador);
router.post('/perfil-privado-trabajador', verificarToken, trabajadorController.perfil_privado_trabajador);

router.put('/editar-perfil-trabajador', verificarToken, trabajadorController.editar_perfil_trabajador);

//ITERACION 4
router.put('/denunciar-solicitante', verificarToken, trabajadorController.denunciar_solicitante);
router.post('/listar-contratos-con-solicitantes', verificarToken, trabajadorController.listar_contratos_con_solicitantes);

router.get('/listar-rubros', verificarToken, trabajadorController.listar_rubros);

//CHAT
/*
router.post('/listar-contactos-solicitantes', verificarToken, trabajadorController.listar_contactos_solicitantes);

router.put('/desactivar-estado-chat-trabajador', verificarToken, trabajadorController.desactivar_estado_chat_trabajador);
*/
module.exports = router;