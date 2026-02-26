import mongoose, { Document, Schema } from "mongoose";

export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled" | "returned";

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  items: {
    productId: mongoose.Types.ObjectId;
    sellerId: mongoose.Types.ObjectId;
    name: string;
    image: string;
    price: number;
    qty: number;
    size?: string;
    color?: string;
  }[];
  address: {
    name: string;
    phone: string;
    line1: string;
    city: string;
    state: string;
    pincode: string;
  };
  total: number;
  deliveryCharge: number;
  paymentMethod: "cod" | "upi" | "card";
  paymentStatus: "pending" | "paid" | "refunded";
  status: OrderStatus;
  orderId: string;
  estimatedDelivery: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product" },
        sellerId: { type: Schema.Types.ObjectId, ref: "Seller" },
        name: String,
        image: String,
        price: Number,
        qty: Number,
        size: String,
        color: String,
      },
    ],
    address: {
      name: String,
      phone: String,
      line1: String,
      city: String,
      state: String,
      pincode: String,
    },
    total: { type: Number, required: true },
    deliveryCharge: { type: Number, default: 0 },
    paymentMethod: { type: String, enum: ["cod", "upi", "card"], default: "cod" },
    paymentStatus: { type: String, enum: ["pending", "paid", "refunded"], default: "pending" },
    status: { type: String, enum: ["pending","confirmed","shipped","delivered","cancelled","returned"], default: "pending" },
    orderId: { type: String, unique: true },
    estimatedDelivery: { type: Date },
  },
  { timestamps: true }
);

// Auto-generate orderId
OrderSchema.pre("save", function (next) {
  if (!this.orderId) {
    this.orderId = "JH" + Date.now().toString(36).toUpperCase();
  }
  next();
});

export const Order =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
