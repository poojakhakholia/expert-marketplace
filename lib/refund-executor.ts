import Razorpay from "razorpay";
import { supabaseServer } from "@/lib/supabase-server";

type RefundInitiator = "system" | "host" | "admin";

interface RefundParams {
  bookingId: string;
  reason: string;
  initiatedBy: RefundInitiator;
}

/**
 * Shared refund executor.
 *
 * - Idempotent
 * - Swallows errors
 * - Marks refund_status = failed on failure
 * - NEVER throws
 */
export async function refundBooking({
  bookingId,
  reason,
  initiatedBy,
}: RefundParams): Promise<void> {
  try {
    /* 1️⃣ Load booking (expanded for refund math) */
    const { data: booking, error: fetchError } =
      await supabaseServer
        .from("bookings")
        .select(
          `
          id,
          order_code,
          user_id,
          expert_id,
          amount,
          payment_id,
          payment_captured_at,
          razorpay_fee,
          razorpay_tax,
          intella_fee,
          refund_status
        `
        )
        .eq("id", bookingId)
        .single();

    if (fetchError || !booking) {
      console.error("❌ Refund: booking not found", bookingId);
      return;
    }

    /* 2️⃣ Idempotency checks */
    if (booking.refund_status === "succeeded") {
      console.log("ℹ️ Refund already succeeded, skipping", bookingId);
      return;
    }

    if (!booking.payment_id || !booking.payment_captured_at) {
      console.warn(
        "⚠️ Refund skipped — payment not captured",
        bookingId
      );
      return;
    }

    /* 3️⃣ Refund amount (USER BEARS PG FEE) */
    const grossAmount = booking.amount;
    const pgFee =
      (booking.razorpay_fee ?? 0) +
      (booking.razorpay_tax ?? 0);

    const refundAmount = grossAmount - pgFee;

    if (refundAmount <= 0) {
      console.warn(
        "⚠️ Refund skipped — non-positive amount",
        bookingId,
        refundAmount
      );
      return;
    }

    /* 4️⃣ Mark refund as pending (best-effort) */
    await supabaseServer
      .from("bookings")
      .update({
        refund_status: "pending",
        refund_reason: reason,
      })
      .eq("id", bookingId);

    /* 5️⃣ Razorpay refund */
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const refund = await razorpay.payments.refund(
      booking.payment_id,
      {
        amount: Math.round(refundAmount * 100), // paise
        notes: {
          booking_id: bookingId,
          reason,
          initiated_by: initiatedBy,
        },
      }
    );

    /* 6️⃣ Persist refund success */
    const occurredAt = new Date().toISOString();

    await supabaseServer
      .from("bookings")
      .update({
        refund_status: "succeeded",
        refund_id: refund.id,
        refunded_at: occurredAt,
      })
      .eq("id", bookingId);

    /* 7️⃣ Compute reversals */
    const intellaFee = booking.intella_fee ?? 0;
    const expertEarning =
      grossAmount - pgFee - intellaFee;

    /* 8️⃣ Insert ledger reversal entries */
    const ledgerRows = [
      {
        booking_id: booking.id,
        order_code: booking.order_code,
        user_id: booking.user_id,
        amount: refundAmount,
        entry_type: "refund_user",
        direction: "credit",
        occurred_at: occurredAt,
      },
      {
        booking_id: booking.id,
        order_code: booking.order_code,
        user_id: booking.user_id,
        amount: pgFee,
        entry_type: "pg_fee_user",
        direction: "debit",
        occurred_at: occurredAt,
      },
      {
        booking_id: booking.id,
        order_code: booking.order_code,
        expert_id: booking.expert_id,
        amount: expertEarning,
        entry_type: "refund_expert",
        direction: "debit",
        occurred_at: occurredAt,
      },
      {
        booking_id: booking.id,
        order_code: booking.order_code,
        amount: intellaFee,
        entry_type: "refund_intella_fee",
        direction: "debit",
        occurred_at: occurredAt,
      },
    ];

    const { error: ledgerErr } = await supabaseServer
      .from("ledger_entries")
      .insert(ledgerRows);

    if (ledgerErr) {
      console.error("⚠️ Ledger refund insert failed", ledgerErr);
    }

    console.log("✅ Refund succeeded + ledger updated", {
      bookingId,
      refundId: refund.id,
    });
  } catch (err) {
    console.error("❌ Refund executor error", {
      bookingId,
      err,
    });

    /* 9️⃣ Best-effort failure mark */
    try {
      await supabaseServer
        .from("bookings")
        .update({
          refund_status: "failed",
        })
        .eq("id", bookingId);
    } catch (updateErr) {
      console.error(
        "❌ Failed to mark refund as failed",
        bookingId,
        updateErr
      );
    }

    return;
  }
}
