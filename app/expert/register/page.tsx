"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { supabase } from "../../../lib/supabase";

export default function ExpertRegister() {
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [msg, setMsg] = useState("");

  const submit = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMsg("Please login first");
      return;
    }

    const { error } = await supabase.from("expert_profiles").insert({
      user_id: user.id,
      headline,
      bio,
      fee_15: 499,
      fee_30: 999,
      fee_60: 1799,
    });

    if (error) setMsg(error.message);
    else setMsg("Profile submitted. Await admin approval.");
  };

  return (
    <main style={{ padding: 40 }}>
      <h1>Become an Expert</h1>

      <input
        placeholder="Headline"
        onChange={(e) => setHeadline(e.target.value)}
        style={{ display: "block", marginBottom: 10 }}
      />

      <textarea
        placeholder="Bio"
        onChange={(e) => setBio(e.target.value)}
        style={{ display: "block", marginBottom: 10 }}
      />

      <button onClick={submit}>Submit</button>
      {msg && <p>{msg}</p>}
    </main>
  );
}
