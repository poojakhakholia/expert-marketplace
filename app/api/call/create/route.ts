import { NextResponse } from "next/server";

export async function POST() {
  const DAILY_API_KEY = process.env.DAILY_API_KEY;

  if (!DAILY_API_KEY) {
    return NextResponse.json(
      { error: "Daily API key not configured" },
      { status: 500 }
    );
  }

  const response = await fetch("https://api.daily.co/v1/rooms", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${DAILY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: {
        enable_chat: false,
        enable_screenshare: false,
        enable_recording: "never",
        exp: Math.floor(Date.now() / 1000) + 60 * 60, // expires in 1 hour
      },
    }),
  });

  const data = await response.json();

  return NextResponse.json({
    room_url: data.url,
  });
}
