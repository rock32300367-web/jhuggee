import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { generateOTP, sendOTP } from "@/lib/otp";
import { ok, err } from "@/lib/api";
import { OTP } from "@/models/OTP";
import { User } from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const { phone, type } = await req.json();

    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      return err("Please enter a valid 10-digit Indian mobile number");
    }

    await connectDB();

    // Prevent OTP dispatch if this is a signup attempt and the account already exists
    if (type === "signup") {
      const user = await User.findOne({ phone });
      if (user) {
        return err("An account with this phone number already exists", 400);
      }
    }

    // Rate limit: max 3 OTPs per phone per 10 minutes
    const recentCount = await OTP.countDocuments({
      phone,
      expiresAt: { $gt: new Date() },
    });

    if (recentCount >= 3) {
      return err("Too many OTP requests. Please wait 10 minutes.", 429);
    }

    // Delete old OTPs for this phone
    await OTP.deleteMany({ phone });

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + Number(process.env.OTP_EXPIRY_MINUTES || 10) * 60 * 1000);

    await OTP.create({ phone, otp, expiresAt });

    const sent = await sendOTP(phone, otp);
    if (!sent) return err("Failed to send OTP. Try again.");

    return ok({ message: `OTP sent to +91 ${phone}` });
  } catch (e) {
    console.error(e);
    return err("Server error", 500);
  }
}
