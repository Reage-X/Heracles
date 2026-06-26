import mongoose from 'mongoose';

const variableDefSchema = new mongoose.Schema({
    nom: { type: String, required: true, trim: true },
    typeDonnee: { type: String, enum: ['numerique', 'textuel'], required: true },
    unite: { type: String, default: null },
    maxValeur: { type: Number, default: null }, 
    optionsTexte: [{ type: String }], 
    structureId: { type: mongoose.Schema.Types.ObjectId, ref: 'Structure', default: null },
    createurId: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur', required: true }
}, { timestamps: true });

const VariableDef = mongoose.model('VariableDef', variableDefSchema);
export default VariableDef;