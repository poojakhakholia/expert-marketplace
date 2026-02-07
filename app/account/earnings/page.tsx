"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

/* ---------------- Types ---------------- */

type EarningsSummary = {
  gross_earnings: number;
  total_expenses: number;
  net_earnings: number;
  earning_not_matured: number;
  withdrawn: number;
  available_to_withdraw: number;
};

/* ---------------- Helpers ---------------- */

const formatINR = (amount: number) =>
  `₹${amount.toLocaleString("en-IN")}`;

const isValidUpi = (upi: string) => {
  if (!upi) return false;
  if (!upi.includes("@")) return false;
  if (upi.startsWith("@") || upi.endsWith("@")) return false;
  if (upi.length < 5) return false;
  return true;
};

/* ---------------- Page ---------------- */

export default function EarningsPage() {
  const [summary, setSummary] =
    useState<EarningsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const [showWithdrawModal, setShowWithdrawModal] =
    useState(false);
  const [withdrawAmount, setWithdrawAmount] =
    useState(0);
  const [upiId, setUpiId] = useState("");
  const [upiError, setUpiError] = useState("");

  useEffect(() => {
    const load = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("expert_earnings_summary")
        .select(`
          gross_earnings,
          total_expenses,
          net_earnings,
          earning_not_matured,
          withdrawn,
          available_to_withdraw
        `)
        .eq("expert_id", session.user.id)
        .single();

      if (error) {
        console.error(
          "Failed to load earnings summary",
          error
        );
        setLoading(false);
        return;
      }

      setSummary(data);
      setWithdrawAmount(data.available_to_withdraw);
      setLoading(false);
    };

    load();
  }, []);

  const canWithdraw =
    summary?.available_to_withdraw >= 1000;

  const handleUpiChange = (val: string) => {
    setUpiId(val);
    setUpiError(
      isValidUpi(val) ? "" : "Please enter a valid UPI ID"
    );
  };

  if (loading || !summary) {
    return (
      <div className="text-sm text-gray-500">
        Loading earnings…
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Earnings
        </h1>
        <p className="text-sm text-gray-500">
          Track your earnings and request withdrawals.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <KpiCard
          label="Gross Earnings"
          value={formatINR(summary.gross_earnings)}
          icon="💰"
          accent="bg-emerald-50 border-emerald-300"
        />

        <KpiCard
          label="Total Expenses"
          value={formatINR(summary.total_expenses)}
          icon="🧾"
          accent="bg-rose-50 border-rose-300"
          tooltip="Includes cancellations, rejections, no-shows, payment gateway charges and Intella platform fee."
        />

        <KpiCard
          label="Net Earnings"
          value={formatINR(summary.net_earnings)}
          icon="📊"
          accent="bg-sky-50 border-sky-300"
        />

        <KpiCard
          label="Earnings Not Matured"
          value={formatINR(summary.earning_not_matured)}
          icon="⏳"
          accent="bg-yellow-50 border-yellow-300"
          tooltip="Earnings from confirmed sessions that are not yet withdrawable. These become available 48 hours after session end, provided there is no dispute."
        />

        <KpiCard
          label="Already Withdrawn"
          value={formatINR(summary.withdrawn)}
          icon="🏦"
          accent="bg-gray-50 border-gray-300"
        />

        <KpiCard
          label="Available to Withdraw"
          value={formatINR(summary.available_to_withdraw)}
          icon="💸"
          accent="bg-orange-50 border-orange-300"
          highlight
        />
      </div>

      {/* Details CTAs */}
      <div className="flex flex-col items-end gap-2">
        <button
          onClick={() =>
            (window.location.href =
              "/account/earnings/details")
          }
          className="text-sm font-medium text-orange-600 hover:underline"
        >
          View earnings & expenses details →
        </button>

        <button
          onClick={() =>
            (window.location.href =
              "/account/earnings/withdrawals")
          }
          className="text-sm font-medium text-orange-600 hover:underline"
        >
          View withdrawal history →
        </button>
      </div>

      {/* Withdraw CTA */}
      <div className="rounded-lg border bg-white p-5">
        <button
          disabled={!canWithdraw}
          onClick={() => setShowWithdrawModal(true)}
          className={`w-full rounded-lg px-4 py-3 text-sm font-medium transition
            ${
              canWithdraw
                ? "bg-orange-600 text-white hover:bg-orange-700"
                : "cursor-not-allowed bg-gray-200 text-gray-500"
            }
          `}
        >
          💸 Withdraw Funds
        </button>

        <p className="mt-2 text-xs text-gray-500 text-center">
          Withdrawals are enabled once your available balance
          reaches ₹1,000.
        </p>
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Withdraw Funds
            </h2>

            <div className="mt-4 space-y-4">
              <div>
                <label className="text-sm text-gray-600">
                  Amount
                </label>
                <input
                  type="number"
                  min={1000}
                  max={summary.available_to_withdraw}
                  value={withdrawAmount}
                  onChange={(e) =>
                    setWithdrawAmount(
                      Number(e.target.value)
                    )
                  }
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">
                  UPI ID
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) =>
                    handleUpiChange(e.target.value)
                  }
                  placeholder="yourname@upi"
                  className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm ${
                    upiError ? "border-red-400" : ""
                  }`}
                />
                {upiError && (
                  <p className="mt-1 text-xs text-red-500">
                    {upiError}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() =>
                  setShowWithdrawModal(false)
                }
                className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                disabled={!isValidUpi(upiId)}
                className={`rounded-lg px-4 py-2 text-sm font-medium text-white
                  ${
                    isValidUpi(upiId)
                      ? "bg-orange-600 hover:bg-orange-700"
                      : "bg-gray-300 cursor-not-allowed"
                  }
                `}
              >
                Submit Request
              </button>
            </div>

            <p className="mt-3 text-xs text-gray-500">
              Withdrawals are processed manually within
              2–3 business days.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Components ---------------- */

function KpiCard({
  label,
  value,
  icon,
  tooltip,
  accent,
  highlight,
}: {
  label: string;
  value: string;
  icon: string;
  tooltip?: string;
  accent: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-4 ${accent} ${
        highlight ? "ring-1 ring-orange-300" : ""
      }`}
    >
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span>{icon}</span>
        {label}
        {tooltip && <Tooltip text={tooltip} />}
      </div>
      <div className="mt-2 text-xl font-semibold text-gray-900">
        {value}
      </div>
    </div>
  );
}

function Tooltip({ text }: { text: string }) {
  return (
    <span className="relative group cursor-pointer text-gray-400">
      ℹ️
      <span className="absolute left-1/2 z-10 hidden w-64 -translate-x-1/2 rounded-lg border bg-white p-2 text-xs text-gray-700 shadow-md group-hover:block">
        {text}
      </span>
    </span>
  );
}
