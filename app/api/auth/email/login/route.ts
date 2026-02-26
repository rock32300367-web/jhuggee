import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { signToken } from "@/lib/jwt";
import { ok, err } from "@/lib/api";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return err("Email and password are required");
        }

        await connectDB();

        const normalizedEmail = email.toLowerCase();

        // Find user and explicitly select password field since it is select: false
        const user = await User.findOne({ email: normalizedEmail }).select("+password");

        if (!user) {
            return err("Invalid email or password", 401);
        }

        if (user.authProvider !== "email" || !user.password) {
            return err(`Please login using ${user.authProvider} to access your account`, 401);
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return err("Invalid email or password", 401);
        }

        // Sign JWT
        const token = signToken({
            userId: user._id.toString(),
            email: user.email,
            phone: user.phone,
            role: user.role,
        });

        // Set cookie
        const response = NextResponse.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    phone: user.phone,
                    name: user.name,
                    role: user.role,
                    authProvider: user.authProvider,
                    address: user.address,
                },
            },
        });

        response.cookies.set("jh_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
            domain: process.env.NODE_ENV === "production" ? ".jhuggee.com" : undefined,
        });

        return response;
    } catch (e) {
        console.error(e);
        return err("Server error", 500);
    }
}
