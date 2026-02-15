"use client";

export const dynamic = "force-dynamic";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function Login() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const explicitRedirect = searchParams.get("redirect");

  useEffect(() => {
    const checkSessionAndRedirect = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return;

      const user = data.session.user;

      // ✅ Upsert user as before
      await supabase.from("users").upsert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.name ?? null,
      });

      // ✅ NEW: Check activation state
      const { data: existingUser } = await supabase
        .from("users")
        .select("is_active")
        .eq("id", user.id)
        .single();

      // If user was deactivated → auto reactivate
      if (existingUser && existingUser.is_active === false) {
        await supabase
          .from("users")
          .update({
            is_active: true,
            deactivated_at: null,
          })
          .eq("id", user.id);
      }

      // Existing redirect logic continues unchanged

      if (explicitRedirect) {
        router.replace(explicitRedirect);
        return;
      }

      if (user.user_metadata?.role === "admin") {
        router.replace("/explore");
        return;
      }

      const { data: expertProfile } = await supabase
        .from("expert_profiles")
        .select("approval_status")
        .eq("user_id", user.id)
        .single();

      const status = expertProfile?.approval_status;

      if (status === "approved" || status === "pending") {
        router.replace("/");
        return;
      }

      if (!status || status === "rejected") {
        router.replace("/become-a-pro/step-1-basic");
        return;
      }
    };

    checkSessionAndRedirect();
  }, [router, explicitRedirect]);

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: process.env.NEXT_PUBLIC_SITE_URL + "/login",
        queryParams: {
          prompt: "select_account",
        },
      },
    });
  };

  return (
    <main className="min-h-[calc(100vh-120px)] flex items-center justify-center px-6">
      <div className="w-full max-w-md text-center intella-card py-10 px-8">
        <h1 className="text-2xl font-semibold text-slate-900">
          Welcome
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Sign in to continue to Intella
        </p>

        <button
          onClick={loginWithGoogle}
          className="mt-8 w-full intella-btn-primary flex items-center justify-center gap-3"
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path
              fill="#FFC107"
              d="M43.6 20.4H42V20H24v8h11.3C33.6 32.6 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-8.9 20-20 0-1.3-.1-2.6-.4-3.6z"
            />
            <path
              fill="#FF3D00"
              d="M6.3 14.7l6.6 4.8C14.6 16 18.9 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"
            />
            <path
              fill="#4CAF50"
              d="M24 44c5.1 0 9.8-1.9 13.3-5.1l-6.1-5.2C29.1 35.6 26.7 36 24 36c-5.2 0-9.6-3.4-11.2-8.1l-6.5 5C9.5 39.6 16.3 44 24 44z"
            />
            <path
              fill="#1976D2"
              d="M43.6 20.4H42V20H24v8h11.3c-1.1 3-3.3 5.5-6.1 7.2l.1.1 6.1 5.2C36.8 39.6 44 34 44 24c0-1.3-.1-2.6-.4-3.6z"
            />
          </svg>
          Continue with Google
        </button>

        <p className="mt-3 text-xs text-slate-500">
          New to Intella? Your account will be created automatically.
        </p>

        <p className="mt-6 text-xs text-slate-500">
          We only use your name to personalize your experience.
        </p>
      </div>
    </main>
  );
}
