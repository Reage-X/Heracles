import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import Utilisateur from '../../models/Utilisateur.js';
import { 
    envoyerEmailActivation, 
    envoyerMotDePasseTemporaire, 
    envoyerCodeChangementEmail 
} from '../../utils/emailService.js';

const saltRounds = 10;

export const inscription = async (req, res, next) => {
    const { nom, prenom, pseudo, email, motDePasse } = req.body;

    if (!nom || !prenom || !pseudo || !email || !motDePasse) {
        return res.status(400).json({ error: "Tous les champs sont obligatoires." });
    }
    if (motDePasse.length < 6) {
        return res.status(400).json({ error: "Le mot de passe doit contenir au moins 6 caractères." });
    }

    try {
        const existingUser = await Utilisateur.findOne({
            $or: [{ email: email.toLowerCase().trim() }, { pseudo: pseudo.trim() }]
        });

        if (existingUser) {
            if (existingUser.estActive) {
                if (existingUser.email === email.toLowerCase().trim()) {
                    return res.status(409).json({ error: "Cet email est déjà associé à un compte." });
                }
                if (existingUser.pseudo === pseudo.trim()) {
                    return res.status(409).json({ error: "Ce pseudo est déjà pris." });
                }
            } 
            
            if (Date.now() > new Date(existingUser.codeExpiration).getTime()) {
                await Utilisateur.findByIdAndDelete(existingUser._id);
            } 
            else {
                if (existingUser.email !== email.toLowerCase().trim()) {
                    return res.status(409).json({ error: "Ce pseudo ou cet email est temporairement réservé en attente d'activation. Veuillez patienter 10 minutes." });
                }

                const tempsEcoule = Date.now() - new Date(existingUser.codeEnvoyeA).getTime();
                if (tempsEcoule < 60000) {
                    const tempsRestant = Math.ceil((60000 - tempsEcoule) / 1000);
                    return res.status(429).json({ error: `Veuillez patienter ${tempsRestant} secondes avant de demander un nouveau code.` });
                }

                const hashedPassword = await bcrypt.hash(motDePasse, saltRounds);
                const codeActivation = Math.floor(100000 + Math.random() * 900000).toString();

                existingUser.nom = nom;
                existingUser.prenom = prenom;
                existingUser.motDePasse = hashedPassword;
                existingUser.codeActivation = codeActivation;
                existingUser.codeExpiration = new Date(Date.now() + 10 * 60 * 1000);
                existingUser.codeEnvoyeA = new Date();

                await existingUser.save();
                await envoyerEmailActivation(existingUser.email, existingUser.prenom, codeActivation);
                return res.status(200).json({ message: "Un nouveau code d'activation vous a été envoyé par e-mail." });
            }
        }

        const hashedPassword = await bcrypt.hash(motDePasse, saltRounds);
        const codeActivation = Math.floor(100000 + Math.random() * 900000).toString();
        
        const nouvelUtilisateur = await Utilisateur.create({
            nom,
            prenom,
            pseudo,
            email: email.toLowerCase().trim(),
            motDePasse: hashedPassword,
            estActive: false,
            codeActivation,
            codeExpiration: new Date(Date.now() + 10 * 60 * 1000), 
            codeEnvoyeA: new Date()
        });

        try {
            await envoyerEmailActivation(nouvelUtilisateur.email, prenom, codeActivation);
        } catch (emailError) {
            await Utilisateur.findByIdAndDelete(nouvelUtilisateur._id);
            return res.status(500).json({ error: "L'envoi de l'e-mail a échoué. Veuillez vérifier l'adresse." });
        }

        res.status(201).json({ message: "Compte créé. Veuillez entrer le code d'activation reçu par e-mail." });

    } catch (error) {
        next(error);
    }
};

export const renvoyerCode = async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "L'adresse e-mail est obligatoire." });
    }

    try {
        const user = await Utilisateur.findOne({ email: email.toLowerCase().trim() });

        if (!user || user.estActive) {
            return res.status(200).json({ message: "Si le compte existe et nécessite une validation, un nouveau code a été envoyé." });
        }

        const tempsEcoule = Date.now() - new Date(user.codeEnvoyeA).getTime();
        if (tempsEcoule < 60000) {
            const tempsRestant = Math.ceil((60000 - tempsEcoule) / 1000);
            return res.status(429).json({ error: `Veuillez patienter ${tempsRestant} secondes avant de demander un nouveau code.` });
        }

        const codeActivation = Math.floor(100000 + Math.random() * 900000).toString();
        
        user.codeActivation = codeActivation;
        user.codeExpiration = new Date(Date.now() + 10 * 60 * 1000);
        user.codeEnvoyeA = new Date();
        await user.save();

        try {
            await envoyerEmailActivation(user.email, user.prenom, codeActivation);
        } catch (error) {
            return res.status(500).json({ error: "Échec de l'envoi de l'e-mail de confirmation. Veuillez réessayer." });
        }

        res.status(200).json({ message: "Un nouveau code d'activation vous a été envoyé par e-mail." });

    } catch (error) {
        next(error);
    }
};

export const activerCompte = async (req, res, next) => {
    const { email, code } = req.body;

    if (!email || !code) {
        return res.status(400).json({ error: "Données d'activation manquantes." });
    }

    try {
        const user = await Utilisateur.findOne({ email: email.toLowerCase().trim() });

        if (!user) {
            return res.status(404).json({ error: "Aucun compte trouvé avec cet e-mail." });
        }

        if (user.estActive) {
            return res.status(400).json({ error: "Ce compte est déjà activé." });
        }

        if (Date.now() > new Date(user.codeExpiration).getTime()) {
            await Utilisateur.findByIdAndDelete(user._id);
            return res.status(400).json({ error: "Ce code a expiré (plus de 10 min). Le compte a été purgé, veuillez vous réinscrire." });
        }

        if (user.codeActivation !== code.trim()) {
            return res.status(400).json({ error: "Le code de confirmation est incorrect." });
        }

        user.estActive = true;
        user.codeActivation = undefined;
        user.codeExpiration = undefined;
        user.codeEnvoyeA = undefined;
        await user.save();

        res.status(200).json({ message: "Félicitations, votre compte Heracles est désormais actif !" });

    } catch (error) {
        next(error);
    }
};

export const connexion = async (req, res, next) => {
    const { identifiant, motDePasse } = req.body;

    if (!identifiant || !motDePasse) {
        return res.status(400).json({ error: "Veuillez fournir un identifiant et un mot de passe." });
    }

    try {
        const user = await Utilisateur.findOne({
            $or: [
                { email: identifiant.toLowerCase().trim() }, 
                { pseudo: identifiant.trim() }
            ]
        });

        if (!user) {
            return res.status(401).json({ error: "Identifiants incorrects." });
        }

        if (!user.estActive) {
            return res.status(403).json({ 
                error: "Votre compte n'est pas encore activé. Veuillez saisir votre code de confirmation.",
                email: user.email,
                statut: "INACTIF"
            });
        }

        const isMatch = await bcrypt.compare(motDePasse, user.motDePasse);
        if (!isMatch) {
            return res.status(401).json({ error: "Identifiants incorrects." });
        }

        const token = jwt.sign(
            { userId: user.id }, 
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.status(200).json({
            message: "Connexion réussie !",
            token,
            user
        });

    } catch (error) {
        next(error);
    }
};

export const motDePasseOublie = async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "L'adresse e-mail est obligatoire." });
    }

    try {
        const user = await Utilisateur.findOne({ email: email.toLowerCase().trim() });

        if (!user) {
            return res.status(200).json({ message: "Si cette adresse est correcte, un e-mail de réinitialisation vous a été envoyé." });
        }

        const mdpTemporaire = crypto.randomBytes(4).toString('hex');
        const hashedPassword = await bcrypt.hash(mdpTemporaire, saltRounds);

        user.motDePasse = hashedPassword;
        await user.save();

        await envoyerMotDePasseTemporaire(user.email, mdpTemporaire);

        res.status(200).json({ message: "Si cette adresse est correcte, un e-mail de réinitialisation vous a été envoyé." });

    } catch (error) {
        next(error);
    }
};

export const getProfil = async (req, res, next) => {
    try {
        const user = await Utilisateur.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};

export const modifierProfil = async (req, res, next) => {
    const { nom, prenom, pseudo } = req.body;
    const userId = req.user.userId;

    if (!nom || !prenom || !pseudo) {
        return res.status(400).json({ error: "Les champs ne peuvent pas être vides." });
    }

    try {
        const duplicateCheck = await Utilisateur.findOne({
            pseudo: pseudo.trim(),
            _id: { $ne: userId }
        });

        if (duplicateCheck) {
            return res.status(409).json({ error: "Ce nouveau pseudo est déjà pris." });
        }

        const userMisAJour = await Utilisateur.findByIdAndUpdate(
            userId,
            { nom: nom.trim(), prenom: prenom.trim(), pseudo: pseudo.trim() },
            { new: true, runValidators: true }
        );

        res.status(200).json({ 
            message: "Vos informations ont été modifiées avec succès.",
            user: userMisAJour 
        });

    } catch (error) {
        next(error);
    }
};

export const changerMotDePasse = async (req, res, next) => {
    const { ancienMotDePasse, nouveauMotDePasse } = req.body;
    const userId = req.user.userId;

    if (!ancienMotDePasse || !nouveauMotDePasse) {
        return res.status(400).json({ error: "Tous les champs sont obligatoires." });
    }
    if (nouveauMotDePasse.length < 6) {
        return res.status(400).json({ error: "Le nouveau mot de passe doit contenir au moins 6 caractères." });
    }

    try {
        const user = await Utilisateur.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé." });
        }

        const isMatch = await bcrypt.compare(ancienMotDePasse, user.motDePasse);
        if (!isMatch) {
            return res.status(401).json({ error: "Le mot de passe actuel est incorrect." });
        }

        const hashedPassword = await bcrypt.hash(nouveauMotDePasse, saltRounds);
        user.motDePasse = hashedPassword;
        await user.save();

        res.status(200).json({ message: "Mot de passe modifié avec succès." });
    } catch (error) {
        next(error);
    }
};

export const demandeChangementEmail = async (req, res, next) => {
    const { nouvelEmail } = req.body;
    const userId = req.user.userId;

    if (!nouvelEmail) {
        return res.status(400).json({ error: "La nouvelle adresse email est obligatoire." });
    }

    try {
        const emailCible = nouvelEmail.toLowerCase().trim();
        
        const duplicateCheck = await Utilisateur.findOne({ email: emailCible });
        if (duplicateCheck) {
            return res.status(409).json({ error: "Cette adresse email est déjà utilisée par un autre compte." });
        }

        const user = await Utilisateur.findById(userId);
        if (user.email === emailCible) {
            return res.status(400).json({ error: "La nouvelle adresse doit être différente de l'actuelle." });
        }

        const codeActuel = Math.floor(100000 + Math.random() * 900000).toString();
        const codeNouveau = Math.floor(100000 + Math.random() * 900000).toString();

        user.provisoireEmail = emailCible;
        user.codeEmailActuel = codeActuel;
        user.codeEmailNouveau = codeNouveau;
        user.expireCodesEmail = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        await envoyerCodeChangementEmail(user.email, codeActuel, "ancienne");
        await envoyerCodeChangementEmail(emailCible, codeNouveau, "nouvelle");

        res.status(200).json({ message: "Les codes de validation ont été envoyés sur vos deux adresses email." });
    } catch (error) {
        next(error);
    }
};

export const confirmerChangementEmail = async (req, res, next) => {
    const { codeActuel, codeNouveau } = req.body;
    const userId = req.user.userId;

    if (!codeActuel || !codeNouveau) {
        return res.status(400).json({ error: "Les deux codes de validation sont obligatoires." });
    }

    try {
        const user = await Utilisateur.findById(userId);
        if (!user || !user.provisoireEmail) {
            return res.status(400).json({ error: "Aucune procédure de changement d'email n'est en cours." });
        }

        if (Date.now() > new Date(user.expireCodesEmail).getTime()) {
            return res.status(400).json({ error: "Les codes de validation ont expiré. Veuillez réémettre une demande." });
        }

        if (user.codeEmailActuel !== codeActuel.trim() || user.codeEmailNouveau !== codeNouveau.trim()) {
            return res.status(400).json({ error: "L'un ou les deux codes saisis sont incorrects." });
        }

        user.email = user.provisoireEmail;
        user.provisoireEmail = undefined;
        user.codeEmailActuel = undefined;
        user.codeEmailNouveau = undefined;
        user.expireCodesEmail = undefined;
        await user.save();

        res.status(200).json({ message: "Votre adresse email a été mise à jour avec succès.", email: user.email });
    } catch (error) {
        next(error);
    }
};

export const supprimerCompte = async (req, res, next) => {
    try {
        await Utilisateur.findByIdAndDelete(req.user.userId);
        res.status(200).json({ message: "Compte supprimé avec succès." });
    } catch (error) {
        next(error);
    }
};