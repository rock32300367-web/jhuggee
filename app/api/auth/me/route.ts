import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { connectDB } from "@/lib/db";
import { ok, err } from "@/lib/api";
import { User } from "@/models/User";

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get("jh_token")?.value;

        if (!token) {
            return err("Not authenticated", 401);
        }

        const decoded = verifyToken(token) as any;
        if (!decoded || !decoded.userId) {
            return err("Invalid token", 401);
        }

        await connectDB();

        // Find user by ID to get the freshest data
        const user = await User.findById(decoded.userId);

        if (!user) {
            return err("User not found", 404);
        }

        // Return user data (matching the structure sent on login)
        return ok({
            user: {
                id: user._id,
                email: user.email,
                phone: user.phone,
                name: user.name,
                role: user.role,
                authProvider: user.authProvider,
                address: user.address,
            }
        });
    } catch (e: any) {
        console.error("Auth Me Error:", e);
        return err("Server error", 500);
    }
}
