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

    const { order_id } = await req.json();
    if (!order_id) return err("Missing order_id from payment gateway");

    // Fetch the actual payment status from Cashfree servers using their Order ID
    try {
        const response = await cashfree.PGOrderFetchPayments(order_id);
        const payments = response.data;

        let paymentSuccess = false;

        // Cashfree returns an array of payment attempts for this order. We need at least one SUCCESS.
        if (payments && payments.length > 0) {
            paymentSuccess = payments.some((payment: any) => payment.payment_status === "SUCCESS");
        }

        if (!paymentSuccess) {
            return err("Payment has not been completed successfully.", 400);
        }

    } catch (error: any) {
        console.error("Cashfree Verification Error:", error?.response?.data || error.message);
        return err("Payment Verification Failed", 500);
    }

    // 2. Proceed to mark our local Database Order as PAID.
    // The Gateway's order_id is 'ORDER_[MongoID]'
    const mongoOrderId = order_id.split('_')[1];

    await connectDB();
    const dbOrder = await Order.findById(mongoOrderId);

    if (!dbOrder) {
        return err("Local Order Record Not Found", 404);
    }

    if (dbOrder.paymentStatus === "paid") {
        // Already processed this
        return ok({ message: "Order is already verified and paid", orderId: dbOrder._id });
    }

    dbOrder.paymentStatus = "paid";
    dbOrder.status = "confirmed";
    await dbOrder.save();

    // 3. Clear Cart
    await Cart.findOneAndUpdate({ userId: user.userId }, { items: [] });

    // 4. Update Product Stock and Sold Count
    for (const item of dbOrder.items) {
        if (item.productId) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { stock: -item.qty, sold: item.qty },
            });
        }
    }

    return ok({ message: "Payment Verified and Order Placed!", orderId: dbOrder._id }, 200);
}
