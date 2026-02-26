import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { ok, err } from "@/lib/api";
import { Product } from "@/models/Product";
import { Seller } from "@/models/Seller"; // Pre-load schema for .populate()
import { User } from "@/models/User"; // Pre-load schema because Seller refs User
import { SortOrder } from "mongoose";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    // Prevent Webpack from tree-shaking these imports by referencing them
    Seller.init();
    User.init();

    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const category = searchParams.get("category");
    const search = searchParams.get("q");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sort = searchParams.get("sort") || "createdAt";

    // ── Build filter ──
    const filter: Record<string, unknown> = { isActive: true };
    if (category) filter.category = { $regex: new RegExp(`^${category}$`, "i") };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) (filter.price as Record<string, number>).$gte = Number(minPrice);
      if (maxPrice) (filter.price as Record<string, number>).$lte = Number(maxPrice);
    }
    if (search) filter.$text = { $search: search };

    // ── Sort map — typed correctly for Mongoose ──
    const sortMap: Record<string, Record<string, SortOrder>> = {
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      rating: { rating: -1 },
      popular: { sold: -1 },
      createdAt: { createdAt: -1 },
    };

    const sortOption = sortMap[sort] ?? sortMap.createdAt;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sortOption)
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("sellerId", "shopName")
        .lean(),
      Product.countDocuments(filter),
    ]);

    return ok({ products, total, page, pages: Math.ceil(total / limit) });
  } catch (e) {
    console.error(e);
    return err("Server error", 500);
  }
}
