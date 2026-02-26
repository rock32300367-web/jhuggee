import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { ok, err } from "@/lib/api";
import { Order } from "@/models/Order";
import { Cart } from "@/models/Cart";
import { Product } from "@/models/Product";
import { Cashfree, CFEnvironment } from "cashfree-pg";
import { cookies } from "next/headers";

const cashfree = new Cashfree(
    process.env.CASHFREE_ENV === "PRODUCTION" ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX,
    process.env.CASHFREE_APP_ID || "",
    process.env.CASHFREE_SECRET_KEY || ""
);

function getUser() {
    const token = cookies().get("jh_token")?.value;
    if (!token) return null;
    return verifyToken(token);
}

export async function POST(req: NextRequest) {
    const user = getUser();
    if (!user) return err("Unauthorized", 401);

    const { address, paymentMethod } = await req.json();
    if (!address) return err("Delivery address required");
    if (!paymentMethod || paymentMethod === 'cod') return err("Invalid payment method for gateway");

    await connectDB();

    // 1. Get items from cart
    const cart = await Cart.findOne({ userId: user.userId }).populate("items.productId");
    if (!cart || cart.items.length === 0) return err("Cart is empty");

    const orderItems = cart.items.map((i: any) => ({
        productId: i.productId._id,
        sellerId: i.productId.sellerId,
        name: i.productId.name,
        image: i.productId.images?.[0] || "",
        price: i.productId.price,
        qty: i.qty,
        size: i.size,
        color: i.color,
    }));

    // 2. Calculate actual totals from DB to prevent client tampering
    const totalAmount = orderItems.reduce((sum: number, i: any) => sum + (i.price * i.qty), 0);
    const deliveryCharge = totalAmount >= 199 ? 0 : 49;
    const finalAmount = totalAmount + deliveryCharge;

    const estimatedDelivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);

    // 3. Create a PENDING order in our DB first
    const order = await Order.create({
        userId: user.userId,
        items: orderItems,
        address,
        total: totalAmount,
        deliveryCharge,
        paymentMethod,
        paymentStatus: "pending",
        status: "pending",
        estimatedDelivery,
    });

    const orderIdStr = order._id.toString();

    // 4. Request a Payment Session ID from Cashfree
    try {
        const phoneNo = address.phone || "9999999999";

        let request = {
            order_amount: finalAmount,
            order_currency: "INR",
            order_id: `ORDER_${orderIdStr}`,
            customer_details: {
                customer_id: user.userId,
                customer_phone: phoneNo,
                customer_email: user.email || "customer@jhuggee.com",
                customer_name: address.name || "Customer"
            },
            order_meta: {
                return_url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://www.jhuggee.com"}/checkout/verify?order_id=ORDER_${orderIdStr}`
            }
        };

        const response = await cashfree.PGCreateOrder(request as any);

        // Return the payment_session_id back to the frontend
        if (response.data && response.data.payment_session_id) {
            return ok({
                payment_session_id: response.data.payment_session_id,
                order_id: response.data.order_id,
                dbOrderId: orderIdStr
            });
        }

        return err("Failed to initialize payment gateway session", 500);

    } catch (error: any) {
        console.error("Cashfree API Error:", error?.response?.data || error.message);
        // Clean up the pending order since it failed to get a session
        await Order.findByIdAndDelete(order._id);
        return err("Payment Gateway Error", 500);
    }
}
