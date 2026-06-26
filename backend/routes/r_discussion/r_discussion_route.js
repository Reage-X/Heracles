import expressRouter from 'express';
const router = expressRouter.Router();

import { 
    createFil, 
    getDiscussionsUtilisateur,
    getDiscussionById, 
    envoyerMessage 
} from './r_discussion_methode.js';
import verifierToken from '../../security/auth.js';
import { estMembreDiscussion } from '../../security/permission.js';

router.use(verifierToken);

router.post('/', createFil);
router.get('/mes-discussions', getDiscussionsUtilisateur);
router.get('/:id', estMembreDiscussion, getDiscussionById);
router.post('/:id/messages', estMembreDiscussion, envoyerMessage);

export default router;