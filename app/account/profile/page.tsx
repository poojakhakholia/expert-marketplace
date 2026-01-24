"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type ProfileData = {
  name: string;
  email: string;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      // 1️⃣ Always available (from auth)
      const email = session.user.email || "";
      const nameFromAuth =
        session.user.user_metadata?.full_name ||
        session.user.user_metadata?.name ||
        "";

      // 2️⃣ Try fetching from users table (optional)
      const { data } = await supabase
        .from("users")
        .select("full_name")
        .eq("id", session.user.id)
        .maybeSingle();

      setProfile({
        email,
        name: data?.full_name || nameFromAuth,
      });
    };

    loadProfile();
  }, []);

  if (!profile) return null;

  return (
    <div className="max-w-xl bg-white rounded-xl p-6">
      <h1 className="text-xl font-semibold mb-6">Profile</h1>

      {/* Name */}
      <div className="mb-4">
        <label className="block text-sm text-gray-600 mb-1">
          Name
        </label>
        <input
          value={profile.name}
          disabled
          className="w-full border rounded-lg px-3 py-2 bg-gray-100 text-sm"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm text-gray-600 mb-1">
          Email
        </label>
        <input
          value={profile.email}
          disabled
          className="w-full border rounded-lg px-3 py-2 bg-gray-100 text-sm"
        />
      </div>
    </div>
  );
}
