import mongoose from 'mongoose';

const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

const utilisateurSchema = new mongoose.Schema({
    nom: { type: String, required: true, trim: true },
    prenom: { type: String, required: true, trim: true },
    pseudo: { type: String, required: true, unique: true, trim: true },
    email: { 
        type: String, 
        required: [true, "L'adresse email est obligatoire"], 
        unique: true, 
        trim: true, 
        lowercase: true,
        match: [emailRegex, "Veuillez fournir un format d'adresse email valide"]
    },
    motDePasse: { type: String, required: true },
    estActive: { type: Boolean, default: false },
    codeActivation: { type: String },
    codeExpiration: { type: Date },
    codeEnvoyeA: { type: Date },
    
    provisoireEmail: { type: String, trim: true, lowercase: true },
    codeEmailActuel: { type: String },
    codeEmailNouveau: { type: String },
    expireCodesEmail: { type: Date }
}, { timestamps: true });

utilisateurSchema.set('toJSON', {
  transform: (doc, ret) => {
    if (ret && ret._id && typeof ret._id.toString === 'function') {
        ret.id = ret._id.toString();
    }
    delete ret._id;
    delete ret.__v;
    delete ret.motDePasse;
    delete ret.codeActivation;
    delete ret.codeExpiration;
    delete ret.codeEnvoyeA;
  }
});

const Utilisateur = mongoose.model('Utilisateur', utilisateurSchema);
export default Utilisateur;