import mongoose, { Document, Schema } from "mongoose";

export interface IProduct extends Document {
  sellerId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  images: string[];
  price: number;
  mrp: number;
  stock: number;
  sizes?: string[];
  colors?: string[];
  tags: string[];
  rating: number;
  ratingCount: number;
  sold: number;
  isActive: boolean;
  freeDelivery: boolean;
  deliveryDays: number;
}

const ProductSchema = new Schema<IProduct>(
  {
    sellerId: { type: Schema.Types.ObjectId, ref: "Seller", required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true, index: true },
    subcategory: { type: String },
    images: [{ type: String }],
    price: { type: Number, required: true },
    mrp: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    sizes: [{ type: String }],
    colors: [{ type: String }],
    tags: [{ type: String }],
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    sold: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    freeDelivery: { type: Boolean, default: true },
    deliveryDays: { type: Number, default: 5 },
  },
  { timestamps: true }
);

ProductSchema.index({ name: "text", tags: "text", category: "text" });

export const Product =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
