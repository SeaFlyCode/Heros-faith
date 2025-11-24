import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
  createdAt: Date;
}

const UserSchema: Schema<IUser> = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
    role: {type: String, enum: ['user', 'admin'], required: true},
  createdAt: { type: Date, default: Date.now }
});

export const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);

