import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { ok, err } from "@/lib/api";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

function getUser() {
    const token = cookies().get("jh_token")?.value;
    if (!token) return null;
    return verifyToken(token);
}

// GET saved addresses
export async function GET(req: NextRequest) {
    const userPayload = getUser();
    if (!userPayload) return err("Unauthorized", 401);

    await connectDB();
    const user = await User.findById(userPayload.userId).lean();
    if (!user) return err("User not found", 404);

    return ok(user.address || []);
}

// POST a new address (max 3)
export async function POST(req: NextRequest) {
    const userPayload = getUser();
    if (!userPayload) return err("Unauthorized", 401);

    const newAddress = await req.json();
    if (!newAddress.line1 || !newAddress.city || !newAddress.pincode || !newAddress.name || !newAddress.phone) {
        return err("Incomplete address information");
    }

    await connectDB();
    const user = await User.findById(userPayload.userId);
    if (!user) return err("User not found", 404);

    user.address = user.address || [];
    if (user.address.length >= 3) {
        return err("You can only save up to 3 addresses. Please delete an existing one first.");
    }

    user.address.push(newAddress);
    await user.save();

    return ok({ addresses: user.address, message: "Address added successfully" });
}

// DELETE an address by its array element ID
export async function DELETE(req: NextRequest) {
    const userPayload = getUser();
    if (!userPayload) return err("Unauthorized", 401);

    const addressId = req.nextUrl.searchParams.get("id");
    if (!addressId) return err("Address ID required");

    await connectDB();
    const user = await User.findById(userPayload.userId);
    if (!user) return err("User not found", 404);

    user.address = user.address.filter((addr: any) => addr._id.toString() !== addressId);
    await user.save();

    return ok({ addresses: user.address, message: "Address deleted" });
}
