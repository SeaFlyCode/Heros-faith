import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReport extends Document {
  story_id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  reason: string;
  createdAt: Date;
}

const ReportSchema: Schema<IReport> = new Schema<IReport>({
  story_id: { type: Schema.Types.ObjectId, ref: 'Story', required: true },
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true }
}, { timestamps: { createdAt: true, updatedAt: false } });

export const Report: Model<IReport> = mongoose.model<IReport>('Report', ReportSchema);

