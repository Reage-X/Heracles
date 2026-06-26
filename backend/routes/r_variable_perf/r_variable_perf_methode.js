import VariablePerf from '../../models/VariablePerf.js';
import Structure from '../../models/Structure.js';

export const createVariablePerf = async (req, res, next) => {
    const { nom, typeDonnee, unite, maxValeur, optionsTexte, structureId } = req.body;

    if (!nom || !typeDonnee) {
        return res.status(400).json({ error: "Le nom et le type de donnée (numerique/textuel) sont obligatoires." });
    }

    try {
        if (structureId) {
            const structure = await Structure.findById(structureId);
            if (!structure) return res.status(404).json({ error: "Structure non trouvée." });
            
            const isAdmin = structure.administrateurs.some(adminId => adminId.toString() === req.user.userId);
            if (!isAdmin && req.user.role !== 'superadmin') {
                return res.status(403).json({ error: "Accès refusé. Vous devez être admin de la structure." });
            }
        }

        const nouvelleVariable = await VariablePerf.create({
            nom,
            typeDonnee,
            unite: typeDonnee === 'numerique' ? unite : null,
            maxValeur: typeDonnee === 'numerique' ? maxValeur : null,
            optionsTexte: typeDonnee === 'textuel' ? optionsTexte : [],
            structureId: structureId || null, 
            createurId: req.user.userId
        });

        res.status(201).json(nouvelleVariable);
    } catch (error) {
        next(error);
    }
};

export const getVariablesPerf = async (req, res, next) => {
    const { structureId } = req.query;

    try {
        const conditions = [{ structureId: null }];
        if (structureId) {
            conditions.push({ structureId: structureId });
        }

        const variables = await VariablePerf.find({ $or: conditions });
        res.status(200).json(variables);
    } catch (error) {
        next(error);
    }
};