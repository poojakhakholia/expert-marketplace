"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

/* ---------------- Types ---------------- */

type Withdrawal = {
  id: string;
  expert_id: string;
  expert_email: string;
  amount: number;
  upi_id: string;
  status: "requested" | "processing" | "processed" | "rejected" | "failed";
  admin_reference: string | null;
  requested_at: string;
  processed_at: string | null;
};

/* ---------------- Helpers ---------------- */

const formatINR = (n: number) =>
  `₹${n.toLocaleString("en-IN")}`;

const formatDate = (d: string | null) =>
  d ? new Date(d).toLocaleString("en-IN") : "—";

/* ---------------- Page ---------------- */

export default function AdminWithdrawalsPage() {
  const [rows, setRows] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [showPaidModal, setShowPaidModal] = useState(false);
  const [activeRow, setActiveRow] = useState<Withdrawal | null>(null);
  const [payoutMethod, setPayoutMethod] = useState("");
  const [payoutRef, setPayoutRef] = useState("");

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
        status,
        admin_reference,
        requested_at,
        processed_at
      `)
      .order("requested_at", { ascending: false });

    if (error) {
      console.error("Failed to load withdrawals", error);
      setLoading(false);
      return;
    }

    setRows(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  /* ---------------- Actions ---------------- */

  const approve = async (id: string) => {
    setActionLoading(id);

    await supabase
      .from("expert_withdrawals")
      .update({ status: "processing" })
      .eq("id", id)
      .eq("status", "requested");

    await load();
    setActionLoading(null);
  };

  const reject = async (id: string) => {
    const reason = prompt("Reason for rejection?");
    if (!reason) return;

    setActionLoading(id);

    await supabase
      .from("expert_withdrawals")
      .update({
        status: "rejected",
        admin_reference: reason,
      })
      .eq("id", id)
      .in("status", ["requested", "processing"]);

    await load();
    setActionLoading(null);
  };

  const openPaidModal = (row: Withdrawal) => {
    setActiveRow(row);
    setPayoutMethod("");
    setPayoutRef("");
    setShowPaidModal(true);
  };

  const submitPaid = async () => {
    if (!activeRow) return;
    if (!payoutMethod || !payoutRef) {
      alert("Please enter payout method and reference");
      return;
    }

    setActionLoading(activeRow.id);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    await supabase
      .from("expert_withdrawals")
      .update({
        status: "processed",
        payout_method: payoutMethod,
        payout_reference: payoutRef,
        processed_at: new Date().toISOString(),
        processed_by: session?.user.id,
        admin_reference: payoutRef,
      })
      .eq("id", activeRow.id)
      .eq("status", "processing");

    setShowPaidModal(false);
    setActiveRow(null);
    setActionLoading(null);

    await load();
  };

  /* ---------------- Render ---------------- */

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Withdrawal Requests
        </h1>
        <p className="text-sm text-gray-500">
          Review, approve and process expert withdrawals.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-orange-50 text-orange-700">
            <tr>
              <th className="px-3 py-2 text-left">Requested</th>
              <th className="px-3 py-2 text-left">Expert</th>
              <th className="px-3 py-2 text-right">Amount</th>
              <th className="px-3 py-2 text-left">UPI</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-gray-500">
                  Loading…
                </td>
              </tr>
            )}

            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-gray-500">
                  No withdrawal requests
                </td>
              </tr>
            )}

            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-3 py-2">{formatDate(r.requested_at)}</td>

                <td className="px-3 py-2">
                  <div className="font-medium">{r.expert_email}</div>
                  <div className="text-xs text-gray-400">{r.expert_id}</div>
                </td>

                <td className="px-3 py-2 text-right font-medium">
                  {formatINR(r.amount)}
                </td>

                <td className="px-3 py-2">{r.upi_id}</td>

                <td className="px-3 py-2">
                  <StatusPill status={r.status} />
                </td>

                <td className="px-3 py-2">
                  <Actions
                    row={r}
                    loading={actionLoading === r.id}
                    onApprove={() => approve(r.id)}
                    onReject={() => reject(r.id)}
                    onMarkPaid={() => openPaidModal(r)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---------------- Paid Modal ---------------- */}
      {showPaidModal && activeRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="text-lg font-semibold">Mark as Paid</h2>

            <p className="mt-1 text-sm text-gray-500">
              Paying <b>{formatINR(activeRow.amount)}</b> to{" "}
              <b>{activeRow.expert_email}</b>
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="text-sm text-gray-600">
                  Payout Method
                </label>
                <input
                  value={payoutMethod}
                  onChange={(e) => setPayoutMethod(e.target.value)}
                  placeholder="UPI / Bank Transfer"
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">
                  Reference / UTR
                </label>
                <input
                  value={payoutRef}
                  onChange={(e) => setPayoutRef(e.target.value)}
                  placeholder="Transaction reference"
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowPaidModal(false)}
                className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={submitPaid}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
              >
                Confirm Paid
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Components ---------------- */

function StatusPill({ status }: { status: Withdrawal["status"] }) {
  const map: Record<string, string> = {
    requested: "bg-yellow-100 text-yellow-700",
    processing: "bg-blue-100 text-blue-700",
    processed: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700",
    failed: "bg-gray-100 text-gray-600",
  };

  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${map[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function Actions({
  row,
  loading,
  onApprove,
  onReject,
  onMarkPaid,
}: {
  row: Withdrawal;
  loading: boolean;
  onApprove: () => void;
  onReject: () => void;
  onMarkPaid: () => void;
}) {
  if (row.status === "requested") {
    return (
      <div className="flex gap-2">
        <button
          disabled={loading}
          onClick={onApprove}
          className="text-xs rounded bg-blue-600 px-2 py-1 text-white"
        >
          Approve
        </button>
        <button
          disabled={loading}
          onClick={onReject}
          className="text-xs rounded bg-red-600 px-2 py-1 text-white"
        >
          Reject
        </button>
      </div>
    );
  }

  if (row.status === "processing") {
    return (
      <div className="flex gap-2">
        <button
          disabled={loading}
          onClick={onMarkPaid}
          className="text-xs rounded bg-emerald-600 px-2 py-1 text-white"
        >
          Mark Paid
        </button>
        <button
          disabled={loading}
          onClick={onReject}
          className="text-xs rounded bg-red-600 px-2 py-1 text-white"
        >
          Reject
        </button>
      </div>
    );
  }

  return <span className="text-xs text-gray-400">—</span>;
}
