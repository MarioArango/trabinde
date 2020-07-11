const { Router } = require('express');
const trabajadorController = require('../controllers/trabajadorController');
const verificarToken = require('../middleware/verificarToken');

const router = Router();

//ITERACION 1
router.post('/registro-trabajador', trabajadorController.registro_trabajador);
router.get('/login-trabajador', trabajadorController.login_trabajador);

//ITERACION 2

router.post('/subir-publicacion-galeria', verificarToken, trabajadorController.subir_publicacion_galeria);

router.get('/perfil-publico-trabajador', verificarToken, trabajadorController.perfil_publico_trabajador);
router.get('/perfil-privado-trabajador', verificarToken, trabajadorController.perfil_privado_trabajador);

router.put('/editar-foto-perfil-trabajador', verificarToken, trabajadorController.editar_foto_perfil_trabajador);

//ITERACION 4
router.put('/denunciar-solicitante', verificarToken, trabajadorController.denunciar_solicitante);
router.get('/listar-contratos-con-solicitantes', verificarToken, trabajadorController.listar_contratos_con_solicitantes);

module.exports = router;