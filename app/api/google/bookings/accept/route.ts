import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createGoogleMeetEvent } from "@/lib/googleCalendar";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { bookingId } = await req.json();

    // 1️⃣ Load booking
    const { data: booking, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (error || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // 2️⃣ Build start/end ISO
    const startISO = `${booking.booking_date}T${booking.start_time}+05:30`;
    const endDate = new Date(startISO);
    endDate.setMinutes(endDate.getMinutes() + booking.duration_minutes);
    const endISO = endDate.toISOString();

    // 3️⃣ Create Meet
    const meetLink = await createGoogleMeetEvent({
      summary: "Intella Conversation",
      description: `Conversation with ${booking.buyer_name || "Guest"}`,
      startISO,
      endISO,
    });

    // 4️⃣ Update booking
    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        status: "confirmed",
        host_accepted: true,
        meeting_link: meetLink,
        meeting_created_at: new Date().toISOString(),
      })
      .eq("id", bookingId);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      meeting_link: meetLink,
    });
  } catch (err: any) {
    console.error("❌ ACCEPT BOOKING ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Failed to accept booking" },
      { status: 500 }
    );
  }
}
