"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

/* ---------------- Types ---------------- */

type BookingStatus =
  | "pending_confirmation"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "refunded";

interface Booking {
  id: string;
  order_code: string | null;
  user_id: string;
  expert_id: string;
  booking_date: string;
  start_time: string;
  duration_minutes: number;
  status: BookingStatus;
  meeting_link: string | null;
  host_accepted: boolean;
  payment_status: string;
  users?: { full_name: string | null };
  expert_profiles?: { full_name: string | null };
}

/* ---------------- Helpers ---------------- */

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const formatTime = (date: string, time: string) =>
  new Date(`${date}T${time}`).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

/**
 * JOIN BUTTON LOGIC (FINAL)
 * - Conversation remains Upcoming until meeting END time
 * - Join enabled 15 mins before start
 * - Join remains active until meeting END time
 */
const getJoinState = (b: Booking) => {
  if (b.status !== "confirmed") {
    return { show: false };
  }

  const start = new Date(`${b.booking_date}T${b.start_time}`);
  const end = new Date(
    start.getTime() + b.duration_minutes * 60 * 1000
  );
  const joinOpen = new Date(start.getTime() - 15 * 60 * 1000);
  const now = new Date();

  if (
    !b.host_accepted ||
    b.payment_status !== "confirmed" ||
    !b.meeting_link ||
    now < joinOpen ||
    now > end
  ) {
    return {
      show: true,
      enabled: false,
      label: "Join (available 15 mins before)",
    };
  }

  return {
    show: true,
    enabled: true,
    label: "Join conversation",
  };
};

/* ---------------- Page ---------------- */

export default function MySessionsPage() {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [submittedReviews, setSubmittedReviews] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from("bookings")
        .select(
          `
          *,
          users(full_name),
          expert_profiles(full_name)
        `
        )
        .or(
          `user_id.eq.${session.user.id},expert_id.eq.${session.user.id}`
        )
        .order("booking_date", { ascending: true });

      setBookings(data || []);
    };

    load();
  }, []);

  const now = new Date();

  const upcoming = bookings.filter((b) => {
    const start = new Date(`${b.booking_date}T${b.start_time}`);
    const end = new Date(
      start.getTime() + b.duration_minutes * 60 * 1000
    );

    return (
      now < end &&
      !["cancelled", "refunded"].includes(b.status)
    );
  });

  const past = bookings.filter((b) => {
    const start = new Date(`${b.booking_date}T${b.start_time}`);
    const end = new Date(
      start.getTime() + b.duration_minutes * 60 * 1000
    );

    return now >= end || b.status === "completed";
  });

  const list = tab === "upcoming" ? upcoming : past;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">My Conversations</h1>

      {/* Tabs */}
      <div className="flex gap-6 border-b text-sm">
        {["upcoming", "past"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t as any)}
            className={`pb-2 ${
              tab === t
                ? "border-b-2 border-orange-500 font-medium"
                : "text-gray-500"
            }`}
          >
            {t === "upcoming" ? "Upcoming" : "Past"}
          </button>
        ))}
      </div>

      {/* Empty Upcoming */}
      {list.length === 0 && tab === "upcoming" && (
        <div className="text-center mt-20">
          <p className="text-gray-600">
            No upcoming conversations yet.
          </p>
          <Link
            href="/explore"
            className="inline-block mt-4 bg-orange-500 text-white px-6 py-3 rounded-lg"
          >
            Book a call with experienced professionals
          </Link>
        </div>
      )}

      {/* Cards */}
      <div className="space-y-4">
        {list.map((b) => {
          const join =
            tab === "upcoming" ? getJoinState(b) : { show: false };

          let displayStatus: BookingStatus = b.status;
          if (
            tab === "past" &&
            b.status === "pending_confirmation"
          ) {
            displayStatus = "cancelled";
          }

          return (
            <div
              key={b.id}
              className="rounded-xl border bg-white p-5 space-y-3"
            >
              <div className="flex justify-between">
                {b.order_code && (
                  <div className="text-xs text-gray-500">
                    {b.order_code}
                  </div>
                )}
                <StatusBadge status={displayStatus} />
              </div>

              <div className="text-sm font-medium">
                Conversation between{" "}
                {b.expert_profiles?.full_name ?? "—"} &{" "}
                {b.users?.full_name ?? "—"}
              </div>

              <div className="text-sm text-gray-600">
                {formatDate(b.booking_date)} ·{" "}
                {formatTime(b.booking_date, b.start_time)} ·{" "}
                {b.duration_minutes} mins
              </div>

              {join.show && (
                <>
                  <button
                    disabled={!join.enabled}
                    onClick={() =>
                      join.enabled &&
                      window.open(b.meeting_link!, "_blank")
                    }
                    className={`px-4 py-2 rounded-lg text-sm ${
                      join.enabled
                        ? "bg-orange-500 text-white"
                        : "bg-gray-100 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {join.label}
                  </button>

                  {!join.enabled && (
                    <p className="text-xs text-gray-500">
                      Join link will be activated 15 minutes before the
                      call
                    </p>
                  )}
                </>
              )}

              {tab === "past" &&
                displayStatus === "completed" &&
                !submittedReviews.includes(b.id) && (
                  <button
                    className="text-sm text-orange-600 hover:underline"
                    onClick={() => setReviewingId(b.id)}
                  >
                    Leave review
                  </button>
                )}

              {submittedReviews.includes(b.id) && (
                <span className="text-sm text-green-600">
                  Review submitted
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Review Modal */}
      {reviewingId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-semibold">Leave a review</h3>

            <textarea
              placeholder="Share your experience (optional)"
              className="w-full border rounded-lg p-3 text-sm"
              rows={4}
            />

            <div className="flex justify-end gap-3">
              <button
                className="text-sm text-gray-500"
                onClick={() => setReviewingId(null)}
              >
                Cancel
              </button>
              <button
                className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm"
                onClick={() => {
                  setSubmittedReviews((prev) => [
                    ...prev,
                    reviewingId,
                  ]);
                  setReviewingId(null);
                }}
              >
                Submit review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Badge ---------------- */

function StatusBadge({ status }: { status: BookingStatus }) {
  const map: Record<
    BookingStatus,
    { label: string; className: string }
  > = {
    pending_confirmation: {
      label: "Pending host confirmation",
      className: "bg-amber-50 text-amber-700",
    },
    confirmed: {
      label: "Confirmed",
      className: "bg-green-50 text-green-700",
    },
    completed: {
      label: "Completed",
      className: "bg-green-50 text-green-700",
    },
    cancelled: {
      label: "Cancelled",
      className: "bg-red-50 text-red-700",
    },
    refunded: {
      label: "Refunded",
      className: "bg-red-50 text-red-700",
    },
  };

  const config = map[status];

  return (
    <span
      className={`text-xs px-3 py-1 rounded-full ${config.className}`}
    >
      {config.label}
    </span>
  );
}
