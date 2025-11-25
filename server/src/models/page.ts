import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPage extends Document {
  story_id: mongoose.Types.ObjectId;
  content: string;
  is_ending: boolean;
  ending_label?: string;
  illustration?: string;
}

const PageSchema: Schema<IPage> = new Schema<IPage>({
  story_id: { type: Schema.Types.ObjectId, ref: 'Story', required: true },
  content: { type: String, required: true },
  is_ending: { type: Boolean, default: false },
  ending_label: { type: String },
  illustration: { type: String }
});

export const Page: Model<IPage> = mongoose.model<IPage>('Page', PageSchema);

