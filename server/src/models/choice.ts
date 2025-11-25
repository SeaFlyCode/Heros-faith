import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IChoice extends Document {
  page_id: mongoose.Types.ObjectId;
  text: string;
  target_page_id: mongoose.Types.ObjectId;
  condition?: string;
}

const ChoiceSchema: Schema<IChoice> = new Schema<IChoice>({
  page_id: { type: Schema.Types.ObjectId, ref: 'Page', required: true },
  text: { type: String, required: true },
  target_page_id: { type: Schema.Types.ObjectId, ref: 'Page', required: true },
  condition: { type: String }
});

export const Choice: Model<IChoice> = mongoose.model<IChoice>('Choice', ChoiceSchema);

