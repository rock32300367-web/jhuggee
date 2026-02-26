// OTP Generator & Sender
// In development: OTP is printed to console
// In production: Set USE_REAL_SMS=true and configure Twilio or MSG91

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOTP(phone: string, otp: string): Promise<boolean> {
  const useRealSMS = process.env.USE_REAL_SMS === "true";

  if (!useRealSMS) {
    // ── DEVELOPMENT MODE ──
    console.log(`\n🔐 OTP for ${phone}: ${otp}\n`);
    return true;
  }

  // ── PRODUCTION: Choose one provider ──

  // Option 1: Twilio
  // const twilio = require("twilio");
  // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  // await client.messages.create({
  //   body: `Your Jhuggee OTP is: ${otp}. Valid for 10 minutes. Do not share.`,
  //   from: process.env.TWILIO_PHONE_NUMBER,
  //   to: `+91${phone}`,
  // });

  // Option 2: MSG91 (recommended for India - cheaper)
  // const response = await fetch(`https://api.msg91.com/api/v5/otp?template_id=${process.env.MSG91_TEMPLATE_ID}&mobile=91${phone}&authkey=${process.env.MSG91_API_KEY}&otp=${otp}`, {
  //   method: "GET",
  // });
  // return response.ok;

  return true;
}
