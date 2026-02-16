"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Booking = {
  id: string;
  order_code: string;
  created_at: string;
  booking_date: string;
  start_time: string;
  duration_minutes: number;
  amount: number;
  status: string;
  payment_status: string;
  user_message: string | null;
  users: {
  full_name: string | null;
  } | null;
  };

function formatDateTime(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "—";

  const datePart = date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const timePart = date
    .toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .toLowerCase();

  return `${datePart}, IST ${timePart}`;
}

function getStatusBadge(status: string) {
  if (status === "confirmed") {
    return { label: "Confirmed", className: "bg-green-100 text-green-700" };
  }

  if (status === "pending_confirmation") {
    return {
      label: "Awaiting confirmation",
      className: "bg-yellow-100 text-yellow-800",
    };
  }

  if (status === "cancelled") {
    return { label: "Cancelled", className: "bg-gray-100 text-gray-600" };
  }

  if (status === "rejected") {
    return { label: "Rejected", className: "bg-red-100 text-red-700" };
  }

  return {
    label: status.replaceAll("_", " "),
    className: "bg-gray-100 text-gray-600",
  };
}

export default function ExpertOrders() {
  const [rows, setRows] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  function isFutureMeeting(b: Booking) {
    const start = new Date(`${b.booking_date}T${b.start_time}`);
    return start > new Date();
  }

  async function loadOrders() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setLoading(false);
      return;
    }

    await supabase.rpc("enforce_booking_expiry");

    const { data, error } = await supabase
      .from("bookings")
      .select(`
        id,
        order_code,
        created_at,
        booking_date,
        start_time,
        duration_minutes,
        amount,
        status,
        payment_status,
        user_message,
        users!bookings_user_id_fkey (
        full_name
      )
      `)
      .eq("expert_id", session.user.id)
      .eq("payment_status", "confirmed")
      .order("created_at", { ascending: false }) as {
      data: Booking[] | null;
      error: any;
      };


    if (error || !data) {
      console.error("Failed to load expert orders", error);
      setLoading(false);
      return;
    }

    setRows(data);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="rounded-xl bg-white p-6 text-sm text-gray-500">
        Loading incoming requests…
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-xl bg-white p-6 text-sm text-gray-500">
        No incoming requests
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6">
      <h1 className="text-xl font-semibold mb-6 text-gray-900">
        Incoming Requests
      </h1>

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-orange-50">
            <tr className="text-gray-700">
              <th className="px-4 py-3 text-left font-medium">Order ID</th>
              <th className="px-4 py-3 text-left font-medium">Order Time</th>
              <th className="px-4 py-3 text-left font-medium">Requestor</th>
              <th className="px-4 py-3 text-left font-medium">
                Conversation Date & Time
              </th>
              <th className="px-4 py-3 text-left font-medium">Duration</th>
              <th className="px-4 py-3 text-left font-medium">Amount</th>
              <th className="px-4 py-3 text-left font-medium">Order Status</th>
              <th className="px-4 py-3 text-left font-medium">Action</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((b) => {
              const canAcceptReject =
                b.payment_status === "confirmed" &&
                b.status === "pending_confirmation" &&
                isFutureMeeting(b);

              const canCancel =
                b.payment_status === "confirmed" &&
                b.status === "confirmed" &&
                isFutureMeeting(b);

              const badge = getStatusBadge(b.status);
              const isExpanded = expandedId === b.id;

              return (
                <>
                  {/* Main Row */}
                  <tr
                    key={b.id}
                    className="border-t transition hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      {b.order_code}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDateTime(b.created_at)}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {b.users?.full_name ?? "Customer"}
                    </td>
                    <td className="px-4 py-3">
                      {formatDateTime(
                        `${b.booking_date}T${b.start_time}`
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {b.duration_minutes} mins
                    </td>
                    <td className="px-4 py-3">₹{b.amount}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-2">
                        {b.user_message && (
                          <button
                            onClick={() =>
                              setExpandedId(
                                isExpanded ? null : b.id
                              )
                            }
                            className="text-xs text-orange-600 hover:underline text-left"
                          >
                            {isExpanded
                              ? "Hide message ▲"
                              : "View message ▼"}
                          </button>
                        )}

                        {canAcceptReject ? (
                          <div className="flex gap-2">
                            <button
                              disabled={acceptingId === b.id}
                              onClick={async () => {
                                try {
                                  setAcceptingId(b.id);

                                  const res = await fetch(
                                    "/api/bookings/accept",
                                    {
                                      method: "POST",
                                      headers: {
                                        "Content-Type":
                                          "application/json",
                                      },
                                      body: JSON.stringify({
                                        bookingId: b.id,
                                      }),
                                    }
                                  );

                                  if (!res.ok) {
                                    const json =
                                      await res.json();
                                    alert(
                                      json.error ||
                                        "Failed to accept booking"
                                    );
                                    return;
                                  }

                                  await loadOrders();
                                } finally {
                                  setAcceptingId(null);
                                }
                              }}
                              className="rounded-md bg-orange-500 px-3 py-1 text-sm text-white"
                            >
                              Accept
                            </button>

                            <button
                              onClick={async () => {
                                const confirmed =
                                  window.confirm(
                                    "Reject this booking request?"
                                  );
                                if (!confirmed) return;

                                const res = await fetch(
                                  "/api/bookings/host-reject",
                                  {
                                    method: "POST",
                                    headers: {
                                      "Content-Type":
                                        "application/json",
                                    },
                                    body: JSON.stringify({
                                      bookingId: b.id,
                                    }),
                                  }
                                );

                                if (!res.ok) {
                                  const json =
                                    await res.json();
                                  alert(
                                    json.error ||
                                      "Failed to reject booking"
                                  );
                                  return;
                                }

                                loadOrders();
                              }}
                              className="rounded-md bg-red-600 px-3 py-1 text-sm text-white"
                            >
                              Reject
                            </button>
                          </div>
                        ) : canCancel ? (
                          <button
                            onClick={async () => {
                              const confirmed =
                                window.confirm(
                                  "Are you sure you want to cancel this booking?\n\nThe user will be refunded (excluding Razorpay fee)."
                                );
                              if (!confirmed) return;

                              const res = await fetch(
                                "/api/bookings/host-cancel",
                                {
                                  method: "POST",
                                  headers: {
                                    "Content-Type":
                                      "application/json",
                                  },
                                  body: JSON.stringify({
                                    bookingId: b.id,
                                  }),
                                }
                              );

                              if (!res.ok) {
                                const json =
                                  await res.json();
                                alert(
                                  json.error ||
                                    "Failed to cancel booking"
                                );
                                return;
                              }

                              loadOrders();
                            }}
                            className="rounded-md bg-red-600 px-3 py-1 text-sm text-white"
                          >
                            Cancel
                          </button>
                        ) : (
                          "—"
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Secondary Expandable Row */}
                  {isExpanded && b.user_message && (
                    <tr className="bg-orange-50">
                      <td colSpan={8} className="px-6 py-4">
                        <div className="rounded-lg border border-orange-200 bg-white p-4 text-sm text-gray-700 whitespace-pre-wrap">
                          <div className="font-semibold text-orange-700 mb-2">
                            User Message
                          </div>
                          {b.user_message}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
