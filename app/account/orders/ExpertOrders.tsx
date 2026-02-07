"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import OrdersTable from "../../components/orders/OrdersTable";

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
  users: {
    full_name: string | null;
  } | null;
};

export default function ExpertOrders() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

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

    // DB-owned expiry (safe to call multiple times)
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
        users ( full_name )
      `)
      .eq("expert_id", session.user.id)
      .eq("payment_status", "confirmed")
      .order("created_at", { ascending: false });

    if (error || !data) {
      console.error("Failed to load expert orders", error);
      setLoading(false);
      return;
    }

    const mappedRows = data.map((b: Booking) => {
      const canAcceptReject =
        b.payment_status === "confirmed" &&
        b.status === "pending_confirmation" &&
        isFutureMeeting(b);

      const canCancel =
        b.payment_status === "confirmed" &&
        b.status === "confirmed" &&
        isFutureMeeting(b);

      return {
        id: b.id,
        orderCode: b.order_code,
        orderDate: b.created_at,
        name: b.users?.full_name ?? "Customer",
        dateTime: `${b.booking_date}T${b.start_time}`,
        duration: b.duration_minutes,
        amount: b.amount,
        status: b.status,

        actions: canAcceptReject ? (
          <div className="flex gap-2">
            <button
              disabled={acceptingId === b.id}
              onClick={async () => {
                try {
                  setAcceptingId(b.id);

                  const res = await fetch("/api/bookings/accept", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ bookingId: b.id }),
                  });

                  if (!res.ok) {
                    const json = await res.json();
                    alert(json.error || "Failed to accept booking");
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
                const confirmed = window.confirm(
                  "Reject this booking request?"
                );
                if (!confirmed) return;

                const res = await fetch("/api/bookings/host-reject", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ bookingId: b.id }),
                });

                if (!res.ok) {
                  const json = await res.json();
                  alert(json.error || "Failed to reject booking");
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
              const confirmed = window.confirm(
                "Are you sure you want to cancel this booking?\n\nThe user will be refunded (excluding Razorpay fee)."
              );
              if (!confirmed) return;

              const res = await fetch("/api/bookings/host-cancel", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ bookingId: b.id }),
              });

              if (!res.ok) {
                const json = await res.json();
                alert(json.error || "Failed to cancel booking");
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
        ),
      };
    });

    setRows(mappedRows);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="rounded-xl bg-white p-6 text-sm text-gray-500">
        Loading incoming requests…
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6">
      <h1 className="text-xl font-semibold mb-6 text-gray-900">
        Incoming Requests
      </h1>

      <OrdersTable rows={rows} nameLabel="Requestor" />
    </div>
  );
}
