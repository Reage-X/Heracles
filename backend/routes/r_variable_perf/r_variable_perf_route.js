import expressRouter from 'express';
const router = expressRouter.Router();

import { 
    createVariablePerf, 
    getVariablesPerf 
} from './r_variable_perf_methode.js';
import verifierToken from '../../security/auth.js';

router.use(verifierToken);

router.route('/')
    .post(createVariablePerf)
    .get(getVariablesPerf);

export default router;