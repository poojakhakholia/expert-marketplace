import BaseEmailLayout from "../layouts/BaseEmailLayout";

interface Props {
  userName: string;
  expertName: string;
  bookingDate: string;
  bookingTime: string;
  durationMinutes: number;
  meetingLink: string; // kept to avoid breaking sender logic (not used)
}

export default function SessionAcceptedEmail({
  userName,
  expertName,
  bookingDate,
  bookingTime,
  durationMinutes,
}: Props) {
  return (
    <BaseEmailLayout>
      <h2 style={{ marginBottom: 16 }}>
        🎉 Your session is confirmed!
      </h2>

      <p>Hi {userName},</p>

      <p>
        {expertName} has accepted your session request.
        Here are your session details:
      </p>

      <div
        style={{
          background: "#f9fafb",
          padding: "16px",
          borderRadius: "8px",
          margin: "20px 0",
        }}
      >
        <p><strong>Date:</strong> {bookingDate}</p>
        <p><strong>Time:</strong> {bookingTime}</p>
        <p><strong>Duration:</strong> {durationMinutes} minutes</p>
      </div>

      <a
        href={`${process.env.NEXT_PUBLIC_APP_URL}/account/sessions`}
        style={{
          display: "inline-block",
          backgroundColor: "#FF7A00",
          color: "#ffffff",
          padding: "12px 20px",
          borderRadius: "6px",
          textDecoration: "none",
          fontWeight: 600,
        }}
      >
        Go to My Conversations
      </a>

      <p style={{ marginTop: 24 }}>
        You can join the session from your conversations page when it becomes available.
      </p>
    </BaseEmailLayout>
  );
}
