"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

/* ---------------- Types ---------------- */

type ProcessedWithdrawal = {
  id: string;
  expert_id: string;
  expert_email: string;
  amount: number;
  upi_id: string;
  payout_method: string;
  payout_reference: string;
  processed_at: string;
  processed_by: string;
};

/* ---------------- Helpers ---------------- */

const formatINR = (n: number) =>
  `₹${n.toLocaleString("en-IN")}`;

const formatDateTime = (d: string) =>
  new Date(d).toLocaleString("en-IN");

/* ---------------- Page ---------------- */

export default function ProcessedWithdrawalsPage() {
  const [rows, setRows] = useState<ProcessedWithdrawal[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("expert_withdrawals")
      .select(`
        id,
        expert_id,
        expert_email,
        amount,
        upi_id,
        payout_method,
        payout_reference,
        processed_at,
        processed_by
      `)
      .eq("status", "processed")
      .order("processed_at", { ascending: false });

    if (error) {
      console.error("Failed to load processed withdrawals", error);
      setLoading(false);
      return;
    }

    setRows(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  /* ---------------- Render ---------------- */

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Processed Withdrawals
        </h1>
        <p className="text-sm text-gray-500">
          Completed expert payouts (read-only).
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-emerald-50 text-emerald-700">
            <tr>
              <th className="px-3 py-2 text-left">Paid On</th>
              <th className="px-3 py-2 text-left">Expert</th>
              <th className="px-3 py-2 text-right">Amount</th>
              <th className="px-3 py-2 text-left">UPI</th>
              <th className="px-3 py-2 text-left">Method</th>
              <th className="px-3 py-2 text-left">Reference</th>
              <th className="px-3 py-2 text-left">Processed By</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-6 text-center text-gray-500"
                >
                  Loading processed withdrawals…
                </td>
              </tr>
            )}

            {!loading && rows.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-6 text-center text-gray-500"
                >
                  No processed withdrawals yet
                </td>
              </tr>
            )}

            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-3 py-2">
                  {formatDateTime(r.processed_at)}
                </td>

                <td className="px-3 py-2">
                  <div className="font-medium">
                    {r.expert_email}
                  </div>
                  <div className="text-xs text-gray-400">
                    {r.expert_id}
                  </div>
                </td>

                <td className="px-3 py-2 text-right font-medium">
                  {formatINR(r.amount)}
                </td>

                <td className="px-3 py-2">
                  {r.upi_id}
                </td>

                <td className="px-3 py-2">
                  {r.payout_method}
                </td>

                <td className="px-3 py-2 font-mono text-xs">
                  {r.payout_reference}
                </td>

                <td className="px-3 py-2 text-xs text-gray-500">
                  {r.processed_by}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
