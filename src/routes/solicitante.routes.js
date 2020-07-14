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

module.exports = router;