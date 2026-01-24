"use client";

export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // where to go after login
  const redirectTo = searchParams.get("redirect") || "/";

  useEffect(() => {
    const checkSessionAndUpsertUser = async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session) return;

      const user = data.session.user;

      // 🔹 STEP 2: persist name safely
      await supabase
        .from("users")
        .upsert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.name ?? null,
        });

      // redirect after everything is done
      router.replace(redirectTo);
    };

    checkSessionAndUpsertUser();
  }, [router, redirectTo]);

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}${redirectTo}`,
        queryParams: {
          prompt: "select_account",
        },
      },
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
          cursor: "pointer",
        }}
      >
        Continue with Google
      </button>

      <p style={{ marginTop: 20, color: "#666" }}>
        We only use your name to personalize your experience.
      </p>
    </main>
  );
}
