import mongoose from 'mongoose';

const metriqueInputSchema = new mongoose.Schema({
    variableId: { type: mongoose.Schema.Types.ObjectId, ref: 'VariablePerf', required: true },
    valeurNumerique: { type: Number, default: null },
    valeurTextuelle: { type: String, default: null }
});

const perfSchema = new mongoose.Schema({
    titre: { type: String, required: true, trim: true },
    texteContenu: { type: String, required: true },
    mediaUrl: { type: String, default: null },
    dateParution: { type: Date, default: Date.now },
    equipeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipe', required: true },
    estPourEquipe: { type: Boolean, default: false },
    joueurId: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur', default: null },
    createurId: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur', required: true },
    
    donneesMetriques: [metriqueInputSchema]
}, { timestamps: true });

perfSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.password;
  }
});

const Perf = mongoose.model('Perf', perfSchema, 'fiches_performance');
export default Perf;