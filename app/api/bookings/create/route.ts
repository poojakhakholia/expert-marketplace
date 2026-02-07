import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/* ---------- helper: generate order code ---------- */
function generateOrderCode() {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `A-${num}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      user_id,
      expert_id,
      booking_date,
      start_time,
      duration_minutes,
      amount,
    } = body;

    if (
      !user_id ||
      !expert_id ||
      !booking_date ||
      !start_time ||
      !duration_minutes ||
      amount === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1️⃣ generate order code
    let order_code = generateOrderCode();

    // 2️⃣ insert booking (PRE-PAYMENT, HIDDEN FROM EXPERT)
    const { data, error } = await supabase
      .from("bookings")
      .insert({
        user_id,
        expert_id,
        booking_date,
        start_time,
        duration_minutes,
        amount,
        order_code,
        payment_status: "pending",
        status: "pending_confirmation",
      })
      .select("id, order_code")
      .single();

    // 3️⃣ handle rare order_code collision
    if (error && error.code === "23505") {
      order_code = generateOrderCode();

      const retry = await supabase
        .from("bookings")
        .insert({
          user_id,
          expert_id,
          booking_date,
          start_time,
          duration_minutes,
          amount,
          order_code,
          payment_status: "pending",
          status: "pending_confirmation",
        })
        .select("id, order_code")
        .single();

      if (retry.error) {
        console.error("Booking retry insert error:", retry.error);
        return NextResponse.json(
          { error: "Failed to create booking" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        booking_id: retry.data.id,
        order_code: retry.data.order_code,
      });
    }

    if (error) {
      console.error("Booking insert error:", error);
      return NextResponse.json(
        { error: "Failed to create booking" },
        { status: 500 }
      );
    }

    // 4️⃣ success
    return NextResponse.json({
      booking_id: data.id,
      order_code: data.order_code,
    });
  } catch (err) {
    console.error("Create booking exception:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
