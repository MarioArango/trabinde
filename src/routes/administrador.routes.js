const { Router } = require('express');
const administradorController = require('../controllers/administradorController')
const verificarToken = require('../middleware/verificarToken')

const router = Router();

//ITERACION 3

router.post('/login-administrador', administradorController.login_administrador);

router.get('/listar-trabajadores', verificarToken, administradorController.listar_trabajadores);

router.get('/listar-trabajadores-por-distrito/:_distrito', verificarToken, administradorController.listar_trabajadores_por_distrito);

router.get('/listar-trabajadores-con-denuncia', verificarToken, administradorController.listar_trabajadores_con_denuncia);

router.get('/listar-solicitantes', verificarToken, administradorController.listar_solicitantes);

router.get('/listar-solicitantes-por-distrito/:_distrito', verificarToken, administradorController.listar_solicitantes_por_distrito);

router.get('/listar-solicitantes-con-denuncia', verificarToken, administradorController.listar_solicitantes_con_denuncia);

router.put('/deshabilitar-habilitar-solicitante', verificarToken, administradorController.deshabilitar_habilitar_solicitante);

router.put('/deshabilitar-habilitar-trabajador', verificarToken, administradorController.deshabilitar_habilitar_trabajador);

//ITERACION 4

//router.post('/numero-denuncias-solicitante', verificarToken,administradorController.numero_denuncias_solicitante);
//router.post('/numero-denuncias-trabajador', verificarToken, administradorController.numero_denuncias_trabajador);
router.post('/listar-denuncias-a-solicitantes', verificarToken, administradorController.listar_denuncias_a_solicitantes);
router.post('/listar-denuncias-a-trabajadores', verificarToken, administradorController.listar_denuncias_a_trabajadores);


module.exports = router;