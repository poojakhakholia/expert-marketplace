"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function OrdersPage() {
  const router = useRouter();

  useEffect(() => {
    resolveRedirect();
  }, []);

  async function resolveRedirect() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) return;

    // Check if user has an expert profile
    const { data: expertProfile } = await supabase
      .from("expert_profiles")
      .select("id")
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (expertProfile) {
      // Expert default → orders received
      router.replace("/account/orders/received");
    } else {
      // Normal user → orders placed
      router.replace("/account/orders/placed");
    }
  }

  return (
    <div className="bg-white rounded-xl p-6 text-sm text-gray-500">
      Loading orders…
    </div>
  );
}
