"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function BecomeAProLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    // 1️⃣ Check session AFTER Supabase finishes restoring it
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (!session) {
        router.replace("/login?redirect=/become-a-pro/step-1-basic");
      } else {
        setReady(true);
      }
    };

    // 2️⃣ Listen for auth completion (OAuth redirect)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setReady(true);
      }
    });

    checkSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  // ⛔ Block render until auth is fully resolved
  if (!ready) return null;

  return <>{children}</>;
}
