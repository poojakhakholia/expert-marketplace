import { google } from "googleapis";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function createGoogleMeetEvent({
  summary,
  description,
  startISO,
  endISO,
}: {
  summary: string;
  description?: string;
  startISO: string;
  endISO: string;
}) {
  // 1️⃣ Load tokens
  const { data, error } = await supabase
    .from("google_oauth_tokens")
    .select("*")
    .eq("email", "meet@intella.in")
    .single();

  if (error || !data) {
    throw new Error("Google OAuth tokens not found");
  }

  // 2️⃣ OAuth client
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    process.env.GOOGLE_REDIRECT_URI!
  );

  oauth2Client.setCredentials({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expiry_date: data.expiry_date,
  });

  // 3️⃣ Calendar API
  const calendar = google.calendar({
    version: "v3",
    auth: oauth2Client,
  });

  // 4️⃣ Create event with Meet
  const event = await calendar.events.insert({
    calendarId: "primary",
    conferenceDataVersion: 1,
    requestBody: {
      summary,
      description,
      start: {
        dateTime: startISO,
        timeZone: "Asia/Kolkata",
      },
      end: {
        dateTime: endISO,
        timeZone: "Asia/Kolkata",
      },
      conferenceData: {
        createRequest: {
          requestId: crypto.randomUUID(),
          conferenceSolutionKey: {
            type: "hangoutsMeet",
          },
        },
      },
    },
  });

  const meetLink =
    event.data.conferenceData?.entryPoints?.find(
      e => e.entryPointType === "video"
    )?.uri;

  if (!meetLink) {
    throw new Error("Google Meet link not generated");
  }

  return meetLink;
}
