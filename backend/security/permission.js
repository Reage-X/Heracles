import FilDiscussion from '../models/Discussion.js';
import Equipe from '../models/Equipe.js';
import Perf from '../models/Perf.js';
import Structure from '../models/Structure.js';

export const estMembreDiscussion = async (req, res, next) => {
    const discussionId = req.params.id;
    const userId = req.user.userId;

    try {
        const discussion = await FilDiscussion.findById(discussionId);
        if (!discussion) {
            return res.status(404).json({ error: "Fil de discussion non trouvé." });
        }

        const equipe = await Equipe.findById(discussion.equipeId);
        if (!equipe) {
            return res.status(404).json({ error: "Équipe associée au fil introuvable." });
        }

        const estCoach = equipe.coachs?.some((id) => id.toString() === userId) || false;
        const estJoueur = equipe.joueurs?.some((id) => id.toString() === userId) || false;

        const structure = await Structure.findById(equipe.structureId);
        const estAdminClub = structure?.administrateurs?.some((id) => id.toString() === userId) || false;

        if (estCoach || estJoueur || estAdminClub) {
            req.discussion = discussion;
            return next();
        }

        return res.status(403).json({ error: "Accès refusé. Vous ne faites pas partie de cette équipe." });
    } catch (error) {
        next(error);
    }
};

export const estCoachOuAdminEquipe = async (req, res, next) => {
    const equipeId = req.params.id;
    const userId = req.user.userId;

    try {
        const equipe = await Equipe.findById(equipeId);
        if (!equipe) {
            return res.status(404).json({ error: "Équipe non trouvée." });
        }

        const estCoach = equipe.coachs.some((coachId) => coachId.toString() === userId);
        if (estCoach) {
            req.equipe = equipe;
            return next();
        }

        const structure = await Structure.findById(equipe.structureId);
        const estAdmin = structure?.administrateurs.some((adminId) => adminId.toString() === userId);
        if (estAdmin) {
            req.equipe = equipe;
            return next();
        }

        return res.status(403).json({ error: "Accès refusé. Vous devez être un des coachs de l'équipe ou administrateur du club." });
    } catch (error) {
        next(error);
    }
};

export const estCreateurOuCoachPerf = async (req, res, next) => {
    const perfId = req.params.id;
    const userId = req.user.userId;

    try {
        const perf = await Perf.findById(perfId);
        if (!perf) {
            return res.status(404).json({ error: "Fiche performance non trouvée." });
        }

        if (perf.createurId.toString() === userId) {
            req.perf = perf;
            return next();
        }

        const equipe = await Equipe.findById(perf.equipeId);

        const estCoach = equipe?.coachs.some((coachId) => coachId.toString() === userId);
        if (estCoach) {
            req.perf = perf;
            return next();
        }

        const structure = await Structure.findById(equipe?.structureId);
        const estAdmin = structure?.administrateurs.some((adminId) => adminId.toString() === userId);
        if (estAdmin) {
            req.perf = perf;
            return next();
        }

        return res.status(403).json({ error: "Accès refusé. Vous devez être l'auteur de la fiche, un coach de l'équipe ou l'admin du club." });
    } catch (error) {
        next(error);
    }
};

export const estAdminStructure = async (req, res, next) => {
    const structureId = req.params.id; 
    const userId = req.user.userId;

    try {
        const structure = await Structure.findById(structureId);

        if (!structure) {
            return res.status(404).json({ error: "Structure non trouvée." });
        }

        const isAdmin = structure.administrateurs.some(
            (adminId) => adminId.toString() === userId
        );

        if (!isAdmin) {
            return res.status(403).json({ error: "Accès refusé. Vous n'êtes pas administrateur de cette structure." });
        }

        req.structure = structure;
        next();
    } catch (error) {
        next(error);
    }
};