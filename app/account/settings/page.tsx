"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [processing, setProcessing] = useState(false);

  const [notifySessionRequest, setNotifySessionRequest] = useState(true);
  const [notifySessionConfirmed, setNotifySessionConfirmed] = useState(true);
  const [savingNotifications, setSavingNotifications] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      setUser(user);

      // 🔹 Fetch notification preferences from public.users
      const { data: profile } = await supabase
        .from("users")
        .select("notify_session_request, notify_session_confirmed")
        .eq("id", user.id)
        .single();

      if (profile) {
        setNotifySessionRequest(profile.notify_session_request ?? true);
        setNotifySessionConfirmed(profile.notify_session_confirmed ?? true);
      }

      setLoading(false);
    };

    loadUser();
  }, [router]);

  const handleNotificationUpdate = async (
    field: "notify_session_request" | "notify_session_confirmed",
    value: boolean
  ) => {
    if (!user) return;

    setSavingNotifications(true);

    await supabase
      .from("users")
      .update({ [field]: value })
      .eq("id", user.id);

    setSavingNotifications(false);
  };

  const handleDeactivate = async () => {
    const confirmDeactivate = window.confirm(
      "Are you sure you want to deactivate your account?\n\nYou can reactivate anytime by logging in again."
    );

    if (!confirmDeactivate) return;

    setProcessing(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase
      .from("users")
      .update({
        is_active: false,
        deactivated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    await supabase.auth.signOut();
    router.replace("/");
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white py-10 px-6">
      <div className="mx-auto max-w-3xl space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Settings
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage your account preferences.
          </p>
        </div>

        {/* Profile Card */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-medium text-slate-900">
            Profile Information
          </h2>

          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm text-slate-600">
                Name
              </label>
              <input
                value={user?.user_metadata?.name || ""}
                disabled
                className="mt-1 w-full rounded-lg border bg-slate-50 px-4 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-600">
                Email
              </label>
              <input
                value={user?.email || ""}
                disabled
                className="mt-1 w-full rounded-lg border bg-slate-50 px-4 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-medium text-slate-900">
            Notifications
          </h2>

          <div className="mt-6 space-y-6">

            {/* Session Request Email (Host) */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-900">
                  New Session Requests
                </div>
                <div className="text-sm text-slate-600">
                  Receive an email when someone books a session with you.
                </div>
              </div>

              <button
                onClick={async () => {
                  const newValue = !notifySessionRequest;
                  setNotifySessionRequest(newValue);
                  await handleNotificationUpdate(
                    "notify_session_request",
                    newValue
                  );
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  notifySessionRequest
                    ? "bg-orange-600"
                    : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    notifySessionRequest
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Session Confirmed Email (User) */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-900">
                  Session Confirmations
                </div>
                <div className="text-sm text-slate-600">
                  Receive an email when your session is confirmed.
                </div>
              </div>

              <button
                onClick={async () => {
                  const newValue = !notifySessionConfirmed;
                  setNotifySessionConfirmed(newValue);
                  await handleNotificationUpdate(
                    "notify_session_confirmed",
                    newValue
                  );
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  notifySessionConfirmed
                    ? "bg-orange-600"
                    : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    notifySessionConfirmed
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>

          </div>

          {savingNotifications && (
            <div className="mt-4 text-xs text-slate-500">
              Saving preferences...
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-medium text-red-600">
            Danger Zone
          </h2>

          <p className="mt-3 text-sm text-slate-600">
            Deactivating your account will hide your profile and prevent new activity.
            You can reactivate anytime by logging in again.
          </p>

          <button
            onClick={handleDeactivate}
            disabled={processing}
            className="mt-5 rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-orange-700 transition disabled:opacity-50"
          >
            {processing ? "Processing..." : "Deactivate Account"}
          </button>
        </div>

      </div>
    </div>
  );
}
