"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type ExpirableBooking = {
  id: string;
  order_code: string | null;
  amount: number;
  booking_date: string;
  start_time: string;
  expert_profiles: {
    full_name: string | null;
  }[] | null;
};

export default function AdminExpiredBookingsJobPage() {
  const [rows, setRows] = useState<ExpirableBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<number | null>(null);

  /* ---------------- Load Preview ---------------- */

  const loadPreview = async () => {
  setLoading(true);

  const { data, error } = await supabase
    .from("bookings")
    .select(`
      id,
      order_code,
      amount,
      booking_date,
      start_time,
      expert_profiles ( full_name )
    `)
    .eq("status", "pending_confirmation");

  if (error) {
    console.error("Failed to load expirable bookings", error);
    setRows([]);
    setLoading(false);
    return;
  }

  // JS-based expiry check (preview only)
  const now = new Date();

  const expired = (data ?? []).filter((b) => {
    if (!b.booking_date || !b.start_time) return false;

    const meetingStart = new Date(
      `${b.booking_date}T${b.start_time}`
    );

    return meetingStart <= now;
  });

  setRows(expired);
  setLoading(false);
};

  /* ---------------- Run Job ---------------- */

  const runJob = async () => {
    const confirmed = window.confirm(
      "This will auto-reject all expired pending bookings.\n\nAre you sure?"
    );
    if (!confirmed) return;

    setRunning(true);
    setResult(null);

    const { data, error } = await supabase.rpc(
      "enforce_booking_expiry"
    );

    if (error) {
      alert("Failed to run expiry job");
      console.error(error);
    } else {
      setResult(data);
      await loadPreview(); // refresh remaining
    }

    setRunning(false);
  };

  /* ---------------- Derived Stats ---------------- */

  const totalAmount = rows.reduce(
    (sum, r) => sum + r.amount,
    0
  );

  /* ---------------- Render ---------------- */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Run Expired Booking Job
        </h1>
        <p className="text-sm text-gray-500">
          Auto-reject bookings where the expert did not respond
          before the meeting start time.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Expired Bookings" value={rows.length} />
        <StatCard
          label="Total Amount"
          value={`₹${totalAmount.toLocaleString("en-IN")}`}
        />
        <StatCard
          label="Last Run Result"
          value={result !== null ? result : "—"}
        />
      </div>

      {/* Action */}
      <div className="flex justify-end">
        <button
          onClick={runJob}
          disabled={running || rows.length === 0}
          className={`rounded-lg px-4 py-2 text-sm font-medium text-white
            ${
              running || rows.length === 0
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }
          `}
        >
          {running ? "Running…" : "Run Expiry Job"}
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-3 py-2 text-left">Order Code</th>
              <th className="px-3 py-2 text-left">Expert</th>
              <th className="px-3 py-2 text-right">Amount</th>
              <th className="px-3 py-2 text-left">Booking Date</th>
              <th className="px-3 py-2 text-left">Meeting Time</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-gray-500">
                  Loading…
                </td>
              </tr>
            )}

            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-gray-500">
                  No expired bookings found
                </td>
              </tr>
            )}

            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-3 py-2">{r.order_code ?? "—"}</td>
                <td className="px-3 py-2">
                  {r.expert_profiles?.[0]?.full_name ?? "—"}
                </td>
                <td className="px-3 py-2 text-right">
                  ₹{r.amount.toLocaleString("en-IN")}
                </td>
                <td className="px-3 py-2">{r.booking_date}</td>
                <td className="px-3 py-2">{r.start_time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------- Components ---------------- */

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 text-lg font-semibold text-gray-900">
        {value}
      </div>
    </div>
  );
}
