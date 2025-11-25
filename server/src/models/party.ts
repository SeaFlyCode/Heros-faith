import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IParty extends Document {
  user_id: mongoose.Types.ObjectId;
  story_id: mongoose.Types.ObjectId;
  start_date: Date;
  end_date?: Date;
  path: mongoose.Types.ObjectId[];
  ending_id?: mongoose.Types.ObjectId;
}

const PartySchema: Schema<IParty> = new Schema<IParty>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  story_id: { type: Schema.Types.ObjectId, ref: 'Story', required: true },
  start_date: { type: Date, default: Date.now },
  end_date: { type: Date },
  path: [{ type: Schema.Types.ObjectId, ref: 'Page' }],
  ending_id: { type: Schema.Types.ObjectId, ref: 'Page' }
});

export const Party: Model<IParty> = mongoose.model<IParty>('Party', PartySchema);

