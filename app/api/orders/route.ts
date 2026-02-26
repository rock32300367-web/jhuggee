import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { ok, err } from "@/lib/api";
import { Order } from "@/models/Order";
import { Cart } from "@/models/Cart";
import { Product } from "@/models/Product";

function getUser(req: NextRequest) {
  const token = req.cookies.get("jh_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

// GET orders
export async function GET(req: NextRequest) {
  const user = getUser(req);
  if (!user) return err("Unauthorized", 401);

  await connectDB();
  const orders = await Order.find({ userId: user.userId })
    .sort({ createdAt: -1 })
    .lean();
  return ok(orders);
}

// POST - place order
export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return err("Unauthorized", 401);

  const { address, paymentMethod = "cod", items: directItems } = await req.json();
  if (!address) return err("Delivery address required");

  await connectDB();

  // Get items from cart or direct
  let orderItems = directItems;
  if (!orderItems) {
    const cart = await Cart.findOne({ userId: user.userId }).populate("items.productId");
    if (!cart || cart.items.length === 0) return err("Cart is empty");
    orderItems = cart.items.map((i: any) => ({
      productId: i.productId._id,
      sellerId: i.productId.sellerId,
      name: i.productId.name,
      image: i.productId.images[0],
      price: i.productId.price,
      qty: i.qty,
      size: i.size,
      color: i.color,
    }));
  }

  const total = orderItems.reduce((s: number, i: any) => s + i.price * i.qty, 0);
  const deliveryCharge = total >= 199 ? 0 : 49;
  const estimatedDelivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);

  const order = await Order.create({
    userId: user.userId,
    items: orderItems,
    address,
    total,
    deliveryCharge,
    paymentMethod,
    estimatedDelivery,
  });

  // Update stock
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { stock: -item.qty, sold: item.qty },
    });
  }

  // Clear cart
  await Cart.findOneAndUpdate({ userId: user.userId }, { items: [] });

  return ok({ order, message: "Order placed successfully!" }, 201);
}
