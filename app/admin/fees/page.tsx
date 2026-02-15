"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

/* ---------------- Types ---------------- */

type PlatformFeeConfig = {
  id: string;
  fee_percent: number;
  min_fee: number;
  currency: string;
  is_active: boolean;
};

/* ---------------- Page ---------------- */

export default function PlatformFeeConfigPage() {
  const [config, setConfig] = useState<PlatformFeeConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [feePercent, setFeePercent] = useState("");
  const [minFee, setMinFee] = useState("");

  const load = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("platform_fee_config")
      .select(`
        id,
        fee_percent,
        min_fee,
        currency,
        is_active
      `)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      console.error("Failed to load platform fee config", error);
      setLoading(false);
      return;
    }

    if (data) {
      setConfig(data);
      setFeePercent(String(data.fee_percent));
      setMinFee(String(data.min_fee));
    }

    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!feePercent || !minFee) {
      alert("All fields are required");
      return;
    }

    setSaving(true);

    // Deactivate existing config
    if (config) {
      await supabase
        .from("platform_fee_config")
        .update({ is_active: false })
        .eq("id", config.id);
    }

    // Insert new active config
    const { error } = await supabase
      .from("platform_fee_config")
      .insert({
        fee_percent: Number(feePercent),
        min_fee: Number(minFee),
        currency: "INR",
        is_active: true,
      });

    if (error) {
      console.error("Failed to save platform fee config", error);
      alert(error.message);
      setSaving(false);
      return;
    }

    await load();
    setSaving(false);
    alert("Platform fee configuration updated");
  };

  /* ---------------- Render ---------------- */

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Platform Fee Configuration
        </h1>
        <p className="text-sm text-gray-500">
          Configure Intella platform fees applied to expert earnings.
        </p>
      </div>

      {loading && (
        <div className="text-sm text-gray-500">
          Loading configuration…
        </div>
      )}

      {!loading && (
        <div className="rounded-lg border bg-white p-6 space-y-4">
          <div>
            <label className="text-sm text-gray-600">
              Platform Fee (%)
            </label>
            <input
              type="number"
              value={feePercent}
              onChange={(e) => setFeePercent(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">
              Minimum Fee (₹)
            </label>
            <input
              type="number"
              value={minFee}
              onChange={(e) => setMinFee(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              disabled={saving}
              onClick={save}
              className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:bg-gray-400"
            >
              {saving ? "Saving…" : "Save Configuration"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
