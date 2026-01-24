'use client'

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase"; // ✅ FIXED PATH

export default function PendingExpertsPage() {
  const [experts, setExperts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadExperts = async () => {
      const { data, error } = await supabase
        .from("expert_profiles")
        .select(`
          user_id,
          full_name,
          headline,
          experience_years,
          fee_15,
          fee_30,
          fee_45,
          fee_60,
          created_at
        `)
        .eq("approval_status", "pending");

      if (!error) {
        setExperts(data ?? []);
      }

      setLoading(false);
    };

    loadExperts();
  }, []);

  if (loading) {
    return <div className="p-8">Loading experts...</div>;
  }

  if (!experts.length) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-semibold mb-6">
          Pending Expert Approvals
        </h1>
        <p className="text-gray-500">No pending experts</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">
        Pending Expert Approvals
      </h1>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Name</th>
            <th>Experience</th>
            <th>Pricing</th>
            <th>Submitted</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {experts.map((e) => (
            <tr key={e.user_id} className="border-t">
              <td className="p-2">
                <div className="font-medium">{e.full_name}</div>
                <div className="text-sm text-gray-500">{e.headline}</div>
              </td>
              <td className="text-center">{e.experience_years} yrs</td>
              <td className="text-center text-sm">
                {[15, 30, 45, 60]
                  .filter(
                    (d) =>
                      e[`fee_${d}` as keyof typeof e] !== null
                  )
                  .join(" / ")}
              </td>
              <td className="text-center text-sm">
                {new Date(e.created_at).toLocaleDateString()}
              </td>
              <td className="text-center">
                <Link
                  href={`/admin/experts/${e.user_id}`}
                  className="text-blue-600 underline"
                >
                  Review →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
