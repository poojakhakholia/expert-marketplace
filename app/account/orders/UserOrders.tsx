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
  expert_profiles: {
    full_name: string | null;
  } | null;
};

export default function UserOrders() {
  const [upcoming, setUpcoming] = useState<OrderRow[]>([]);
  const [past, setPast] = useState<OrderRow[]>([]);
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

    const { data, error } = await supabase
      .from("bookings")
      .select(`
        id,
        booking_date,
        start_time,
        duration_minutes,
        amount,
        status,
        expert_profiles (
          full_name
        )
      `)
      .eq("user_id", session.user.id)
      .order("booking_date", { ascending: true });

    if (error || !data) {
      console.error(error);
      setLoading(false);
      return;
    }

    const now = new Date();
    const upcomingRows: OrderRow[] = [];
    const pastRows: OrderRow[] = [];

    data.forEach((b: Booking) => {
      const start = new Date(`${b.booking_date}T${b.start_time}`);
      const end = new Date(
        start.getTime() + b.duration_minutes * 60 * 1000
      );

      const joinEnabled =
        b.status === "confirmed" &&
        now >= new Date(start.getTime() - 5 * 60 * 1000) &&
        now <= end;

      const row: OrderRow = {
        id: b.id,
        name: b.expert_profiles?.full_name ?? "Expert",
        dateTime: start.toLocaleString(),
        duration: b.duration_minutes,
        amount: b.amount,
        status: b.status,
        joinEnabled,
      };

      if (end >= now) {
        upcomingRows.push(row);
      } else {
        pastRows.push(row);
      }
    });

    setUpcoming(upcomingRows);
    setPast(pastRows);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 text-sm text-gray-500">
        Loading sessions…
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6">
      <h1 className="text-xl font-semibold mb-6">My Sessions</h1>

      <h2 className="font-medium mb-3">Upcoming Sessions</h2>
      <OrdersTable rows={upcoming} nameLabel="Expert" />

      <h2 className="font-medium mt-8 mb-3">Past Sessions</h2>
      <OrdersTable rows={past} nameLabel="Expert" />
    </div>
  );
}
