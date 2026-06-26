import express from 'express';
import expressRouter from 'express';
const router = expressRouter.Router();

import { 
    createStructure, 
    getStructures, 
    getStructureById, 
    updateStructure, 
    deleteStructure,
    ajouterAdmin,
    revoquerAdmin,
    transfererStructurePrincipal
} from './r_structure_methode.js';

import verifierToken from '../../security/auth.js';
import { estAdminStructure } from '../../security/permission.js';

router.use(verifierToken);

router.route('/')
    .post(createStructure)
    .get(getStructures);

router.put('/:id/ajouter-admin', estAdminStructure, ajouterAdmin);
router.put('/:id/revoquer-admin', estAdminStructure, revoquerAdmin);
router.put('/:id/transferer-createur', estAdminStructure, transfererStructurePrincipal);

router.route('/:id')
    .get(getStructureById) 
    .put(estAdminStructure, updateStructure)
    .delete(estAdminStructure, deleteStructure);

export default router;