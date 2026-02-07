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
    if (booking.status !== "pending_confirmation") {
      return NextResponse.json(
        { error: "Booking cannot be rejected" },
        { status: 400 }
      );
    }

    // 3️⃣ Mark booking rejected
    await supabaseServer
      .from("bookings")
      .update({
        status: "rejected",
        rejected_by: "host",
      })
      .eq("id", bookingId);

    // 4️⃣ Trigger refund (idempotent + safe)
    await refundBooking({
      bookingId,
      reason: "Host rejected booking",
      initiatedBy: "host",
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Host reject error", err);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}
