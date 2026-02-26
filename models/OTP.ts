import mongoose, { Document, Schema } from "mongoose";

export interface IOTP extends Document {
  phone?: string;
  email?: string;
  otp: string;
  expiresAt: Date;
  verified: boolean;
}

const OTPSchema = new Schema<IOTP>({
  phone: { type: String, index: true },
  email: { type: String, index: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  verified: { type: Boolean, default: false },
});

// Auto-delete expired OTPs
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OTP =
  mongoose.models.OTP || mongoose.model<IOTP>("OTP", OTPSchema);
