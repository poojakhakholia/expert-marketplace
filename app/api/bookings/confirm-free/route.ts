import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { sendSessionRequestEmail } from "@/lib/email/sendSessionRequest";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { booking_id } = body;

    if (!booking_id) {
      return NextResponse.json(
        { error: "booking_id_required" },
        { status: 400 }
      );
    }

    /* 1️⃣ Fetch booking */
    const { data: booking, error } = await supabaseServer
      .from("bookings")
      .select(
        "id, amount, payment_status, status"
      )
      .eq("id", booking_id)
      .single();

    if (error || !booking) {
      return NextResponse.json(
        { error: "booking_not_found" },
        { status: 404 }
      );
    }

    /* 2️⃣ Validate free booking */
    if (booking.amount !== 0) {
      return NextResponse.json(
        { error: "not_a_free_booking" },
        { status: 400 }
      );
    }

    if (
      booking.payment_status !== "confirmed" ||
      booking.status !== "pending_confirmation"
    ) {
      return NextResponse.json(
        { error: "invalid_booking_state" },
        { status: 400 }
      );
    }

    /* 3️⃣ Trigger expert email */
    await sendSessionRequestEmail(booking_id);

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("confirm-free error:", err);
    return NextResponse.json(
      { error: "internal_server_error" },
      { status: 500 }
    );
  }
}
