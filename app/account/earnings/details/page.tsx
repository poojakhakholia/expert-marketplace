"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

/* ---------------- Types ---------------- */

type EarningsRow = {
  order_code: string | null;
  buyer_name: string | null;

  gross_earning: number;
  cancellation_amount: number;
  rejection_amount: number;
  no_show_amount: number;
  intella_fee: number;
  pg_fee: number;

  status?: string;
  host_joined_at?: string | null;
  session_end_at?: string | null;
  is_disputed?: boolean;
};

/* ---------------- Helpers ---------------- */

const formatINR = (n: number) =>
  `₹${n.toLocaleString("en-IN")}`;

const isExpertNoShow = (r: EarningsRow) =>
  r.status === "confirmed" &&
  !r.host_joined_at &&
  !!r.session_end_at &&
  new Date(r.session_end_at).getTime() < Date.now();

const getWithdrawableStatus = (r: EarningsRow) => {
  if (r.status === "cancelled" || r.status === "rejected") {
    return "Not applicable";
  }

  if (isExpertNoShow(r)) {
    return "Not applicable";
  }

  if (r.is_disputed) {
    return "On hold";
  }

  if (!r.session_end_at) {
    return "Not yet";
  }

  const sessionEnd = new Date(r.session_end_at).getTime();
  const now = Date.now();
  const coolingMs = 48 * 60 * 60 * 1000;

  return now - sessionEnd >= coolingMs ? "Yes" : "Not yet";
};

/* ---------------- Page ---------------- */

export default function EarningsDetailsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<EarningsRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      /* 1️⃣ Earnings view */
      const { data: earnings, error } = await supabase
        .from("expert_earnings_details")
        .select(`
          order_code,
          buyer_name,
          gross_earning,
          cancellation_amount,
          rejection_amount,
          no_show_amount,
          intella_fee,
          pg_fee
        `)
        .eq("expert_id", session.user.id)
        .order("order_code", { ascending: false });

      if (error || !earnings) {
        console.error("Failed to load earnings details", error);
        setLoading(false);
        return;
      }

      /* 2️⃣ Booking state + buyer fallback */
      const { data: bookings } = await supabase
        .from("bookings")
        .select(`
          order_code,
          status,
          host_joined_at,
          session_end_at,
          is_disputed,
          users ( full_name )
        `)
        .eq("expert_id", session.user.id);

      const bookingMap = new Map(
        (bookings ?? []).map((b) => [
          b.order_code,
          {
            status: b.status,
            host_joined_at: b.host_joined_at,
            session_end_at: b.session_end_at,
            is_disputed: b.is_disputed,
            buyer_name: b.users?.full_name ?? null,
          },
        ])
      );

      /* 3️⃣ Merge safely */
      const merged: EarningsRow[] = earnings.map((r) => {
        const b = bookingMap.get(r.order_code ?? "");
        return {
          ...r,
          status: b?.status,
          host_joined_at: b?.host_joined_at,
          session_end_at: b?.session_end_at,
          is_disputed: b?.is_disputed,
          buyer_name:
            r.buyer_name ??
            b?.buyer_name ??
            "Buyer",
        };
      });

      setRows(merged);
      setLoading(false);
    };

    load();
  }, []);

  /* ---------------- Totals ---------------- */

  const totals = rows.reduce(
    (acc, r) => {
      const noShow = isExpertNoShow(r);

      acc.gross += r.gross_earning;
      acc.cancellation += r.cancellation_amount;
      acc.rejection += r.rejection_amount;
      acc.noShow += noShow ? r.gross_earning : 0;
      acc.intellaFee += noShow ? 0 : r.intella_fee;
      acc.pgFee += noShow ? 0 : r.pg_fee;

      return acc;
    },
    {
      gross: 0,
      cancellation: 0,
      rejection: 0,
      noShow: 0,
      intellaFee: 0,
      pgFee: 0,
    }
  );

  const totalExpenses =
    totals.cancellation +
    totals.rejection +
    totals.noShow +
    totals.intellaFee +
    totals.pgFee;

  if (loading) {
    return (
      <div className="text-sm text-gray-500">
        Loading earnings details…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Earnings & Expenses Details
          </h1>
          <p className="text-sm text-gray-500">
            Booking-wise breakdown of your earnings and expenses
          </p>
        </div>

        <button
          onClick={() => router.back()}
          className="text-sm text-gray-600 hover:underline"
        >
          ← Back
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-orange-600 font-medium">
            <tr>
              <th className="px-3 py-2 text-left">Order Code</th>
              <th className="px-3 py-2 text-left">Buyer</th>
              <th className="px-3 py-2 text-right">Gross</th>
              <th className="px-3 py-2 text-right">Cancellation</th>
              <th className="px-3 py-2 text-right">Rejection</th>
              <th className="px-3 py-2 text-right">No-show</th>
              <th className="px-3 py-2 text-right">Intella Fee</th>
              <th className="px-3 py-2 text-right">PG Fee</th>
              <th className="px-3 py-2 text-right">Total Expenses</th>
              <th className="px-3 py-2 text-center">Withdrawable</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r, i) => {
              const noShow = isExpertNoShow(r);

              const rowExpenses =
                r.cancellation_amount +
                r.rejection_amount +
                (noShow ? r.gross_earning : 0) +
                (noShow ? 0 : r.intella_fee) +
                (noShow ? 0 : r.pg_fee);

              return (
                <tr key={i} className="border-t">
                  <td className="px-3 py-2">{r.order_code ?? "—"}</td>
                  <td className="px-3 py-2">{r.buyer_name ?? "—"}</td>
                  <td className="px-3 py-2 text-right">
                    {formatINR(r.gross_earning)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {formatINR(r.cancellation_amount)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {formatINR(r.rejection_amount)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {formatINR(noShow ? r.gross_earning : 0)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {formatINR(noShow ? 0 : r.intella_fee)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {formatINR(noShow ? 0 : r.pg_fee)}
                  </td>
                  <td className="px-3 py-2 text-right font-medium">
                    {formatINR(rowExpenses)}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {getWithdrawableStatus(r)}
                  </td>
                </tr>
              );
            })}
          </tbody>

          <tfoot className="border-t bg-gray-100 font-semibold">
            <tr>
              <td className="px-3 py-2" colSpan={2}>
                TOTAL
              </td>
              <td className="px-3 py-2 text-right">
                {formatINR(totals.gross)}
              </td>
              <td className="px-3 py-2 text-right">
                {formatINR(totals.cancellation)}
              </td>
              <td className="px-3 py-2 text-right">
                {formatINR(totals.rejection)}
              </td>
              <td className="px-3 py-2 text-right">
                {formatINR(totals.noShow)}
              </td>
              <td className="px-3 py-2 text-right">
                {formatINR(totals.intellaFee)}
              </td>
              <td className="px-3 py-2 text-right">
                {formatINR(totals.pgFee)}
              </td>
              <td className="px-3 py-2 text-right">
                {formatINR(totalExpenses)}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="text-xs text-gray-500">
        * Earnings from a booking become withdrawable 48 hours after the session
        end time, provided there is no dispute.
      </p>
    </div>
  );
}
