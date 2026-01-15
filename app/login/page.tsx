"use client";

export const dynamic = "force-dynamic";

import { supabase } from "../../lib/supabase";

export default function Login() {
  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  };

  return (
    <main style={{ padding: 40 }}>
      <h1>Login</h1>

      <button
        onClick={loginWithGoogle}
        style={{
          marginTop: 20,
          padding: "10px 20px",
          border: "1px solid #ccc",
          borderRadius: 6,
        }}
      >
        Continue with Google
      </button>

      <p style={{ marginTop: 20, color: "#666" }}>
        We only use your email to create your account.
      </p>
    </main>
  );
}
