import express from 'express';
import { 
    inscription, 
    activerCompte,
    connexion,
    renvoyerCode,
    motDePasseOublie,
    getProfil, 
    modifierProfil, 
    supprimerCompte,
    changerMotDePasse,
    demandeChangementEmail,
    confirmerChangementEmail
} from './r_utilisateur_methode.js';
import verifierToken from '../../security/auth.js'; 

const router = express.Router();

router.post('/inscription', inscription);
router.post('/activation', activerCompte);
router.post('/connexion', connexion);
router.post('/renvoyer-code', renvoyerCode);
router.post('/mot-de-passe-oublie', motDePasseOublie);

router.use(verifierToken);

router.get('/profil', getProfil);
router.put('/modifier', modifierProfil);
router.put('/modifier-mdp', changerMotDePasse);
router.post('/demande-email', demandeChangementEmail);
router.post('/confirmer-email', confirmerChangementEmail);
router.delete('/supprimer', supprimerCompte);

export default router;