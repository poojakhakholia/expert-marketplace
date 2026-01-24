'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase";

export default function ApproveRejectActions({
  expertId,
}: {
  expertId: string;
}) {
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const updateStatus = async (status: "approved" | "rejected") => {
    setLoading(true);

    await supabase
      .from("expert_profiles")
      .update({
        approval_status: status,
        admin_comment: comment || null,
      })
      .eq("user_id", expertId);

    setLoading(false);
    router.push("/admin/experts");
  };

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <h3 className="font-medium">Admin Action</h3>

      <textarea
        placeholder="Optional admin comment"
        className="w-full border p-2 text-sm"
        rows={3}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <div className="flex gap-3">
        <button
          disabled={loading}
          onClick={() => updateStatus("approved")}
          className="flex-1 rounded bg-green-600 px-3 py-2 text-white text-sm"
        >
          Approve
        </button>

        <button
          disabled={loading}
          onClick={() => updateStatus("rejected")}
          className="flex-1 rounded bg-red-600 px-3 py-2 text-white text-sm"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
