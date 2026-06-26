import Equipe from '../../models/Equipe.js';
import Structure from '../../models/Structure.js';
import Utilisateur from '../../models/Utilisateur.js'; 

export const createEquipe = async (req, res, next) => {
    const { nom, structureId } = req.body;

    if (!nom || !structureId) {
        return res.status(400).json({ error: "Le nom et l'identifiant de la structure sont obligatoires." });
    }

    try {
        const structure = await Structure.findById(structureId);
        if (!structure) {
            return res.status(404).json({ error: "Structure parente non trouvée." });
        }

        const isAdmin = structure.administrateurs.some((adminId) => adminId.toString() === req.user.userId);
        if (!isAdmin) {
            return res.status(403).json({ error: "Accès refusé. Vous devez être administrateur de cette structure." });
        }

        const nouvelleEquipe = await Equipe.create({
            nom,
            structureId,
            createur: req.user.userId, 
            coachs: [req.user.userId],
            joueurs: []
        });

        res.status(201).json(nouvelleEquipe);
    } catch (error) {
        next(error);
    }
};

export const getEquipes = async (req, res, next) => {
    const { structureId } = req.query;
    
    try {
        let filtre = {};
        if (structureId) {
            filtre = { structureId: structureId };
        } else {
            filtre = {
                $or: [{ coachs: req.user.userId }, { joueurs: req.user.userId }]
            };
        }
        
        const equipes = await Equipe.find(filtre)
            .populate('createur', 'nom prenom pseudo') 
            .populate('structureId', 'nom administrateurs') 
            .populate('coachs', 'nom prenom pseudo')
            .populate('joueurs', 'nom prenom pseudo');

        res.status(200).json(equipes);
    } catch (error) {
        next(error);
    }
};

export const getEquipeById = async (req, res, next) => {
    try {
        const equipe = await Equipe.findById(req.params.id)
            .populate('createur', 'nom prenom pseudo')
            .populate('structureId', 'nom administrateurs') 
            .populate('coachs', 'nom prenom pseudo')
            .populate('joueurs', 'nom prenom pseudo');

        if (!equipe) {
            return res.status(404).json({ error: "Équipe non trouvée." });
        }
        res.status(200).json(equipe);
    } catch (error) {
        next(error);
    }
};

export const ajouterCoach = async (req, res, next) => {
    const { pseudo } = req.body;
    try {
        const equipe = await Equipe.findById(req.params.id).populate('structureId');
        if (!equipe) return res.status(404).json({ error: "Équipe non trouvée." });

        const isStructureAdmin = equipe.structureId.administrateurs.some(id => id.toString() === req.user.userId);
        const isTeamCreator = equipe.createur.toString() === req.user.userId;

        if (!isTeamCreator && !isStructureAdmin) {
            return res.status(403).json({ error: "Seul le créateur de l'équipe ou un administrateur de la structure peut affecter un coach." });
        }

        const cible = await Utilisateur.findOne({ pseudo: pseudo.trim() });
        if (!cible) return res.status(404).json({ error: "Membre introuvable." });

        if (equipe.coachs.some(id => id.toString() === cible._id.toString())) {
            return res.status(400).json({ error: "Ce membre est déjà coach de l'équipe." });
        }

        equipe.coachs.push(cible._id);
        await equipe.save();
        res.status(200).json({ message: "Coach ajouté avec succès." });
    } catch (error) { next(error); }
};

export const revoquerCoach = async (req, res, next) => {
    const { coachId } = req.body;
    try {
        const equipe = await Equipe.findById(req.params.id).populate('structureId');
        if (!equipe) return res.status(404).json({ error: "Équipe non trouvée." });

        const isStructureAdmin = equipe.structureId.administrateurs.some(id => id.toString() === req.user.userId);
        const isTeamCreator = equipe.createur.toString() === req.user.userId;

        if (!isTeamCreator && !isStructureAdmin) {
            return res.status(403).json({ error: "Seul le créateur ou un administrateur peut révoquer un coach." });
        }
        
        if (equipe.createur.toString() === coachId.toString()) {
            return res.status(400).json({ error: "Le créateur fondateur de l'équipe ne peut pas être révoqué." });
        }

        equipe.coachs = equipe.coachs.filter(id => id.toString() !== coachId.toString());
        await equipe.save();
        res.status(200).json({ message: "Coach révoqué avec succès." });
    } catch (error) { next(error); }
};

export const ajouterAthlete = async (req, res, next) => {
    const { pseudo } = req.body;
    try {
        const equipe = await Equipe.findById(req.params.id);
        if (!equipe) return res.status(404).json({ error: "Équipe non trouvée." });

        const cible = await Utilisateur.findOne({ pseudo: pseudo.trim() });
        if (!cible) return res.status(404).json({ error: "Athlète introuvable." });

        if (equipe.joueurs.some(id => id.toString() === cible._id.toString())) {
            return res.status(400).json({ error: "Cet athlète est déjà inscrit dans l'équipe." });
        }

        equipe.joueurs.push(cible._id);
        await equipe.save();
        res.status(200).json({ message: "Athlète inscrit avec succès." });
    } catch (error) { next(error); }
};

export const revoquerAthlete = async (req, res, next) => {
    const { athleteId } = req.body;
    try {
        const equipe = await Equipe.findById(req.params.id);
        if (!equipe) return res.status(404).json({ error: "Équipe non trouvée." });

        equipe.joueurs = equipe.joueurs.filter(id => id.toString() !== athleteId.toString());
        await equipe.save();
        res.status(200).json({ message: "Athlète retiré de l'équipe." });
    } catch (error) { next(error); }
};

export const updateEquipe = async (req, res, next) => {
    const { nom } = req.body;
    try {
        if (nom) req.equipe.nom = nom;
        const equipeModifiee = await req.equipe.save();
        res.status(200).json({ message: "Équipe mise à jour.", equipe: equipeModifiee });
    } catch (error) { next(error); }
};

export const deleteEquipe = async (req, res, next) => {
    try {
        const equipe = await Equipe.findById(req.params.id).populate('structureId');
        if (!equipe) return res.status(404).json({ error: "Équipe non trouvée." });

        const isStructureAdmin = equipe.structureId.administrateurs.some(id => id.toString() === req.user.userId);
        const isTeamCreator = equipe.createur.toString() === req.user.userId;

        if (!isTeamCreator && !isStructureAdmin) {
             return res.status(403).json({ error: "Seul le créateur de l'équipe ou un administrateur de la structure peut dissoudre la division." });
        }

        await Equipe.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Équipe supprimée définitivement." });
    } catch (error) { next(error); }
};

export const transfererCoachPrincipal = async (req, res, next) => {
    const { pseudo } = req.body;

    if (!pseudo) {
        return res.status(400).json({ error: "Le pseudo du nouveau coach principal est obligatoire." });
    }

    try {
        const equipe = await Equipe.findById(req.params.id).populate('structureId');
        if (!equipe) {
            return res.status(404).json({ error: "Équipe non trouvée." });
        }

        const isStructureAdmin = equipe.structureId.administrateurs.some(id => id.toString() === req.user.userId);
        const isTeamCreator = equipe.createur.toString() === req.user.userId;

        if (!isTeamCreator && !isStructureAdmin) {
            return res.status(403).json({ error: "Accès refusé. Seul le coach principal actuel ou un administrateur de la structure peut transférer ce poste." });
        }

        const utilisateurCible = await Utilisateur.findOne({ pseudo: pseudo.trim() });
        if (!utilisateurCible) {
            return res.status(404).json({ error: "Aucun membre Heracles trouvé avec ce pseudo." });
        }

        if (equipe.createur.toString() === utilisateurCible._id.toString()) {
            return res.status(400).json({ error: "Cet utilisateur est déjà enregistré comme le coach principal de cette équipe." });
        }

        equipe.createur = utilisateurCible._id;

        const dejaCoach = equipe.coachs.some(id => id.toString() === utilisateurCible._id.toString());
        if (!dejaCoach) {
            equipe.coachs.push(utilisateurCible._id);
        }

        await equipe.save();
        res.status(200).json({ message: "Le poste de Coach Principal a été transféré avec succès !" });

    } catch (error) {
        next(error);
    }
};