"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import OrdersTable, { OrderRow } from "../../components/orders/OrdersTable";

type Booking = {
  id: string;
  booking_date: string;
  start_time: string;
  duration_minutes: number;
  amount: number;
  status: string;
  meeting_link: string | null;
  users: {
    full_name: string | null;
  } | null;
};

function normalizeStatus(status: string) {
  return status.trim().toLowerCase().replace(/\s+/g, "_");
}

export default function ExpertOrders() {
  const [upcoming, setUpcoming] = useState<OrderRow[]>([]);
  const [past, setPast] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("bookings")
      .select(
        `
        id,
        booking_date,
        start_time,
        duration_minutes,
        amount,
        status,
        meeting_link,
        users ( full_name )
      `
      )
      .eq("expert_id", session.user.id)
      .order("booking_date", { ascending: true });

    if (error) {
      console.error("Failed to load expert orders", error);
      setLoading(false);
      return;
    }

    splitBookings(data ?? []);
    setLoading(false);
  }

  async function acceptBooking(bookingId: string) {
    try {
      setAcceptingId(bookingId);

      const res = await fetch("/api/bookings/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });

      const json = await res.json();

      if (!res.ok) {
        alert(json.error || "Failed to accept booking");
        return;
      }

      await loadOrders();
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setAcceptingId(null);
    }
  }

  function splitBookings(bookings: Booking[]) {
    const now = new Date();
    const upcomingRows: OrderRow[] = [];
    const pastRows: OrderRow[] = [];

    bookings.forEach((b) => {
      const start = new Date(`${b.booking_date}T${b.start_time}`);
      const end = new Date(
        start.getTime() + b.duration_minutes * 60 * 1000
      );

      const normalizedStatus = normalizeStatus(b.status);

      const joinEnabled =
        normalizedStatus === "confirmed" &&
        !!b.meeting_link &&
        now >= new Date(start.getTime() - 5 * 60 * 1000) &&
        now <= end;

      const row: OrderRow = {
        id: b.id,
        name: b.users?.full_name ?? "Customer",
        dateTime: start.toLocaleString(),
        duration: b.duration_minutes,
        amount: b.amount,
        status: normalizedStatus,
        joinEnabled,
        meetingLink: b.meeting_link ?? undefined,
        actions:
          normalizedStatus === "pending_confirmation" ? (
            <div className="flex gap-2">
              <button
                disabled={acceptingId === b.id}
                onClick={() => acceptBooking(b.id)}
                className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {acceptingId === b.id ? "Accepting…" : "Accept"}
              </button>

              <button
                onClick={async () => {
                  await supabase
                    .from("bookings")
                    .update({ status: "cancelled" })
                    .eq("id", b.id);
                  loadOrders();
                }}
                className="rounded-md bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          ) : (
            "—"
          ),
      };

      if (start >= now) upcomingRows.push(row);
      else pastRows.push(row);
    });

    setUpcoming(upcomingRows);
    setPast(pastRows);
  }

  if (loading) {
    return (
      <div className="rounded-xl bg-white p-6 text-sm text-gray-500">
        Loading incoming requests…
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold">Incoming Requests</h1>

      <section>
        <h2 className="mb-3 font-medium">Upcoming Sessions</h2>
        <OrdersTable rows={upcoming} nameLabel="Customer" />
      </section>

      <section>
        <h2 className="mb-3 font-medium">Past Sessions</h2>
        <OrdersTable rows={past} nameLabel="Customer" />
      </section>
    </div>
  );
}
