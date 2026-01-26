import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

/* 🔹 server-side supabase (service role, ONLY here) */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/* 🔹 helper: generate order code ONLY after payment */
function generateOrderCode() {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `A-${num}`;
}

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

    /* 2️⃣ SIGNATURE VERIFICATION (UNCHANGED) */
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

    /* 3️⃣ PAYMENT VERIFIED — UPDATE DB (DO NOT GATE ON RETURNED ROWS) */
    const order_code = generateOrderCode();

    const { error } = await supabase
      .from("bookings")
      .update({
        payment_status: "confirmed",
        payment_id: razorpay_payment_id,
        order_code,
      })
      .eq("id", booking_id);

    if (error) {
      console.error("SUPABASE UPDATE FAILED:", error);
      // ⚠️ Important: payment is still valid, do not fail
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
