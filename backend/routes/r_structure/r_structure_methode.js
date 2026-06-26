import Structure from '../../models/Structure.js';
import Utilisateur from '../../models/Utilisateur.js';
import Equipe from '../../models/Equipe.js';

export const createStructure = async (req, res, next) => {
    const { nom } = req.body;

    if (!nom) {
        return res.status(400).json({ error: "Le nom de la structure est obligatoire." });
    }

    try {
        const nouvelleStructure = await Structure.create({
            nom,
            createur: req.user.userId, 
            administrateurs: [req.user.userId] 
        });

        res.status(201).json(nouvelleStructure);
    } catch (error) {
        next(error);
    }
};

export const getStructures = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        const equipesUtilisateur = await Equipe.find({
            $or: [
                { coachs: userId },
                { joueurs: userId }
            ]
        });

        const structureIdsDesEquipes = equipesUtilisateur.map(eq => eq.structureId);

        const structures = await Structure.find({
            $or: [
                { administrateurs: userId },
                { _id: { $in: structureIdsDesEquipes } }
            ]
        })
        .populate('createur', 'nom prenom pseudo')
        .populate('administrateurs', 'nom prenom pseudo');

        res.status(200).json(structures);
    } catch (error) {
        next(error);
    }
};

export const getStructureById = async (req, res, next) => {
    try {
        const structure = await Structure.findById(req.params.id)
            .populate('createur', 'nom prenom pseudo')
            .populate('administrateurs', 'nom prenom pseudo');

        if (!structure) {
            return res.status(404).json({ error: "Structure non trouvée." });
        }
        res.status(200).json(structure);
    } catch (error) {
        next(error);
    }
};

export const updateStructure = async (req, res, next) => {
    const { nom } = req.body;

    if (!nom) {
        return res.status(400).json({ error: "Le nom ne peut pas être vide." });
    }

    try {
        req.structure.nom = nom;
        const structureModifiee = await req.structure.save();

        res.status(200).json({ message: "Structure modifiée avec succès.", structure: structureModifiee });
    } catch (error) {
        next(error);
    }
};

export const deleteStructure = async (req, res, next) => {
    try {
        const structureId = req.params.id;
        
        await Structure.findByIdAndDelete(structureId);
        await Equipe.deleteMany({ structureId: structureId });

        res.status(200).json({ message: "Structure et équipes associées supprimées définitivement." });
    } catch (error) {
        next(error);
    }
};

export const ajouterAdmin = async (req, res, next) => {
    const { pseudo } = req.body;

    if (!pseudo) {
        return res.status(400).json({ error: "Le pseudo du membre à rajouter est obligatoire." });
    }

    try {
        const structure = req.structure || await Structure.findById(req.params.id);
        if (!structure) {
            return res.status(404).json({ error: "Structure non trouvée." });
        }

        if (structure.createur.toString() !== req.user.userId) {
            return res.status(403).json({ error: "Accès refusé. Seul le créateur originel de la structure peut nommer un directeur." });
        }

        const utilisateurCible = await Utilisateur.findOne({ pseudo: pseudo.trim() });
        if (!utilisateurCible) {
            return res.status(404).json({ error: "Aucun utilisateur Heracles trouvé avec ce pseudo." });
        }

        const dejaAdmin = structure.administrateurs.some(
            (adminId) => adminId.toString() === utilisateurCible._id.toString()
        );
        if (dejaAdmin) {
            return res.status(400).json({ error: "Cet utilisateur possède déjà les droits de direction." });
        }

        structure.administrateurs.push(utilisateurCible._id);
        await structure.save();

        res.status(200).json({ message: "Nouveau directeur nommé avec succès !" });
    } catch (error) {
        next(error);
    }
};

export const revoquerAdmin = async (req, res, next) => {
    const { adminId } = req.body;

    if (!adminId) {
        return res.status(400).json({ error: "L'identifiant du directeur à révoquer est requis." });
    }

    try {
        const structure = req.structure || await Structure.findById(req.params.id);
        if (!structure) {
            return res.status(404).json({ error: "Structure non trouvée." });
        }

        if (structure.createur.toString() !== req.user.userId) {
            return res.status(403).json({ error: "Accès refusé. Seul le créateur originel peut révoquer un directeur." });
        }

        if (structure.createur.toString() === adminId.toString()) {
            return res.status(400).json({ error: "Action impossible. Le créateur originel ne peut pas s'auto-révoquer." });
        }

        const estAdmin = structure.administrateurs.some(
            (id) => id.toString() === adminId.toString()
        );
        if (!estAdmin) {
            return res.status(400).json({ error: "Cet utilisateur ne fait pas partie du conseil de direction." });
        }

        structure.administrateurs = structure.administrateurs.filter(
            (id) => id.toString() !== adminId.toString()
        );
        await structure.save();

        res.status(200).json({ message: "Droits de direction révoqués avec succès." });
    } catch (error) {
        next(error);
    }
};

export const transfererStructurePrincipal = async (req, res, next) => {
    const { pseudo } = req.body;

    if (!pseudo) {
        return res.status(400).json({ error: "Le pseudo du nouveau Fondateur de l'organisation est obligatoire." });
    }

    try {
        const structure = req.structure || await Structure.findById(req.params.id);
        if (!structure) {
            return res.status(404).json({ error: "Structure non trouvée." });
        }

        if (structure.createur.toString() !== req.user.userId) {
            return res.status(403).json({ error: "Accès refusé. Seul le Fondateur originel peut transférer la propriété de cette structure." });
        }

        const utilisateurCible = await Utilisateur.findOne({ pseudo: pseudo.trim() });
        if (!utilisateurCible) {
            return res.status(404).json({ error: "Aucun membre Heracles trouvé avec ce pseudo." });
        }

        if (structure.createur.toString() === utilisateurCible._id.toString()) {
            return res.status(400).json({ error: "Cet utilisateur est déjà enregistré comme le Fondateur suprême." });
        }

        structure.createur = utilisateurCible._id;

        const dejaAdmin = structure.administrateurs.some(id => id.toString() === utilisateurCible._id.toString());
        if (!dejaAdmin) {
            structure.administrateurs.push(utilisateurCible._id);
        }

        await structure.save();
        res.status(200).json({ message: "La propriété de la structure et le titre de Fondateur ont été transférés avec succès !" });

    } catch (error) {
        next(error);
    }
};