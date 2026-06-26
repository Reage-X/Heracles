import express from 'express';

import r_discussionRoute from './r_discussion/r_discussion_route.js';
import r_equipeRoute from './r_equipe/r_equipe_route.js';
import r_perfRoute from './r_perf/r_perf_route.js';
import r_structureRoute from './r_structure/r_structure_route.js';
import r_utilisateurRoute from './r_utilisateur/r_utilisateur_route.js';
import r_variablePerfRoute from './r_variable_perf/r_variable_perf_route.js';

const mainRouter = express.Router();

mainRouter.use('/r_discussion', r_discussionRoute);
mainRouter.use('/r_equipe', r_equipeRoute);
mainRouter.use('/r_perf', r_perfRoute);
mainRouter.use('/r_structure', r_structureRoute);
mainRouter.use('/r_utilisateur', r_utilisateurRoute);
mainRouter.use('/r_variable-perf', r_variablePerfRoute);

export default mainRouter;