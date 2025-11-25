import mongoose, { Schema, Document, Model } from 'mongoose';

export type NoeudType = 'comment' | 'report' | 'rating';

export interface INoeud extends Document {
  type: NoeudType;
  user_id: mongoose.Types.ObjectId;
  story_id: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
}

const NoeudSchema: Schema<INoeud> = new Schema<INoeud>({
  type: { type: String, enum: ['comment', 'report', 'rating'], required: true },
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  story_id: { type: Schema.Types.ObjectId, ref: 'Story', required: true },
  content: { type: String, required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

export const Noeud: Model<INoeud> = mongoose.model<INoeud>('Noeud', NoeudSchema);

