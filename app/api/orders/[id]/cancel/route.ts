import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { ok, err } from "@/lib/api";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { cookies } from "next/headers";

function getUser() {
    const token = cookies().get("jh_token")?.value;
    if (!token) return null;
    return verifyToken(token);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const user = getUser();
    if (!user) return err("Unauthorized", 401);

    await connectDB();

    try {
        const order = await Order.findOne({ _id: params.id, userId: user.userId });

        if (!order) {
            return err("Order not found or doesn't belong to you", 404);
        }

        if (["shipped", "delivered", "cancelled", "returned"].includes(order.status)) {
            return err(`Order cannot be cancelled because it is already ${order.status}`, 400);
        }

        order.status = "cancelled";

        // If the order was already paid, we would typically initiate a refund to the gateway here.
        // For now, we will mark payment status as refund pending.
        if (order.paymentStatus === "paid") {
            order.paymentStatus = "refund_pending";
        }

        await order.save();

        // Release stock back to products
        for (const item of order.items) {
            if (item.productId) {
                await Product.findByIdAndUpdate(item.productId, {
                    $inc: { stock: item.qty, sold: -item.qty },
                });
            }
        }

        return ok({ message: "Order cancelled successfully", order });

    } catch (error) {
        console.error("Order Cancel Error:", error);
        return err("Failed to cancel order", 500);
    }
}
