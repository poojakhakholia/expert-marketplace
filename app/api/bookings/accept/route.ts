import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createGoogleMeetEvent } from "@/lib/googleCalendar";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json(
        { error: "bookingId missing" },
        { status: 400 }
      );
    }

    // 1️⃣ Load booking
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // 2️⃣ Build session start & end time (IST-safe)
    // booking_date = YYYY-MM-DD
    // start_time = HH:mm:ss
    const sessionStartIST = `${booking.booking_date}T${booking.start_time}+05:30`;
    const sessionStart = new Date(sessionStartIST);

    const sessionEnd = new Date(sessionStart);
    sessionEnd.setMinutes(
      sessionEnd.getMinutes() + booking.duration_minutes
    );

    // 3️⃣ Create Google Meet
    const meetLink = await createGoogleMeetEvent({
      summary: "Intella Conversation",
      description: `Conversation with ${booking.buyer_name ?? "Guest"}`,
      startISO: sessionStart.toISOString(), // UTC
      endISO: sessionEnd.toISOString(),     // UTC
    });

    // 4️⃣ Update booking (SINGLE SOURCE OF TRUTH)
    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        status: "confirmed",
        host_accepted: true,
        meeting_link: meetLink,
        meeting_created_at: new Date().toISOString(),

        // 🔒 Critical for withdrawals & disputes
        session_start_at: sessionStart.toISOString(),
        session_end_at: sessionEnd.toISOString(),
      })
      .eq("id", bookingId)
      .eq("status", "pending_confirmation"); // idempotency guard

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      meeting_link: meetLink,
    });
  } catch (err: any) {
    console.error("❌ /api/bookings/accept error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
