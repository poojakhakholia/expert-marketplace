import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      expert_id,
      booking_date,
      start_time,
      duration_minutes,
      amount,
    } = body;

    if (
      !expert_id ||
      !booking_date ||
      !start_time ||
      !duration_minutes ||
      !amount
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("bookings")
      .insert({
        expert_id,
        booking_date,           // already local YYYY-MM-DD
        start_time,             // already HH:mm / HH:mm:ss
        duration_minutes,
        amount,
        status: "pending_confirmation", // ✅ enforced
      })
      .select("id")
      .single();

    if (error) {
      console.error("Booking insert error:", error);
      return NextResponse.json(
        { error: "Failed to create booking" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      booking_id: data.id,
    });
  } catch (err) {
    console.error("Create booking exception:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
