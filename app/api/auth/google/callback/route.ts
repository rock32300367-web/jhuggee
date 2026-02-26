import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { signToken } from "@/lib/jwt";
import { User } from "@/models/User";

export async function GET(req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) return Response.redirect(`${baseUrl}/login?error=google_cancelled`);

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${baseUrl}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) throw new Error("Token exchange failed");

    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const gUser = await userRes.json();
    if (!gUser.email) throw new Error("Email not found");

    await connectDB();
    let user = await User.findOne({ $or: [{ googleId: gUser.id }, { email: gUser.email }] });

    if (!user) {
      user = await User.create({
        googleId: gUser.id, email: gUser.email, name: gUser.name,
        avatar: gUser.picture, authProvider: "google", isVerified: true, role: "buyer",
      });
    } else if (!user.googleId) {
      user.googleId = gUser.id;
      if (!user.avatar) user.avatar = gUser.picture;
      await user.save();
    }

    const token = signToken({ userId: user._id.toString(), role: user.role });
    const userData = encodeURIComponent(JSON.stringify({
      id: user._id.toString(), name: user.name, email: user.email,
      phone: user.phone, role: user.role, avatar: user.avatar,
    }));

    const domainAttr = process.env.NODE_ENV === "production" ? "; Domain=.jhuggee.com" : "";

    return new Response(null, {
      status: 302,
      headers: {
        "Set-Cookie": `jh_token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax${domainAttr}`,
        "Location": `${baseUrl}/auth/google-success?user=${userData}`,
      },
    });
  } catch (e) {
    console.error("Google OAuth error:", e);
    return Response.redirect(`${baseUrl}/login?error=google_failed`);
  }
}
