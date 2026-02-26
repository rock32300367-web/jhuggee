import mongoose, { Document, Schema } from "mongoose";

export interface ISeller extends Document {
  userId: mongoose.Types.ObjectId;
  shopName: string;
  shopDescription?: string;
  gstin?: string;
  bankAccount: {
    accountNumber: string;
    ifsc: string;
    accountHolder: string;
  };
  address: {
    line1: string;
    city: string;
    state: string;
    pincode: string;
  };
  logo?: string;
  isApproved: boolean;
  totalSales: number;
  rating: number;
  ratingCount: number;
}

const SellerSchema = new Schema<ISeller>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    shopName: { type: String, required: true, trim: true },
    shopDescription: { type: String },
    gstin: { type: String },
    bankAccount: {
      accountNumber: { type: String, required: true },
      ifsc: { type: String, required: true },
      accountHolder: { type: String, required: true },
    },
    address: {
      line1: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    logo: { type: String },
    isApproved: { type: Boolean, default: true },
    totalSales: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Seller =
  mongoose.models.Seller || mongoose.model<ISeller>("Seller", SellerSchema);
