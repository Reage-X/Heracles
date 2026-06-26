import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    expediteurId: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur', required: true },
    contenu: { type: String, required: true },
    dateEnvoi: { type: Date, default: Date.now }
});

const filDiscussionSchema = new mongoose.Schema({
    equipeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipe', required: true },
    typeFil: { type: String, enum: ['general', 'entrainement'], required: true },
    ficheId: { type: mongoose.Schema.Types.ObjectId, ref: 'FichePerformance', default: null },
    joueurId: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur', default: null },     
    dateCreation: { type: Date, default: Date.now },
    
    messages: [messageSchema] 
}, { timestamps: true });

filDiscussionSchema.set('toJSON', {
  transform: (doc, ret) => {
    if (ret && ret._id && typeof ret._id.toString === 'function') {
        ret.id = ret._id.toString();   
    }
    delete ret._id;
    delete ret.__v;
  } 
});

const FilDiscussion = mongoose.model('FilDiscussion', filDiscussionSchema);
export default FilDiscussion;