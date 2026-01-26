import { google } from "googleapis";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // 🔴 REQUIRED (server-only)
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        { error: "No code in callback" },
        { status: 400 }
      );
    }

    /* ---------------- Google OAuth ---------------- */
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID!,
      process.env.GOOGLE_CLIENT_SECRET!,
      process.env.GOOGLE_REDIRECT_URI!
    );

    const { tokens } = await oauth2Client.getToken(code);

    console.log("✅ GOOGLE TOKENS RECEIVED:");
    console.log(tokens);

    if (!tokens.access_token || !tokens.refresh_token) {
      throw new Error("Missing access_token or refresh_token from Google");
    }

    /* ---------------- Persist Tokens ---------------- */
    const email = "meet@intella.in"; // 🔒 System account

    const { error } = await supabase
      .from("google_oauth_tokens")
      .upsert(
        {
          email,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expiry_date: tokens.expiry_date ?? null,
          scope: tokens.scope ?? null,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "email",
        }
      );

    if (error) {
      console.error("❌ Failed to save Google tokens:", error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: "Google OAuth successful and tokens saved",
    });
  } catch (err: any) {
    console.error("❌ GOOGLE CALLBACK ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Google OAuth failed" },
      { status: 500 }
    );
  }
}
