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

    // 1️⃣ Load booking (service role)
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
        { error: "Booking cannot be cancelled" },
        { status: 400 }
      );
    }

    // 3️⃣ Update booking status
    await supabaseServer
      .from("bookings")
      .update({
        status: "cancelled",
        cancelled_by: "user",
      })
      .eq("id", bookingId)
      .eq("status", "pending_confirmation");

    // 4️⃣ Trigger auto-refund
    await refundBooking({
      bookingId,
      reason: "User cancelled before host acceptance",
      initiatedBy: "system",
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ User cancel error", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
