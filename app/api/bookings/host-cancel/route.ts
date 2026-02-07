import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { refundBooking } from "@/lib/refund-executor";

export async function POST(req: NextRequest) {
  try {
    const { bookingId } = await req.json();

    if (!bookingId) {
      return NextResponse.json(
        { error: "bookingId missing" },
        { status: 400 }
      );
    }

    // 1️⃣ Load booking (service role, no auth)
    const { data: booking, error } = await supabaseServer
      .from("bookings")
      .select("id, status")
      .eq("id", bookingId)
      .single();

    if (error || !booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // 2️⃣ State validation
    if (booking.status !== "confirmed") {
      return NextResponse.json(
        { error: "Booking cannot be cancelled" },
        { status: 400 }
      );
    }

    // 3️⃣ Update booking
    await supabaseServer
      .from("bookings")
      .update({
        status: "cancelled",
        cancelled_by: "host",
      })
      .eq("id", bookingId)
      .eq("status", "confirmed");

    // 4️⃣ Trigger refund (safe + idempotent)
    await refundBooking({
      bookingId,
      reason: "Host cancelled booking after acceptance",
      initiatedBy: "host",
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Host cancel error", err);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}
