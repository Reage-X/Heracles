import FilDiscussion from '../../models/Discussion.js';
import Equipe from '../../models/Equipe.js';

export const createFil = async (req, res, next) => {
    const { equipeId, typeFil, ficheId, joueurId } = req.body;

    if (!equipeId || !typeFil) {
        return res.status(400).json({ error: "L'identifiant de l'équipe et le type de fil sont obligatoires." });
    }

    try {
        const equipe = await Equipe.findById(equipeId);
        if (!equipe) {
            return res.status(404).json({ error: "Équipe non trouvée." });
        }

        const nouveauFil = await FilDiscussion.create({
            equipeId,
            typeFil,
            ficheId: ficheId || null,
            joueurId: joueurId || null,
            messages: []
        });

        res.status(201).json(nouveauFil);
    } catch (error) {
        next(error);
    }
};

export const getDiscussionsUtilisateur = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        const githubEquipes = await Equipe.find({
            $or: [
                { coachs: userId },
                { joueurs: userId }
            ]
        });

        const equipeIds = githubEquipes.map(eq => eq._id);

        for (const equipeId of equipeIds) {
            const filExiste = await FilDiscussion.findOne({ equipeId, typeFil: 'general' });
            if (!filExiste) {
                await FilDiscussion.create({
                    equipeId,
                    typeFil: 'general',
                    messages: []
                });
            }
        }

        const discussions = await FilDiscussion.find({ equipeId: { $in: equipeIds } })
            .populate('equipeId', 'nom')
            .populate('joueurId', 'nom prenom pseudo');

        discussions.sort((a, b) => {
            const dateA = a.messages && a.messages.length > 0 
                ? new Date(a.messages[a.messages.length - 1].dateEnvoi).getTime() 
                : new Date(a.dateCreation).getTime();
            
            const dateB = b.messages && b.messages.length > 0 
                ? new Date(b.messages[b.messages.length - 1].dateEnvoi).getTime() 
                : new Date(b.dateCreation).getTime();
                
            return dateB - dateA;
        });

        res.status(200).json(discussions);
    } catch (error) {
        next(error);
    }
};

export const getDiscussionById = async (req, res, next) => {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    try {
        const discussion = await FilDiscussion.findById(id)
            .populate('equipeId', 'nom')
            .populate('messages.expediteurId', 'nom prenom pseudo');

        if (!discussion) {
            return res.status(404).json({ error: "Fil de discussion non trouvé." });
        }

        const discussionJSON = discussion.toJSON();
        const totalMessages = discussionJSON.messages.length;
        
        const startIndex = Math.max(0, totalMessages - (page * limit));
        const endIndex = totalMessages - ((page - 1) * limit);

        const paginatedMessages = endIndex > 0 ? discussionJSON.messages.slice(startIndex, endIndex) : [];

        const responseDiscussion = {
            ...discussionJSON,
            messages: paginatedMessages
        };

        res.status(200).json({
            discussion: responseDiscussion,
            totalMessages,
            page,
            limit
        });
    } catch (error) {
        next(error);
    }
};

export const envoyerMessage = async (req, res, next) => {
    const { contenu } = req.body;

    if (!contenu || contenu.trim() === "") {
        return res.status(400).json({ error: "Le contenu du message ne peut pas être vide." });
    }

    try {
        const nouveauMessage = {
            expediteurId: req.user.userId,
            contenu: contenu.trim(),
            dateEnvoi: new Date()
        };

        req.discussion.messages.push(nouveauMessage);
        await req.discussion.save();

        const filMisAJour = await FilDiscussion.findById(req.discussion._id)
            .populate('messages.expediteurId', 'nom prenom pseudo');

        const dernierMessage = filMisAJour.messages[filMisAJour.messages.length - 1];

        res.status(201).json(dernierMessage);
    } catch (error) {
        next(error);
    }
};