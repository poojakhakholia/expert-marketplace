import { google } from "googleapis";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID!,
      process.env.GOOGLE_CLIENT_SECRET!,
      process.env.GOOGLE_REDIRECT_URI!
    );

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",        // 🔑 REQUIRED for refresh_token
      prompt: "consent",              // 🔑 FORCE refresh_token
      scope: [
        "https://www.googleapis.com/auth/calendar",
      ],
    });

    return NextResponse.redirect(authUrl);
  } catch (err: any) {
    console.error("❌ GOOGLE AUTH ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Google auth failed" },
      { status: 500 }
    );
  }
}
