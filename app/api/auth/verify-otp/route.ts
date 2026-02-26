import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { signToken } from "@/lib/jwt";
import { ok, err } from "@/lib/api";
import { OTP } from "@/models/OTP";
import { User } from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const { phone, otp, name } = await req.json();

    if (!phone || !otp) return err("Phone and OTP are required");

    await connectDB();

    // Find valid OTP
    const record = await OTP.findOne({
      phone,
      otp,
      expiresAt: { $gt: new Date() },
      verified: false,
    });

    if (!record) return err("Invalid or expired OTP");

    // Mark OTP as used
    record.verified = true;
    await record.save();

    // Find or create user
    let user = await User.findOne({ phone });
    const isNew = !user;

    if (!user) {
      user = await User.create({
        phone,
        name: name || undefined,
        role: "buyer",
        isVerified: true,
      });
    } else {
      user.isVerified = true;
      if (name && !user.name) user.name = name;
      await user.save();
    }

    // Sign JWT
    const token = signToken({
      userId: user._id.toString(),
      phone: user.phone,
      role: user.role,
    });

    // Set cookie
    const response = NextResponse.json({
      success: true,
      data: {
        isNew,
        user: {
          id: user._id,
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
    });

    return response;
  } catch (e) {
    console.error(e);
    return err("Server error", 500);
  }
}
