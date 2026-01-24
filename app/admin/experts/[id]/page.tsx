'use client'

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";
import ApproveRejectActions from "./review-actions";

export default function ExpertReviewPage({
  params,
}: {
  params: { id: string };
}) {
  const [expert, setExpert] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadExpert = async () => {
      const { data, error } = await supabase
        .from("expert_profiles")
        .select("*")
        .eq("user_id", params.id)
        .single();

      if (!error) setExpert(data);
      setLoading(false);
    };

    loadExpert();
  }, [params.id]);

  if (loading) {
    return <div className="p-8">Loading expert…</div>;
  }

  if (!expert) {
    return <div className="p-8">Expert not found</div>;
  }

  return (
    <div className="p-8 grid grid-cols-3 gap-6">
      {/* LEFT */}
      <div className="col-span-2 space-y-4">
        <h1 className="text-xl font-semibold">{expert.full_name}</h1>

        <textarea
          defaultValue={expert.bio}
          className="w-full border p-3"
          rows={6}
          readOnly
        />

        <div className="grid grid-cols-4 gap-4">
          <div>15m: ₹{expert.fee_15}</div>
          <div>30m: ₹{expert.fee_30}</div>
          <div>45m: ₹{expert.fee_45}</div>
          <div>60m: ₹{expert.fee_60}</div>
        </div>
      </div>

      {/* RIGHT */}
      <ApproveRejectActions expertId={expert.user_id} />
    </div>
  );
}
