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
  expert_profiles: {
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

function getStatusBadge(status: string, paymentStatus?: string) {
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
    if (paymentStatus === "abandoned") {
      return {
        label: "Payment abandoned",
        className: "bg-gray-100 text-gray-600",
      };
    }

    if (paymentStatus === "failed") {
      return {
        label: "Payment failed",
        className: "bg-red-100 text-red-700",
      };
    }

    return {
      label: "Cancelled",
      className: "bg-gray-100 text-gray-600",
    };
  }

  if (status === "rejected") {
    return { label: "Rejected", className: "bg-red-100 text-red-700" };
  }

  return {
    label: status.replaceAll("_", " "),
    className: "bg-gray-100 text-gray-600",
  };
}

export default function UserOrders() {
  const [rows, setRows] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
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
        expert_profiles!bookings_expert_id_fkey (
        full_name
        )
      `)
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false }) as {
        data: Booking[] | null;
        error: any;
      };

            
    if (error || !data) {
      console.error(error);
      setLoading(false);
      return;
    }

    setRows(data);
    setLoading(false);
  }

  async function handleCancel(bookingId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?\n\nYou can cancel only before the host accepts. Razorpay payment fee is non-refundable."
    );

    if (!confirmed) return;

    const res = await fetch("/api/bookings/user-cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId }),
    });

    if (!res.ok) {
      const json = await res.json();
      alert(json.error || "Unable to cancel booking.");
      return;
    }

    load();
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 text-sm text-gray-500">
        Loading orders…
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 text-sm text-gray-500">
        No orders found
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6">
      <h1 className="text-xl font-semibold mb-6 text-gray-900">
        Orders Placed
      </h1>

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-orange-50">
            <tr className="text-gray-700">
              <th className="px-4 py-3 text-left font-medium">Order ID</th>
              <th className="px-4 py-3 text-left font-medium">Order Time</th>
              <th className="px-4 py-3 text-left font-medium">Host</th>
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
              const conversationDateTime = `${b.booking_date}T${b.start_time}`;

              const canCancel =
                b.payment_status === "confirmed" &&
                b.status === "pending_confirmation";

              const badge = getStatusBadge(
                b.status,
                b.payment_status
              );

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
                      {b.expert_profiles?.full_name ?? "Host"}
                    </td>
                    <td className="px-4 py-3">
                      {formatDateTime(conversationDateTime)}
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
                              ? "Hide your message ▲"
                              : "View your message ▼"}
                          </button>
                        )}

                        {canCancel ? (
                          <button
                            onClick={() => handleCancel(b.id)}
                            className="text-red-600 hover:underline text-sm"
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
                            Your Message to Host
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
