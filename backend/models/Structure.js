import mongoose from 'mongoose';

const structureSchema = new mongoose.Schema({
    nom: { type: String, required: true, trim: true },
    createur: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur', required: true },
    administrateurs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur' }]
}, { timestamps: true });

structureSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  }
});

const Structure = mongoose.model('Structure', structureSchema);
export default Structure;