import mongoose from 'mongoose';

const equipeSchema = new mongoose.Schema({
    nom: { type: String, required: true, trim: true },
    structureId: { type: mongoose.Schema.Types.ObjectId, ref: 'Structure', required: true },
    createur: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur', required: true },
    coachs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur' }],
    joueurs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur' }]
}, { timestamps: true });

equipeSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  }
});

const Equipe = mongoose.model('Equipe', equipeSchema);
export default Equipe;