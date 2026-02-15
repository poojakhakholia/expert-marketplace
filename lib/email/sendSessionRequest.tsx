import SessionRequestEmail from "@/emails/templates/SessionRequestEmail";
import { sendEmail } from "./sendEmail";
import { supabaseServer } from "@/lib/supabaseServer";

export async function sendSessionRequestEmail(bookingId: string) {
  try {
    /* 1️⃣ Fetch booking */
    const { data: booking, error: bookingErr } =
      await supabaseServer
        .from("bookings")
        .select(
          "id, user_id, expert_id, booking_date, start_time, duration_minutes, amount, status, payment_status, user_message"
        )
        .eq("id", bookingId)
        .single();

    if (bookingErr || !booking) {
      console.error("Booking not found for email:", bookingErr);
      return;
    }

    /* Guard: only send for valid state */
    if (
      booking.status !== "pending_confirmation" ||
      booking.payment_status !== "confirmed"
    ) {
      return;
    }

    /* 2️⃣ Fetch expert */
    const { data: expert, error: expertErr } =
      await supabaseServer
        .from("users")
        .select("id, email, full_name, notify_session_request")
        .eq("id", booking.expert_id)
        .single();

    if (expertErr || !expert || !expert.email) {
      console.error("Expert not found for email:", expertErr);
      return;
    }

    /* Respect notification toggle */
    if (!expert.notify_session_request) {
      return;
    }

    /* 3️⃣ Fetch user */
    const { data: user } =
      await supabaseServer
        .from("users")
        .select("full_name")
        .eq("id", booking.user_id)
        .single();

    /* 4️⃣ Format date/time (IST) */
    const bookingDate = new Date(booking.booking_date).toLocaleDateString(
      "en-IN",
      {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );

    const bookingTime = booking.start_time.slice(0, 5) + " IST";

    /* 5️⃣ Render template */
    const emailTemplate = (
      <SessionRequestEmail
        expertName={expert.full_name || "there"}
        userName={user?.full_name || "A user"}
        bookingDate={bookingDate}
        bookingTime={bookingTime}
        durationMinutes={booking.duration_minutes}
        earningsAmount={booking.amount}
        bookingId={booking.id}
        userMessage={booking.user_message}   // ✅ THIS LINE
      />
    );

    /* 6️⃣ Send */
    await sendEmail({
      to: expert.email,
      subject: "New Session Request — Action Needed 🚀",
      react: emailTemplate,
      userId: expert.id,
      bookingId: booking.id,
      emailType: "session_request",
    });

  } catch (err) {
    console.error("sendSessionRequestEmail error:", err);
  }
}
