import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IComment {
  user: mongoose.Types.ObjectId;
  comment: string;
  createdAt: Date;
}

export interface IReport {
  reported: boolean;
  reporter?: mongoose.Types.ObjectId;
  reportDate?: Date;
}

export interface ICensorship {
  censored: boolean;
  admin?: mongoose.Types.ObjectId;
  censorshipDate?: Date;
  reason?: string;
}

export interface IStory extends Document {
  title: string;
  description?: string;
  content: string;
  author: mongoose.Types.ObjectId;
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
  comments: IComment[];
  report: IReport;
  censorship: ICensorship;
}

const CommentSchema = new Schema<IComment>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const StorySchema: Schema<IStory> = new Schema<IStory>({
  title: { type: String, required: true },
  description: { type: String },
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  comments: { type: [CommentSchema], default: [] },
  report: {
    reported: { type: Boolean, default: false },
    reporter: { type: Schema.Types.ObjectId, ref: 'User' },
    reportDate: { type: Date }
  },
  censorship: {
    censored: { type: Boolean, default: false },
    admin: { type: Schema.Types.ObjectId, ref: 'User' },
    censorshipDate: { type: Date },
    reason: { type: String }
  }
}, {
  timestamps: true
});

export const Story: Model<IStory> = mongoose.model<IStory>('Story', StorySchema);
