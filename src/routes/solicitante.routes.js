import { Router } from 'express';
import solicitanteController from '../controllers/solicitanteController';
import verificarToken from '../middleware/verificarToken';

const router = Router();

//ITERACION 1
router.post('/registro-solicitante', solicitanteController.registro_solicitante);

router.get('/login-solicitante', solicitanteController.login_solicitante);

router.get('/listar-servicios-trabajadores', verificarToken, solicitanteController.listar_servicios_trabajadores);

router.get('/buscador-servicios-trabajadores', verificarToken, solicitanteController.buscador_servicios_trabajadores);


//ITERACION 2
router.post('/calificar-trabajador-individual', verificarToken, solicitanteController.calificar_trabajador_individual);

router.get('/perfil-solicitante', verificarToken, solicitanteController.perfil_solicitante);

//ITERACION 4
router.post('/denunciar-trabajador', verificarToken, solicitanteController.denunciar_trabajador);
router.get('/listar-contratos-con-trabajadores', verificarToken, solicitanteController.listar_contratos_con_trabajadores);

export default router;