import expressRouter from 'express';
const router = expressRouter.Router();

import { 
    createEquipe, 
    getEquipes, 
    getEquipeById, 
    updateEquipe, 
    deleteEquipe,
    ajouterCoach, 
    revoquerCoach, 
    ajouterAthlete, 
    revoquerAthlete,
    transfererCoachPrincipal
} from './r_equipe_methode.js';
import verifierToken from '../../security/auth.js';
import { estCoachOuAdminEquipe } from '../../security/permission.js';

router.use(verifierToken);

router.route('/')
    .post(createEquipe)
    .get(getEquipes);

router.put('/:id/ajouter-coach', estCoachOuAdminEquipe, ajouterCoach);
router.put('/:id/revoquer-coach', estCoachOuAdminEquipe, revoquerCoach);
router.put('/:id/ajouter-athlete', estCoachOuAdminEquipe, ajouterAthlete);
router.put('/:id/revoquer-athlete', estCoachOuAdminEquipe, revoquerAthlete);
router.put('/:id/transferer-createur', estCoachOuAdminEquipe, transfererCoachPrincipal);

router.route('/:id')
    .get(getEquipeById)
    .put(estCoachOuAdminEquipe, updateEquipe)
    .delete(estCoachOuAdminEquipe, deleteEquipe);

export default router;