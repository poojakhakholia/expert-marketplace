import React from "react";
import BaseEmailLayout from "../layouts/BaseEmailLayout";

interface SessionRequestEmailProps {
  expertName: string;
  userName: string;
  bookingDate: string;
  bookingTime: string;
  durationMinutes: number;
  earningsAmount: number;
  bookingId: string;
  userMessage?: string | null; // ✅ ADDED
}

const BRAND_ORANGE = "#F97316";
const TEXT_DARK = "#0F172A";
const TEXT_MUTED = "#64748B";
const BORDER_COLOR = "#E2E8F0";

export default function SessionRequestEmail({
  expertName,
  userName,
  bookingDate,
  bookingTime,
  durationMinutes,
  earningsAmount,
  bookingId,
  userMessage, // ✅ ADDED
}: SessionRequestEmailProps) {
  const reviewLink = `${process.env.NEXT_PUBLIC_APP_URL}/account/orders/received`;

  return (
    <BaseEmailLayout previewText="You have a new session request on Intella. Review and respond to confirm your earning.">
      <div style={{ fontSize: "20px", fontWeight: 600, color: TEXT_DARK, marginBottom: "16px" }}>
        You’ve received a new session request 🚀
      </div>

      <div style={{ fontSize: "15px", color: TEXT_MUTED, marginBottom: "24px", lineHeight: "1.6" }}>
        Hi {expertName},<br /><br />
        {userName} has requested a session with you. Review the details below and approve to confirm your earning.
      </div>

      {/* Booking Summary Card */}
      <table
        width="100%"
        cellPadding="0"
        cellSpacing="0"
        style={{
          border: `1px solid ${BORDER_COLOR}`,
          borderRadius: "10px",
          padding: "20px",
          marginBottom: "28px",
        }}
      >
        <tbody>
          <tr>
            <td style={{ padding: "6px 0", color: TEXT_MUTED }}>User</td>
            <td style={{ padding: "6px 0", color: TEXT_DARK, fontWeight: 500 }} align="right">
              {userName}
            </td>
          </tr>
          <tr>
            <td style={{ padding: "6px 0", color: TEXT_MUTED }}>Date</td>
            <td style={{ padding: "6px 0", color: TEXT_DARK }} align="right">
              {bookingDate}
            </td>
          </tr>
          <tr>
            <td style={{ padding: "6px 0", color: TEXT_MUTED }}>Time</td>
            <td style={{ padding: "6px 0", color: TEXT_DARK }} align="right">
              {bookingTime}
            </td>
          </tr>
          <tr>
            <td style={{ padding: "6px 0", color: TEXT_MUTED }}>Duration</td>
            <td style={{ padding: "6px 0", color: TEXT_DARK }} align="right">
              {durationMinutes} minutes
            </td>
          </tr>
          <tr>
            <td style={{ padding: "12px 0 6px 0", color: TEXT_MUTED, fontWeight: 500 }}>
              You Earn
            </td>
            <td
              style={{
                padding: "12px 0 6px 0",
                color: BRAND_ORANGE,
                fontWeight: 600,
                fontSize: "16px",
              }}
              align="right"
            >
              ₹{earningsAmount}
            </td>
          </tr>
        </tbody>
      </table>

      {/* ✅ Optional User Message Section */}
      {userMessage && (
        <div
          style={{
            border: `1px solid ${BORDER_COLOR}`,
            borderRadius: "10px",
            padding: "16px",
            marginBottom: "28px",
            backgroundColor: "#F8FAFC",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              fontWeight: 600,
              color: TEXT_DARK,
              marginBottom: "8px",
            }}
          >
            Message from {userName}
          </div>
          <div
            style={{
              fontSize: "14px",
              color: TEXT_MUTED,
              lineHeight: "1.6",
              whiteSpace: "pre-wrap",
            }}
          >
            {userMessage}
          </div>
        </div>
      )}

      {/* CTA Button */}
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <a
          href={reviewLink}
          style={{
            backgroundColor: BRAND_ORANGE,
            color: "#ffffff",
            padding: "14px 28px",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: 600,
            fontSize: "15px",
            display: "inline-block",
          }}
        >
          Review & Respond
        </a>
      </div>

      {/* Growth Note */}
      <div
        style={{
          fontSize: "14px",
          color: TEXT_MUTED,
          lineHeight: "1.6",
          textAlign: "center",
        }}
      >
        Quick responses improve your acceptance rate and increase your visibility on Intella.
      </div>
    </BaseEmailLayout>
  );
}
