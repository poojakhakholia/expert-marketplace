"use client";

import { supabase } from "@/lib/supabase";

export default async function Experts() {
  const { data } = await supabase
    .from("expert_profiles")
    .select("*")
    .eq("approval_status", "approved");

  return (
    <main style={{ padding: 40 }}>
      <h1>Experts</h1>

      {data?.map((expert) => (
        <div key={expert.user_id} style={{ marginBottom: 20 }}>
          <h3>{expert.headline}</h3>
          <p>{expert.bio}</p>
          <a href={`/experts/${expert.user_id}`}>View Profile</a>
        </div>
      ))}
    </main>
  );
}
