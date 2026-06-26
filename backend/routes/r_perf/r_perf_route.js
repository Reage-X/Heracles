import expressRouter from 'express';
const router = expressRouter.Router();

import { 
    createPerf, 
    getStatsJoueur,
    getPerfs, 
    getPerfById, 
    updatePerf, 
    deletePerf 
} from './r_perf_methode.js';
import verifierToken from '../../security/auth.js';
import { estCreateurOuCoachPerf } from '../../security/permission.js';

router.use(verifierToken);

router.route('/')
    .post(createPerf)
    .get(getPerfs);

router.route('/stats/:joueurId')
    .get(getStatsJoueur);
    
router.route('/:id')
    .get(getPerfById)
    .put(estCreateurOuCoachPerf, updatePerf)    
    .delete(estCreateurOuCoachPerf, deletePerf);

export default router;