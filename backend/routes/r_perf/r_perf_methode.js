import Perf from '../../models/Perf.js';
import Equipe from '../../models/Equipe.js';
import VariableDef from '../../models/VariablePerf.js';
import mongoose from 'mongoose';

export const createPerf = async (req, res, next) => {
    const { titre, texteContenu, mediaUrl, equipeId, estPourEquipe, joueurId, donneesMetriques } = req.body;

    if (!titre || !texteContenu || !equipeId) {
        return res.status(400).json({ error: "Le titre, le contenu textuel et l'identifiant de l'équipe sont obligatoires." });
    }

    try {
        const equipe = await Equipe.findById(equipeId);
        if (!equipe) {
            return res.status(404).json({ error: "Équipe associée non trouvée." });
        }

        if (donneesMetriques && donneesMetriques.length > 0) {
            for (let item of donneesMetriques) {
                const def = await VariableDef.findById(item.variableId);
                if (!def) return res.status(404).json({ error: `La variable métrique ${item.variableId} n'existe pas.` });

                if (def.typeDonnee === 'numerique') {
                    if (item.valeurNumerique === undefined || item.valeurNumerique === null) {
                        return res.status(400).json({ error: `La valeur pour la variable numérique '${def.nom}' est manquante.` });
                    }
                    if (def.maxValeur && item.valeurNumerique > def.maxValeur) {
                        return res.status(400).json({ error: `La valeur pour '${def.nom}' dépasse le maximum autorisé (${def.maxValeur}).` });
                    }
                }

                if (def.typeDonnee === 'textuel') {
                    if (!item.valeurTextuelle) {
                        return res.status(400).json({ error: `Le choix de mot pour '${def.nom}' est obligatoire.` });
                    }
                    if (!def.optionsTexte.includes(item.valeurTextuelle)) {
                        return res.status(400).json({ error: `Le choix '${item.valeurTextuelle}' n'est pas une option valide pour '${def.nom}'. Options valides: ${def.optionsTexte.join(', ')}` });
                    }
                }
            }
        }

        const nouvelleFiche = await Perf.create({
            titre,
            texteContenu,
            mediaUrl: mediaUrl || null,
            equipeId,
            estPourEquipe: estPourEquipe || false,
            joueurId: estPourEquipe ? null : joueurId,
            createurId: req.user.userId,
            donneesMetriques: donneesMetriques || []
        });

        res.status(201).json(nouvelleFiche);
    } catch (error) {
        next(error);
    }
};

export const getStatsJoueur = async (req, res, next) => {
    const { joueurId } = req.params;

    try {
        const stats = await Perf.aggregate([
            { $match: { joueurId: new mongoose.Types.ObjectId(joueurId) } },
            { $unwind: "$donneesMetriques" },
            {
                $group: {
                    _id: "$donneesMetriques.variableId",
                    moyenne: { $avg: "$donneesMetriques.valeurNumerique" },
                    meilleurScore: { $max: "$donneesMetriques.valeurNumerique" },
                    pireScore: { $min: "$donneesMetriques.valeurNumerique" },
                    nombreDeSaisies: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "variabledefs",
                    localField: "_id",
                    foreignField: "_id",
                    as: "detailsVariable"
                }
            },
            { $unwind: "$detailsVariable" },
            {
                $project: {
                    _id: 0,
                    variableId: "$_id",
                    nomVariable: "$detailsVariable.nom",
                    unite: "$detailsVariable.unite",
                    type: "$detailsVariable.typeDonnee",
                    analyse: {
                        moyenne: { $round: ["$moyenne", 1] },
                        maximum: "$meilleurScore",
                        minimum: "$pireScore",
                        totalEntrees: "$nombreDeSaisies"
                    }
                }
            }
        ]);

        res.status(200).json({ joueurId, statistiques: stats });
    } catch (error) {
        next(error);
    }
};

export const getPerfs = async (req, res, next) => {
    const { equipeId, joueurId } = req.query;

    try {
        let filtre = {};
        if (equipeId) filtre.equipeId = equipeId;
        if (joueurId) filtre.joueurId = joueurId;

        const fiches = await Perf.find(filtre)
            .populate('equipeId', 'nom')
            .populate('joueurId', 'nom prenom pseudo')
            .populate('createurId', 'nom prenom pseudo');

        res.status(200).json(fiches);
    } catch (error) {
        next(error);
    }
};

export const getPerfById = async (req, res, next) => {
    try {
        const fiche = await Perf.findById(req.params.id)
            .populate('equipeId', 'nom')
            .populate('joueurId', 'nom prenom pseudo')
            .populate('createurId', 'nom prenom pseudo');

        if (!fiche) {
            return res.status(404).json({ error: "Fiche performance non trouvée." });
        }
        res.status(200).json(fiche);
    } catch (error) {
        next(error);
    }
};

export const updatePerf = async (req, res, next) => {
    const { titre, texteContenu, mediaUrl, estPourEquipe, joueurId } = req.body;

    try {
        if (titre) req.perf.titre = titre;
        if (texteContenu) req.perf.texteContenu = texteContenu;
        if (mediaUrl !== undefined) req.perf.mediaUrl = mediaUrl;
        if (estPourEquipe !== undefined) req.perf.estPourEquipe = estPourEquipe;
        if (joueurId !== undefined) req.perf.joueurId = joueurId;

        const ficheModifiee = await req.perf.save();
        res.status(200).json({ message: "Fiche de performance mise à jour.", perf: ficheModifiee });
    } catch (error) {
        next(error);
    }
};

export const deletePerf = async (req, res, next) => {
    try {
        await Perf.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Fiche de performance supprimée définitivement." });
    } catch (error) {
        next(error);
    }
};