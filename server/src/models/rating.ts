import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRating extends Document {
  user_id: mongoose.Types.ObjectId;
  story_id: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
  createdAt: Date;
}

const RatingSchema: Schema<IRating> = new Schema<IRating>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  story_id: { type: Schema.Types.ObjectId, ref: 'Story', required: true },
  rating: { type: Number, required: true },
  comment: { type: String }
}, { timestamps: { createdAt: true, updatedAt: false } });

export const Rating: Model<IRating> = mongoose.model<IRating>('Rating', RatingSchema);

