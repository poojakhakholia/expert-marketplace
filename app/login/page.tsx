"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Check your email for login link");
    }
  };

  return (
    <main style={{ padding: 40 }}>
      <h1>Login</h1>

      <input
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ padding: 10, marginTop: 10, display: "block" }}
      />

      <button onClick={signIn} style={{ marginTop: 15, padding: "10px 20px" }}>
        Continue
      </button>

      {message && <p style={{ marginTop: 10 }}>{message}</p>}
    </main>
  );
}
