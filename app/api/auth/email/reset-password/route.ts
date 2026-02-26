import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { ok, err } from "@/lib/api";
import { OTP } from "@/models/OTP";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
    try {
        const { email, otp, newPassword } = await req.json();

        if (!email || !otp || !newPassword) {
            return err("Email, OTP, and new password are required");
        }

        if (newPassword.length < 6) {
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

        // Check if user exists
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return err("No account found with this email", 404);
        }

        if (user.authProvider !== "email") {
            return err(`This account was created via ${user.authProvider}. Please login using ${user.authProvider}.`, 400);
        }

        // Mark OTP as used
        record.verified = true;
        await record.save();

        // Hash the new password and update user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await user.save();

        return ok({ message: "Password updated successfully" });
    } catch (e) {
        console.error(e);
        return err("Server error", 500);
    }
}
