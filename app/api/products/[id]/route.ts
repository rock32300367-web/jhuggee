import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { ok, err } from "@/lib/api";
import { Product } from "@/models/Product";
import { Seller } from "@/models/Seller"; // Pre-load schema for .populate()
import mongoose from "mongoose";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // ✅ Pehle check karo — valid MongoDB ObjectId hai ya nahi
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return err("Product not found", 404);
    }

    await connectDB();
    const product = await Product.findById(params.id)
      .populate("sellerId", "shopName logo rating ratingCount")
      .lean();

    if (!product) return err("Product not found", 404);
    return ok(product);
  } catch (e) {
    console.error(e);
    return err("Server error", 500);
  }
}
