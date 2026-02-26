import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { generateOTP } from "@/lib/otp";
import { sendEmailOTP } from "@/lib/email";
import { ok, err } from "@/lib/api";
import { OTP } from "@/models/OTP";
import { User } from "@/models/User";

export async function POST(req: NextRequest) {
    try {
        const { email, type } = await req.json();

        if (!email || !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
            return err("Please enter a valid email address");
        }

        await connectDB();

        // Prevent OTP dispatch if this is a signup attempt and the account already exists
        if (type === "signup") {
            const user = await User.findOne({ email: email.toLowerCase() });
            if (user) {
                return err("An account with this email already exists", 400);
            }
        }

        // Rate limit: max 3 OTPs per email per 10 minutes
        const recentCount = await OTP.countDocuments({
            email,
            expiresAt: { $gt: new Date() },
        });

        if (recentCount >= 3) {
            return err("Too many OTP requests. Please wait 10 minutes.", 429);
        }

        // Delete old OTPs for this email
        await OTP.deleteMany({ email });

        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + Number(process.env.OTP_EXPIRY_MINUTES || 10) * 60 * 1000);

        await OTP.create({ email: email.toLowerCase(), otp, expiresAt });

        const sent = await sendEmailOTP(email, otp);
        if (!sent) return err("Failed to send Email OTP. Try again.");

        return ok({ message: `OTP sent to ${email}` });
    } catch (e: any) {
        console.error("SEND_OTP_ERROR:", e);
        return err("Server error", 500);
    }
}
