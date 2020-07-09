import { Router } from 'express';
import trabajadorController from '../controllers/trabajadorController';

const router = Router();

//ITERACION 1
router.post('/registro-trabajador', trabajadorController.registro_trabajador);
router.get('/login-trabajador', trabajadorController.login_trabajador);

//ITERACION 2

router.post('/subir-publicacion-galeria', trabajadorController.subir_publicacion_galeria);

router.get('/perfil-publico-trabajador', trabajadorController.perfil_publico_trabajador);
router.get('/perfil-privado-trabajador', trabajadorController.perfil_privado_trabajador);

router.put('/editar-foto-perfil-trabajador', trabajadorController.editar_foto_perfil_trabajador);

//ITERACION 4
router.post('/denunciar-solicitante', trabajadorController.denunciar_solicitante);
router.get('/listar-contratos-con-solicitantes', trabajadorController.listar_contratos_con_solicitantes);

export default router;