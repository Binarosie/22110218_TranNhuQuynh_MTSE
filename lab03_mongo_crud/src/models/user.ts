import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  address?: string;
  phoneNumber?: string;
  gender?: boolean;
  roleId: string;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    address: String,
    phoneNumber: String,
    gender: Boolean,
    roleId: { type: String, required: true },
  },
  { timestamps: true }
);

export const User = model<IUser>('User', userSchema);