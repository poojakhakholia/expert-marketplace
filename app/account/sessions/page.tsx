"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

/* ---------------- Types ---------------- */

type BookingStatus =
  | "pending_confirmation"
  | "confirmed"
  | "rejected"
  | "cancelled";

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

interface Review {
  booking_id: string;
  rating: number;
  comment: string | null;
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

const getStartTime = (b: Booking) =>
  new Date(`${b.booking_date}T${b.start_time}`);

const hasMeetingStarted = (b: Booking) =>
  new Date() >= getStartTime(b);

const hasMeetingEnded = (b: Booking) => {
  const start = getStartTime(b);
  const end = new Date(
    start.getTime() + b.duration_minutes * 60 * 1000
  );
  return new Date() >= end;
};

const getJoinState = (b: Booking) => {
  if (b.status !== "confirmed") return { show: false };

  const start = getStartTime(b);
  const end = new Date(start.getTime() + b.duration_minutes * 60 * 1000);
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
  const [reviews, setReviews] = useState<Record<string, Review>>({});
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      setCurrentUserId(session.user.id);

      // 🔒 DB-owned expiry
      await supabase.rpc("enforce_booking_expiry");

      const { data: bookingsData } = await supabase
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

      const { data: reviewsData } = await supabase
        .from("reviews")
        .select("booking_id,rating,comment")
        .eq("user_id", session.user.id);

      const reviewMap: Record<string, Review> = {};
      reviewsData?.forEach((r) => {
        reviewMap[r.booking_id] = r;
      });

      setBookings(bookingsData || []);
      setReviews(reviewMap);
    };

    load();
  }, []);

    /* ✅ NEW: reconcile no-show AFTER meeting end */
  useEffect(() => {
    bookings.forEach(async (b) => {
      if (
        b.status === "confirmed" &&
        hasMeetingEnded(b) &&
        !b.no_show_by
      ) {
        let noShow: string | null = null;

        if (!b.host_joined_at && !b.user_joined_at) noShow = "both";
        else if (!b.host_joined_at) noShow = "host";
        else if (!b.user_joined_at) noShow = "user";

        if (noShow) {
          await supabase
            .from("bookings")
            .update({ no_show_by: noShow })
            .eq("id", b.id);
        }
      }
    });
  }, [bookings]);
  
  /* ---------------- Filters ---------------- */

  const upcoming = bookings
    .filter(
      (b) =>
        !hasMeetingEnded(b) &&
        (b.status === "confirmed" ||
          (b.status === "pending_confirmation" &&
            !hasMeetingStarted(b)))
    )
    .sort(
      (a, b) =>
        getStartTime(b).getTime() - getStartTime(a).getTime()
    );

  const past = bookings.filter(
    (b) =>
      hasMeetingEnded(b) ||
      b.status === "rejected" ||
      b.status === "cancelled" ||
      (b.status === "pending_confirmation" &&
        hasMeetingStarted(b))
  );

  const list = tab === "upcoming" ? upcoming : past;

  /* ---------------- UI ---------------- */

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
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "upcoming" ? "Upcoming" : "Past / Inactive"}
          </button>
        ))}
      </div>

      {/* Empty Upcoming CTA */}
      {tab === "upcoming" && upcoming.length === 0 && (
        <div className="text-center mt-20">
          <p className="text-gray-600">
            No upcoming conversations yet.
          </p>
          <Link
            href="/explore"
            className="inline-block mt-4 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg"
          >
            Explore experts on Intella
          </Link>
        </div>
      )}

      {/* Cards */}
      <div className="space-y-4">
        {list.map((b) => {
          const isRequestor = currentUserId === b.user_id;
          const displayName = isRequestor
            ? b.expert_profiles?.full_name
            : b.users?.full_name;

          const join =
            tab === "upcoming" ? getJoinState(b) : { show: false };

          const review = reviews[b.id];
          const canReview =
            tab === "past" &&
            b.status === "confirmed" &&
            hasMeetingEnded(b) &&
            !review &&
            isRequestor;

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
                <StatusBadge status={b.status} />
              </div>

              <div className="text-sm font-medium">
                Your conversation with {displayName ?? "—"}
              </div>

              <div className="text-sm text-gray-600">
                {formatDate(b.booking_date)} ·{" "}
                {formatTime(b.booking_date, b.start_time)} ·{" "}
                {b.duration_minutes} mins
              </div>

              {/* Expert microcopy */}
              {b.status === "pending_confirmation" &&
                !isRequestor &&
                tab === "upcoming" && (
                  <p className="text-xs text-amber-600">
                    Approve this conversation in Orders to generate
                    the meeting link.
                  </p>
                )}

              {join.show && (
                <button
                  disabled={!join.enabled}
                  onClick={async () => {
                    if (!join.enabled) return;

                    await supabase
                      .from("bookings")
                      .update(
                        isRequestor
                          ? { user_joined_at: new Date().toISOString("sv-SE", { timeZone: "Asia/Kolkata" }) }
                          : { host_joined_at: new Date().toISOString("sv-SE", { timeZone: "Asia/Kolkata" }) }
                      )
                      .eq("id", b.id);

                    // ✅ allow DB write to finish before navigation
                    setTimeout(() => {
                      window.open(b.meeting_link!, "_blank");
                    }, 300);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm ${
                    join.enabled
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {join.label}
                </button>
              )}

              {/* Review CTA */}
              {canReview && (
                <button
                  onClick={() => {
                    setReviewingId(b.id);
                    setRating(0);
                    setComment("");
                  }}
                  className="text-sm text-orange-600 hover:underline"
                >
                  ★ Leave a review
                </button>
              )}

              {/* Review Display */}
              {review && (
                <div className="text-sm text-green-600">
                  {"★".repeat(review.rating)}
                  {"☆".repeat(5 - review.rating)} · Review submitted
                </div>
              )}

              {/* Review Form */}
              {reviewingId === b.id && (
                <div className="mt-3 border-t pt-3 space-y-3">
                  <div className="flex gap-1 text-xl">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        onClick={() => setRating(s)}
                        className={
                          s <= rating
                            ? "text-orange-500"
                            : "text-gray-300"
                        }
                      >
                        ★
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={comment}
                    onChange={(e) =>
                      setComment(e.target.value)
                    }
                    placeholder="Share your experience (optional)"
                    className="w-full border rounded-lg p-3 text-sm"
                    rows={3}
                  />

                  <div className="flex gap-3">
                    <button
                      onClick={() => setReviewingId(null)}
                      className="text-sm text-gray-500"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={rating === 0}
                      onClick={async () => {
                        const {
                          data: { session },
                        } =
                          await supabase.auth.getSession();
                        if (!session) return;

                        await supabase.from("reviews").insert({
                          booking_id: b.id,
                          user_id: session.user.id,
                          expert_id: b.expert_id,
                          rating,
                          comment,
                        });

                        setReviews((prev) => ({
                          ...prev,
                          [b.id]: {
                            booking_id: b.id,
                            rating,
                            comment,
                          },
                        }));
                        setReviewingId(null);
                      }}
                      className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                    >
                      Submit review
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
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
    rejected: {
      label: "Rejected",
      className: "bg-red-50 text-red-700",
    },
    cancelled: {
      label: "Cancelled",
      className: "bg-red-50 text-red-700",
    },
  };

  return (
    <span
      className={`text-xs px-3 py-1 rounded-full ${map[status].className}`}
    >
      {map[status].label}
    </span>
  );
}
