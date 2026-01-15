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
      name: `booking-${Date.now()}`,
      properties: {
        enable_chat: false,
        enable_screenshare: false,
        enable_recording: "never",
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
      },
    }),
  });

  const data = await response.json();

  // 🔴 TEMP DEBUG OUTPUT
  console.log("DAILY API STATUS:", response.status);
  console.log("DAILY API RESPONSE:", data);

  if (!response.ok) {
    return NextResponse.json(
      { error: "Daily API error", details: data },
      { status: 500 }
    );
  }

  return NextResponse.json({
    room_url: data.url,
  });
}
