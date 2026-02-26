import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { ok, err } from "@/lib/api";
import { Cart } from "@/models/Cart";
import { Product } from "@/models/Product";

function getUser(req: NextRequest) {
  const token = req.cookies.get("jh_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

// GET cart
export async function GET(req: NextRequest) {
  const user = getUser(req);
  if (!user) return err("Unauthorized", 401);

  await connectDB();
  const cart = await Cart.findOne({ userId: user.userId })
    .populate({
      path: "items.productId",
      select: "name images price mrp stock freeDelivery sellerId",
      populate: { path: "sellerId", select: "shopName" },
    })
    .lean();

  return ok(cart || { items: [] });
}

// POST - add to cart
export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return err("Unauthorized", 401);

  const { productId, qty = 1, size, color } = await req.json();
  if (!productId) return err("productId required");

  await connectDB();

  const product = await Product.findById(productId);
  if (!product || !product.isActive) return err("Product not available");
  if (product.stock < qty) return err("Insufficient stock");

  let cart = await Cart.findOne({ userId: user.userId });
  if (!cart) {
    cart = await Cart.create({ userId: user.userId, items: [] });
  }

  const existingIdx = cart.items.findIndex(
    (i: any) => i.productId.toString() === productId && i.size === size && i.color === color
  );

  if (existingIdx >= 0) {
    cart.items[existingIdx].qty += qty;
  } else {
    cart.items.push({ productId, qty, size, color });
  }

  await cart.save();
  return ok({ message: "Added to cart", count: cart.items.length });
}

// DELETE - remove item from cart
export async function DELETE(req: NextRequest) {
  const user = getUser(req);
  if (!user) return err("Unauthorized", 401);

  const { productId, size, color } = await req.json();
  await connectDB();

  const cart = await Cart.findOne({ userId: user.userId });
  if (!cart) return err("Cart not found", 404);

  cart.items = cart.items.filter(
    (i: any) => !(i.productId.toString() === productId && i.size === size && i.color === color)
  );

  await cart.save();
  return ok({ message: "Item removed", count: cart.items.length });
}

// PATCH - update qty
export async function PATCH(req: NextRequest) {
  const user = getUser(req);
  if (!user) return err("Unauthorized", 401);

  const { productId, qty, size, color } = await req.json();
  await connectDB();

  const cart = await Cart.findOne({ userId: user.userId });
  if (!cart) return err("Cart not found", 404);

  const item = cart.items.find(
    (i: any) => i.productId.toString() === productId && i.size === size && i.color === color
  );

  if (!item) return err("Item not in cart");
  if (qty <= 0) {
    cart.items = cart.items.filter(
      (i: any) => !(i.productId.toString() === productId)
    );
  } else {
    item.qty = qty;
  }

  await cart.save();
  return ok({ message: "Cart updated" });
}
