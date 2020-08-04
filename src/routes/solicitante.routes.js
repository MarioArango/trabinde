const { Router } = require('express');
const solicitanteController = require('../controllers/solicitanteController');
const verificarToken = require('../middleware/verificarToken');

const router = Router();

//ITERACION 1
router.post('/registro-solicitante', solicitanteController.registro_solicitante);

router.post('/login-solicitante', solicitanteController.login_solicitante);

router.get('/listar-servicios-trabajadores', verificarToken, solicitanteController.listar_servicios_trabajadores);

router.post('/buscador-servicios-trabajadores', verificarToken, solicitanteController.buscador_servicios_trabajadores);


//ITERACION 2
router.put('/calificar-trabajador-individual', verificarToken, solicitanteController.calificar_trabajador_individual);

router.post('/perfil-solicitante', verificarToken, solicitanteController.perfil_solicitante);

//ITERACION 4
router.put('/denunciar-trabajador', verificarToken, solicitanteController.denunciar_trabajador);
router.post('/listar-contratos-con-trabajadores', verificarToken, solicitanteController.listar_contratos_con_trabajadores);

router.put('/cambiar-contrasenia-solicitante', verificarToken, solicitanteController.cambiar_contrasenia_solicitante);

router.post('/recuperar-contrasenia', solicitanteController.recuperar_contrasenia);

//CHAT

router.post('/listar-contactos-trabajadores', verificarToken, solicitanteController.listar_contactos_trabajadores);

router.put('/desactivar_estado_chat_solicitante', verificarToken, solicitanteController.desactivar_estado_chat_solicitante);

module.exports = router;