import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { refundBooking } from "@/lib/refund-executor";

export async function POST() {
  try {
    // 1️⃣ Find expired bookings needing refund
    const { data: bookings, error } = await supabaseServer
      .from("bookings")
      .select("id")
      .eq("status", "rejected")
      .eq("rejected_by", "system")
      .is("refund_status", null);

    if (error) {
      console.error("❌ Failed to load expired bookings", error);
      return NextResponse.json(
        { error: "Failed to load expired bookings" },
        { status: 500 }
      );
    }

    // 2️⃣ Trigger refunds (best-effort)
    for (const booking of bookings ?? []) {
      await refundBooking({
        bookingId: booking.id,
        reason: "Auto-expired (host did not respond)",
        initiatedBy: "system",
      });
    }

    return NextResponse.json({
      success: true,
      processed: bookings?.length ?? 0,
    });
  } catch (err) {
    console.error("❌ Auto-expiry refund processing error", err);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}
