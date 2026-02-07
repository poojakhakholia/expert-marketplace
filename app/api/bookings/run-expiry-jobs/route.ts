  import { NextResponse } from "next/server";
  import { supabaseServer } from "@/lib/supabase-server";
  import { refundBooking } from "@/lib/refund-executor";

  /**
   * Backend-owned job runner:
   * 1. Enforces booking expiry
   * 2. Triggers refunds for system-expired bookings
   *
   * Safe to run multiple times (idempotent)
   */
  export async function POST() {
    try {
      /* --------------------------------------------------
      * 1️⃣ Enforce expiry via SQL (state change only)
      * -------------------------------------------------- */
      const { data: expiredCount, error: expiryError } =
        await supabaseServer.rpc("enforce_booking_expiry");

      if (expiryError) {
        console.error("❌ Failed to enforce booking expiry", expiryError);
        return NextResponse.json(
          { error: "expiry_failed" },
          { status: 500 }
        );
      }

      /* --------------------------------------------------
      * 2️⃣ Find system-rejected bookings needing refund
      * -------------------------------------------------- */
      const { data: bookings, error: fetchError } =
        await supabaseServer
          .from("bookings")
          .select("id")
          .eq("status", "rejected")
          .eq("rejected_by", "system")
          .is("refund_status", null);

      if (fetchError) {
        console.error(
          "❌ Failed to load expired bookings for refund",
          fetchError
        );
        return NextResponse.json(
          { error: "refund_fetch_failed" },
          { status: 500 }
        );
      }

      /* --------------------------------------------------
      * 3️⃣ Trigger refunds (best-effort)
      * -------------------------------------------------- */
      let refundedCount = 0;

      for (const booking of bookings ?? []) {
        await refundBooking({
          bookingId: booking.id,
          reason: "Auto-expired (host did not respond)",
          initiatedBy: "system",
        });
        refundedCount++;
      }

      return NextResponse.json({
        success: true,
        expired_marked: expiredCount ?? 0,
        refunds_triggered: refundedCount,
      });
    } catch (err) {
      console.error("❌ run-expiry-jobs error", err);
      return NextResponse.json(
        { error: "internal_error" },
        { status: 500 }
      );
    }
  }
