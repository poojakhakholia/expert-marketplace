"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

/* ---------------- Types ---------------- */

type WithdrawalRow = {
  id: string;
  amount: number;
  upi_id: string | null;
  reference_id: string | null;
  status: "pending" | "processing" | "paid" | "rejected";
  created_at: string;
  paid_at: string | null;
};

/* ---------------- Helpers ---------------- */

const formatINR = (n: number) =>
  `₹${n.toLocaleString("en-IN")}`;

const formatDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("en-IN") : "—";

/* ---------------- Page ---------------- */

export default function WithdrawalHistoryPage() {
  const router = useRouter();
  const [rows, setRows] = useState<WithdrawalRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      const { data, error } = await supabase
        .from("expert_withdrawals")
        .select(`
          id,
          amount,
          upi_id,
          reference_id,
          status,
          created_at,
          paid_at
        `)
        .eq("expert_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to load withdrawals", error);
        setLoading(false);
        return;
      }

      setRows(data ?? []);
      setLoading(false);
    };

    load();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Withdrawal History
          </h1>
          <p className="text-sm text-gray-500">
            Track all your withdrawal requests and payments
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
          <thead className="bg-orange-50 text-orange-700">
            <tr>
              <th className="px-3 py-2 text-left">Requested On</th>
              <th className="px-3 py-2 text-right">Amount</th>
              <th className="px-3 py-2 text-left">UPI ID</th>
              <th className="px-3 py-2 text-left">Reference ID</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Paid On</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-6 text-center text-gray-500"
                >
                  Loading withdrawal history…
                </td>
              </tr>
            )}

            {!loading && rows.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-6 text-center text-gray-500"
                >
                  No withdrawal requests yet
                </td>
              </tr>
            )}

            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-3 py-2">
                  {formatDate(r.created_at)}
                </td>

                <td className="px-3 py-2 text-right font-medium">
                  {formatINR(r.amount)}
                </td>

                <td className="px-3 py-2">
                  {r.upi_id ?? "—"}
                </td>

                <td className="px-3 py-2">
                  {r.reference_id ?? "—"}
                </td>

                <td className="px-3 py-2">
                  <StatusPill status={r.status} />
                </td>

                <td className="px-3 py-2">
                  {formatDate(r.paid_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------- Components ---------------- */

function StatusPill({
  status,
}: {
  status: WithdrawalRow["status"];
}) {
  const map = {
    pending: "bg-yellow-100 text-yellow-700",
    processing: "bg-blue-100 text-blue-700",
    paid: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${map[status]}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
