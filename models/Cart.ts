import mongoose, { Document, Schema } from "mongoose";

export interface ICart extends Document {
  userId: mongoose.Types.ObjectId;
  items: {
    productId: mongoose.Types.ObjectId;
    qty: number;
    size?: string;
    color?: string;
  }[];
}

const CartSchema = new Schema<ICart>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product" },
        qty: { type: Number, default: 1 },
        size: String,
        color: String,
      },
    ],
  },
  { timestamps: true }
);

export const Cart =
  mongoose.models.Cart || mongoose.model<ICart>("Cart", CartSchema);
