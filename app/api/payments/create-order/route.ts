import Razorpay from "razorpay";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // --- DEBUG: prove this file is being hit ---
    console.log("🔥 CREATE-ORDER ROUTE HIT 🔥");

    const body = await req.json();
    console.log("📦 CREATE ORDER BODY RECEIVED:", body);

    const { amount, booking_id } = body;

    // --- Hard validation ---
    if (amount === undefined || booking_id === undefined) {
      console.error("❌ Missing fields", { amount, booking_id });
      return NextResponse.json(
        { error: "amount or booking_id missing" },
        { status: 400 }
      );
    }

    if (Number(amount) <= 0) {
      console.error("❌ Invalid amount", amount);
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    // --- Razorpay init ---
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error("❌ Razorpay env vars missing");
      return NextResponse.json(
        { error: "Razorpay not configured" },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // --- Create order ---
    const order = await razorpay.orders.create({
      amount: Math.round(Number(amount) * 100), // paise
      currency: "INR",
      receipt: `bk_${Date.now()}`,
      notes: {
        booking_id,
      },
    });

    console.log("✅ Razorpay order created:", {
      order_id: order.id,
      booking_id,
    });

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err: any) {
    console.error("❌ Razorpay order creation failed:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to create Razorpay order" },
      { status: 500 }
    );
  }
}
