import { Router } from 'express';
import administradorController from '../controllers/administradorController';
const router = Router();

router.get('/login-administrador', administradorController.login_administrador);
router.get('/listar-trabajadores', administradorController.listar_trabajadores);
router.get('/listar-solicitantes', administradorController.listar_solicitantes);
router.put('/deshabilitar-habilitar-solicitante', administradorController.deshabilitar_habilitar_solicitante);
router.put('/deshabilitar-habilitar-trabajador', administradorController.deshabilitar_habilitar_trabajador);

router.get('/numero-denuncias-solicitante', administradorController.numero_denuncias_solicitante);
router.get('/numero-denuncias-trabajador', administradorController.numero_denuncias_trabajador);
router.get('/listar-denuncias-a-solicitantes', administradorController.listar_denuncias_a_solicitantes);
router.get('/listar-denuncias-a-trabajadores', administradorController.listar_denuncias_a_trabajadores);

export default router;