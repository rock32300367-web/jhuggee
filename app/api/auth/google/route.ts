import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const baseUrl  = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  if (!clientId || clientId === "YOUR_GOOGLE_CLIENT_ID_HERE") {
    return new Response(`<html><body style="font-family:sans-serif;padding:40px;text-align:center">
      <h2>⚠️ Google OAuth Setup Baaki Hai</h2>
      <p>Steps:</p>
      <ol style="text-align:left;max-width:500px;margin:0 auto">
        <li>Jao <a href="https://console.cloud.google.com">console.cloud.google.com</a></li>
        <li>New Project banao → "Jhuggee"</li>
        <li>APIs & Services → Credentials → OAuth 2.0 Client ID</li>
        <li>Authorized redirect URI mein add karo: <code>${baseUrl}/api/auth/google/callback</code></li>
        <li>Client ID aur Secret copy karo .env.local mein</li>
      </ol>
      <br><a href="/">← Wapas Jao</a>
    </body></html>`, { headers: { "Content-Type": "text/html" } });
  }

  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  `${baseUrl}/api/auth/google/callback`,
    response_type: "code",
    scope:         "openid email profile",
    access_type:   "offline",
    prompt:        "select_account",
  });
  return Response.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
}
