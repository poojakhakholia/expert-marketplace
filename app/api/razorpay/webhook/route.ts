import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { sendSessionRequestEmail } from "@/lib/email/sendSessionRequest";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    const event = payload.event;
    const payment = payload.payload?.payment?.entity;

    if (!payment) {
      return NextResponse.json({ ignored: true });
    }

    /* 1️⃣ Booking linkage */
    const bookingId = payment.notes?.booking_id;
    if (!bookingId) {
      console.error("❌ booking_id missing in Razorpay notes");
      return NextResponse.json(
        { error: "missing_booking_id" },
        { status: 400 }
      );
    }

    const occurredAt = new Date().toISOString();

    /* 2️⃣ Handle PAYMENT FAILED / ABANDONED */
    if (event === "payment.failed") {
      const isAbandoned =
        payment.error_reason === "payment_cancelled";

      const { error } = await supabaseServer
        .from("bookings")
        .update({
          payment_status: isAbandoned ? "abandoned" : "failed",
          status: "cancelled",
          cancelled_by: "system",
        })
        .eq("id", bookingId);

      if (error) {
        console.error(
          "❌ Failed to mark booking as payment_failed/abandoned:",
          error
        );
        return NextResponse.json(
          { error: "payment_failed_update_error" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    /* 3️⃣ Ignore non-captured events */
    if (event !== "payment.captured") {
      return NextResponse.json({ ignored: true });
    }

    /* 4️⃣ Amounts (Razorpay = paise) */
    const grossAmount = payment.amount / 100;
    const razorpayFee = payment.fee ? payment.fee / 100 : 0;
    const razorpayTax = payment.tax ? payment.tax / 100 : 0;
    const pgFee = razorpayFee + razorpayTax;

    /* 5️⃣ Fetch booking */
    const { data: booking, error: bookingErr } =
      await supabaseServer
        .from("bookings")
        .select("id, user_id, expert_id, order_code")
        .eq("id", bookingId)
        .single();

    if (bookingErr || !booking) {
      console.error("❌ Booking not found:", bookingErr);
      return NextResponse.json(
        { error: "booking_not_found" },
        { status: 400 }
      );
    }

    if (!booking.order_code) {
      console.error("❌ order_code missing for booking:", bookingId);
      return NextResponse.json(
        { error: "order_code_missing" },
        { status: 500 }
      );
    }

    const orderCode = booking.order_code;

    /* 6️⃣ Fetch Intella fee config (dynamic) */
    const { data: feeConfig, error: feeErr } =
      await supabaseServer
        .from("platform_fee_config")
        .select("fee_percent, min_fee")
        .eq("is_active", true)
        .single();

    if (feeErr || !feeConfig) {
      console.error("❌ Active fee config missing");
      return NextResponse.json(
        { error: "fee_config_missing" },
        { status: 500 }
      );
    }

    const percentFee =
      (grossAmount * feeConfig.fee_percent) / 100;
    const intellaFee =
      grossAmount > 0
        ? Math.max(percentFee, feeConfig.min_fee)
        : 0;

    const expertEarning =
      grossAmount - pgFee - intellaFee;

    /* 7️⃣ Fetch emails (audit) */
    const [{ data: user }, { data: expert }] = await Promise.all([
      supabaseServer
        .from("users")
        .select("email")
        .eq("id", booking.user_id)
        .single(),
      supabaseServer
        .from("users")
        .select("email")
        .eq("id", booking.expert_id)
        .single(),
    ]);

    const userEmail = user?.email ?? null;
    const expertEmail = expert?.email ?? null;

    /* 8️⃣ Update booking (success snapshot + visibility) */
    const { error: updateErr } = await supabaseServer
      .from("bookings")
      .update({
        payment_status: "confirmed",
        status: "pending_confirmation",
        razorpay_fee: razorpayFee,
        razorpay_tax: razorpayTax,
        razorpay_net_amount: grossAmount - pgFee,
        intella_fee: intellaFee,
        intella_fee_percent: feeConfig.fee_percent,
        intella_fee_min: feeConfig.min_fee,
        payment_captured_at: occurredAt,
      })
      .eq("id", bookingId);

    if (updateErr) {
      console.error("❌ Failed to update booking:", updateErr);
      return NextResponse.json(
        { error: "booking_update_failed" },
        { status: 500 }
      );
    }
    /* 🔔 Trigger expert notification email */
    await sendSessionRequestEmail(bookingId);

    /* 9️⃣ Ledger rows */
    const ledgerRows = [
      {
        booking_id: booking.id,
        order_code: orderCode,
        user_id: booking.user_id,
        expert_id: booking.expert_id,
        user_email: userEmail,
        expert_email: expertEmail,
        amount: grossAmount,
        entry_type: "booking_payment",
        direction: "debit",
        occurred_at: occurredAt,
      },
      {
        booking_id: booking.id,
        order_code: orderCode,
        user_id: booking.user_id,
        expert_id: booking.expert_id,
        user_email: userEmail,
        expert_email: expertEmail,
        amount: pgFee,
        entry_type: "pg_fee",
        direction: "credit",
        occurred_at: occurredAt,
      },
      {
        booking_id: booking.id,
        order_code: orderCode,
        user_id: booking.user_id,
        expert_id: booking.expert_id,
        user_email: userEmail,
        expert_email: expertEmail,
        amount: intellaFee,
        entry_type: "intella_fee",
        direction: "credit",
        occurred_at: occurredAt,
      },
      {
        booking_id: booking.id,
        order_code: orderCode,
        user_id: booking.user_id,
        expert_id: booking.expert_id,
        user_email: userEmail,
        expert_email: expertEmail,
        amount: expertEarning,
        entry_type: "expert_earning",
        direction: "credit",
        occurred_at: occurredAt,
      },
    ];

    /* 🔟 Insert ledger (idempotent) */
    const { error: ledgerErr } = await supabaseServer
      .from("ledger_entries")
      .insert(ledgerRows);

    if (ledgerErr) {
      if ((ledgerErr as any).code === "23505") {
        console.log("🔁 Ledger exists, skipping");
      } else {
        console.error("❌ LEDGER INSERT FAILED:", ledgerErr);
        return NextResponse.json(
          { error: "ledger_insert_failed" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ WEBHOOK ERROR:", err);
    return NextResponse.json(
      { error: "webhook_error" },
      { status: 500 }
    );
  }
}
