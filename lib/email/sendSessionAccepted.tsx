import SessionAcceptedEmail from "../../emails/templates/SessionAcceptedEmail";
import { sendEmail } from "./sendEmail";
import { supabaseServer } from "@/lib/supabaseServer";

export async function sendSessionAcceptedEmail(bookingId: string) {
  try {
    const { data: booking, error } = await supabaseServer
      .from("bookings")
      .select(
        "id, booking_date, start_time, duration_minutes, amount, meeting_link, user_id, expert_id, status"
      )
      .eq("id", bookingId)
      .single();

    if (error || !booking) return;
    if (booking.status !== "confirmed") return;

    const [{ data: user }, { data: expert }] = await Promise.all([
      supabaseServer
        .from("users")
        .select("id, email, full_name, notify_session_confirmed")
        .eq("id", booking.user_id)
        .single(),
      supabaseServer
        .from("users")
        .select("full_name")
        .eq("id", booking.expert_id)
        .single(),
    ]);

    if (!user?.email || !user.notify_session_confirmed) return;

    const bookingDate = new Date(
      booking.booking_date
    ).toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const bookingTime = booking.start_time.slice(0, 5) + " IST";

    const emailTemplate = (
      <SessionAcceptedEmail
        userName={user.full_name || "there"}
        expertName={expert?.full_name || "Your host"}
        bookingDate={bookingDate}
        bookingTime={bookingTime}
        durationMinutes={booking.duration_minutes}
        meetingLink={booking.meeting_link}
      />
    );

    await sendEmail({
      to: user.email,
      subject: "Your Session is Confirmed 🎉",
      react: emailTemplate,
      userId: user.id,
      bookingId: booking.id,
      emailType: "session_confirmed",
    });

  } catch (err) {
    console.error("sendSessionAcceptedEmail error:", err);
  }
}
