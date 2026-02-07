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
  expert_profiles: {
    full_name: string | null;
  } | null;
};

export default function UserOrders() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

    // 🔒 Enforce auto-rejection of expired pending bookings
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
        expert_profiles (
          full_name
        )
      `)
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error || !data) {
      console.error(error);
      setLoading(false);
      return;
    }

    const mappedRows = data.map((b: Booking) => {
      const conversationDateTime = `${b.booking_date}T${b.start_time}`;

      const canCancel =
        b.payment_status === "confirmed" &&
        b.status === "pending_confirmation";

      return {
        id: b.id,
        orderCode: b.order_code,
        orderDate: b.created_at,
        name: b.expert_profiles?.full_name ?? "Host",
        dateTime: conversationDateTime,
        duration: b.duration_minutes,
        amount: b.amount,
        status: b.status,

        actions: canCancel ? (
          <button
            onClick={() => handleCancel(b.id)}
            className="text-red-600 hover:underline text-sm"
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

    // reload orders
    load();
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 text-sm text-gray-500">
        Loading orders…
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6">
      <h1 className="text-xl font-semibold mb-6 text-gray-900">
        Orders Placed
      </h1>

      <OrdersTable rows={rows} nameLabel="Host" />
    </div>
  );
}
