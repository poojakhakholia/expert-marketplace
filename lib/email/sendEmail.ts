import { resend } from "./resend";
import { supabaseServer } from "@/lib/supabaseServer";
import { render } from "@react-email/render";
import React from "react";

interface SendEmailParams {
  to: string;
  subject: string;
  react: React.ReactNode;
  userId: string;
  bookingId?: string;
  emailType:
  | "session_request"
  | "session_reminder"
  | "expert_approved"
  | "session_confirmed";
}

export async function sendEmail({
  to,
  subject,
  react,
  userId,
  bookingId,
  emailType,
}: SendEmailParams) {
  try {
    // Insert pending log
    const { data: log } = await supabaseServer
      .from("email_logs")
      .insert({
        user_id: userId,
        booking_id: bookingId ?? null,
        email_type: emailType,
        status: "pending",
      })
      .select()
      .single();

    // 🔥 Render React to HTML
    const html = await render(react);

    // Send email
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM as string,
      to,
      subject,
      html, // IMPORTANT: use html instead of react
    });

    if (error) {
      console.error("Email send failed:", error);

      if (log?.id) {
        await supabaseServer
          .from("email_logs")
          .update({
            status: "failed",
            error_message: error.message,
          })
          .eq("id", log.id);
      }

      return { success: false };
    }

    if (log?.id) {
      await supabaseServer
        .from("email_logs")
        .update({
          status: "sent",
          provider_message_id: data?.id ?? null,
        })
        .eq("id", log.id);
    }

    return { success: true };
  } catch (err: any) {
    console.error("Unexpected email error:", err);
    return { success: false };
  }
}
