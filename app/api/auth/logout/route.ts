import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ success: true, data: { message: "Logged out" } });
  res.cookies.set("jh_token", "", { maxAge: 0, path: "/" });
  return res;
}
