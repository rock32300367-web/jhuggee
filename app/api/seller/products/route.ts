import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { verifyToken, signToken } from "@/lib/jwt";
import { ok, err } from "@/lib/api";
import { Product } from "@/models/Product";
import { Seller } from "@/models/Seller";
import { User } from "@/models/User";

function getUser(req: NextRequest) {
  const token = req.cookies.get("jh_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function GET(req: NextRequest) {
  const user = getUser(req);
  if (!user) return err("Unauthorized", 401);
  await connectDB();
  const seller = await Seller.findOne({ userId: user.userId });
  if (!seller) return err("Seller profile not found", 404);
  const products = await Product.find({ sellerId: seller._id }).sort({ createdAt: -1 }).lean();
  return ok(products);
}

export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return err("Unauthorized", 401);
  await connectDB();
  const seller = await Seller.findOne({ userId: user.userId });
  if (!seller) return err("Seller profile not found", 404);

  // Auto-approve if not already approved
  if (!seller.isApproved) {
    seller.isApproved = true;
    await seller.save();
  }

  const body = await req.json();
  const { name, description, category, price, mrp, stock, images = [], sizes, colors, tags, freeDelivery, deliveryDays } = body;
  if (!name || !description || !category || !price || !mrp || stock === undefined) return err("Required fields missing");
  if (price > mrp) return err("Price cannot be greater than MRP");

  const product = await Product.create({
    sellerId: seller._id, name, description, category, price, mrp, stock,
    images, sizes, colors, tags: tags || [], freeDelivery: freeDelivery ?? true, deliveryDays: deliveryDays || 5,
  });
  return ok(product, 201);
}

export async function PATCH(req: NextRequest) {
  const user = getUser(req);
  if (!user) return err("Unauthorized", 401);
  await connectDB();
  const seller = await Seller.findOne({ userId: user.userId });
  if (!seller) return err("Seller profile not found", 404);

  const body = await req.json();
  const { productId, ...updates } = body;
  if (!productId) return err("productId required");

  // Sirf is seller ka product update ho
  const product = await Product.findOneAndUpdate(
    { _id: productId, sellerId: seller._id },
    { $set: updates },
    { new: true }
  );
  if (!product) return err("Product not found or unauthorized", 404);
  return ok(product);
}

export async function DELETE(req: NextRequest) {
  const user = getUser(req);
  if (!user) return err("Unauthorized", 401);
  await connectDB();
  const seller = await Seller.findOne({ userId: user.userId });
  if (!seller) return err("Seller profile not found", 404);

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("id");
  if (!productId) return err("productId required");

  const product = await Product.findOneAndDelete({ _id: productId, sellerId: seller._id });
  if (!product) return err("Product not found or unauthorized", 404);
  return ok({ message: "Product delete ho gaya" });
}

// Register seller (PUT)
export async function PUT(req: NextRequest) {
  const user = getUser(req);
  if (!user) return err("Unauthorized", 401);
  await connectDB();

  const existing = await Seller.findOne({ userId: user.userId });

  if (existing) {
    // If seller record exists but role is not seller, fix it
    const updatedUser = await User.findByIdAndUpdate(user.userId, { role: "seller" }, { new: true });

    // Also ensure the existing seller is approved if they were stuck
    if (!existing.isApproved) {
      existing.isApproved = true;
      await existing.save();
    }

    const token = signToken({
      userId: user.userId,
      phone: user.phone,
      role: "seller",
    });

    const response = ok({ seller: existing, user: updatedUser, message: "Welcome back, Seller!" });
    response.cookies.set("jh_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return response;
  }

  const body = await req.json();
  const { shopName, shopDescription, gstin, bankAccount, address } = body;
  if (!shopName || !bankAccount || !address) return err("Required fields missing");

  const seller = await Seller.create({ userId: user.userId, shopName, shopDescription, gstin, bankAccount, address });
  const updatedUser = await User.findByIdAndUpdate(user.userId, { role: "seller" }, { new: true });

  // Sign new token with updated role
  const token = signToken({
    userId: user.userId,
    phone: user.phone,
    role: "seller",
  });

  const response = ok({ seller, user: updatedUser, message: "Seller registered! Approval pending." }, 201);

  response.cookies.set("jh_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return response;
}
