import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  phone?: string;
  name?: string;
  email?: string;
  password?: string;
  role: "buyer" | "seller" | "admin";
  isVerified: boolean;
  avatar?: string;
  googleId?: string;
  authProvider: "phone" | "google" | "email";
  address?: { line1: string; city: string; state: string; pincode: string; }[];
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  phone: { type: String, sparse: true, index: true },
  name: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true, sparse: true, index: true },
  password: { type: String, select: false },
  role: { type: String, enum: ["buyer", "seller", "admin"], default: "buyer" },
  isVerified: { type: Boolean, default: false },
  avatar: { type: String },
  googleId: { type: String, sparse: true },
  authProvider: { type: String, enum: ["phone", "google", "email"], default: "phone" },
  address: [{ name: String, phone: String, line1: String, city: String, state: String, pincode: String }],
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
