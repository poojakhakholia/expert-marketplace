import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

/* 🔹 server-side supabase (service role, ONLY here) */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("VERIFY BODY:", body);

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      booking_id,
    } = body;

    /* 1️⃣ HARD VALIDATION */
    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !booking_id
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: "Server misconfigured" },
        { status: 500 }
      );
    }

    /* 2️⃣ SIGNATURE VERIFICATION */
    const signPayload = `${razorpay_order_id}|${razorpay_payment_id}`;

    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(signPayload)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    /* 3️⃣ FETCH BOOKING */
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("id, user_id")
      .eq("id", booking_id)
      .single();

    if (bookingError || !booking) {
      console.error("BOOKING NOT FOUND:", bookingError);
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 400 }
      );
    }

    /* 4️⃣ FETCH BUYER NAME */
    const { data: userRow } = await supabase
      .from("users")
      .select("full_name")
      .eq("id", booking.user_id)
      .single();

    const buyerName = userRow?.full_name ?? "Customer";

    /* 5️⃣ UPDATE BOOKING (CLEAN STATE) */
    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        payment_status: "confirmed",
        payment_id: razorpay_payment_id,
        buyer_name: buyerName,
        cancelled_by: null, // ✅ Clear inconsistent state
      })
      .eq("id", booking_id);

    if (updateError) {
      console.error("SUPABASE UPDATE FAILED:", updateError);
      // ⚠️ Payment is valid, do not fail verification
    }

    console.log("✅ PAYMENT VERIFIED:", booking_id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("VERIFY API ERROR:", err);
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 }
    );
  }
}
