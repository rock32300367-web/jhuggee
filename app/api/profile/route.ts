import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { ok, err } from "@/lib/api";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function PUT(req: NextRequest) {
    try {
        const cookieStore = cookies();
        const token = cookieStore.get("jh_token")?.value;
        if (!token) return err("Unauthorized", 401);

        const payload = verifyToken(token);
        if (!payload || !payload.userId) return err("Invalid token", 401);

        const { name, phone, email } = await req.json();

        await connectDB();
        const user = await User.findById(payload.userId);
        if (!user) return err("User not found", 404);

        if (name !== undefined) user.name = name;
        if (phone !== undefined && phone !== "") {
            // Simple regex check
            if (!/^[6-9]\d{9}$/.test(phone)) {
                return err("Please enter a valid 10-digit Indian mobile number");
            }
            user.phone = phone;
        }
        if (email !== undefined && email !== "") {
            if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
                return err("Please enter a valid email address");
            }
            user.email = email;
        }

        await user.save();

        return ok({
            message: "Profile updated successfully",
            user: {
                id: user._id,
                name: user.name,
                phone: user.phone,
                email: user.email,
                role: user.role,
                authProvider: user.authProvider,
                address: user.address,
            }
        });

    } catch (error: any) {
        console.error("Profile update error:", error);
        return err("Failed to update profile", 500);
    }
}
