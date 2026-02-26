import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { signToken } from "@/lib/jwt";
import { ok, err } from "@/lib/api";
import { OTP } from "@/models/OTP";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
    try {
        const { email, password, otp, name } = await req.json();

        if (!email || !password || !otp) {
            return err("Email, Password, and OTP are required");
        }

        if (password.length < 6) {
            return err("Password must be at least 6 characters long");
        }

        await connectDB();

        const normalizedEmail = email.toLowerCase();

        // Verify OTP first
        const record = await OTP.findOne({
            email: normalizedEmail,
            otp,
            expiresAt: { $gt: new Date() },
            verified: false,
        });

        if (!record) return err("Invalid or expired OTP");

        // Mark OTP as used
        record.verified = true;
        await record.save();

        // Check if user already exists
        let user = await User.findOne({ email: normalizedEmail });

        if (user) {
            return err("An account with this email already exists", 400);
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        user = await User.create({
            email: normalizedEmail,
            password: hashedPassword,
            name: name || undefined,
            authProvider: "email",
            role: "buyer",
            isVerified: true,
        });

        // Sign JWT
        const token = signToken({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        });

        // Set cookie
        const response = NextResponse.json({
            success: true,
            data: {
                isNew: true,
                user: {
                    id: user._id,
                    email: user.email,
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
        });

        return response;
    } catch (e) {
        console.error(e);
        return err("Server error", 500);
    }
}
