"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type ExpertStatus = "none" | "pending" | "approved" | "rejected";

/* ---------- Inline Icons (unchanged) ---------- */

const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8V22h19.2v-2.8c0-3.2-6.4-4.8-9.6-4.8z" />
  </svg>
);

const IconOrders = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 4h18v2H3V4zm2 4h14l-1.5 12h-11L5 8z" />
  </svg>
);

const IconInbox = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3H4.99C3.89 3 3 3.89 3 4.99v14.02C3 20.1 3.89 21 4.99 21H19c1.1 0 2-.9 2-1.99V4.99C21 3.89 20.1 3 19 3zm0 12h-4l-2 3h-2l-2-3H5V5h14v10z" />
  </svg>
);

const IconSparkle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l2.4 6.4L21 11l-6.6 2.6L12 20l-2.4-6.4L3 11l6.6-2.6L12 2z" />
  </svg>
);

const IconEdit = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25zM20.7 7.04c.4-.4.4-1.03 0-1.42l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.82z" />
  </svg>
);

const IconEye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 5c-7 0-11 7-11 7s4 7 11 7 11-7 11-7-4-7-11-7zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8z" />
  </svg>
);

const IconLogout = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 13v-2H7V8l-5 4 5 4v-3h9zM20 3h-8v2h8v14h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
  </svg>
);

/* ---------- Component ---------- */

export default function AccountSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [userRole, setUserRole] = useState<string | null>(null);
  const [expertStatus, setExpertStatus] = useState<ExpertStatus>("none");

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const userId = session.user.id;

      const { data: userRow } = await supabase
        .from("users")
        .select("role")
        .eq("id", userId)
        .maybeSingle();

      setUserRole(userRow?.role ?? "user");

      const { data: profile } = await supabase
        .from("expert_profiles")
        .select("approval_status")
        .eq("user_id", userId)
        .maybeSingle();

      setExpertStatus(profile?.approval_status ?? "none");
    };

    load();
  }, []);

  const navItem = (
    label: string,
    icon: React.ReactNode,
    path?: string,
    onClick?: () => void
  ) => {
    const isActive = path && pathname === path;

    return (
      <button
        onClick={onClick ?? (() => router.push(path!))}
        className={`w-full flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition
          ${
            isActive
              ? "bg-orange-50 text-orange-700 font-medium"
              : "text-gray-700 hover:bg-gray-100"
          }
        `}
      >
        <span className="text-gray-500">{icon}</span>
        {label}
      </button>
    );
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  const viewPublicProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    router.push(`/experts/${session.user.id}`);
  };

  const goToHostEdit = () => {
    router.push("/become-a-pro/step-1-basic?mode=edit");
  };

  const isExpert = expertStatus === "approved";

  return (
    <aside className="w-72 border-r bg-white px-4 py-6">
      <div className="mb-6 px-4 text-sm font-semibold text-gray-900">
        Account
      </div>

      <div className="space-y-1">
        {navItem("Profile", <IconUser />, "/account/profile")}

        {expertStatus === "none" && (
          <>
            {navItem("My Orders", <IconOrders />, "/account/orders/placed")}
            <Divider />
            {navItem(
              "Become a Host",
              <IconSparkle />,
              "/become-a-pro/step-1-basic"
            )}
          </>
        )}

        {expertStatus === "pending" && (
          <div className="px-4 py-2 text-xs text-gray-500">
            Host approval pending
          </div>
        )}

        {isExpert && (
          <>
            {navItem("Orders Placed", <IconOrders />, "/account/orders/placed")}
            {navItem(
              "Orders Received",
              <IconInbox />,
              "/account/orders/received"
            )}
            <Divider />
            {navItem("Edit Host Profile", <IconEdit />, undefined, goToHostEdit)}
            {navItem(
              "View Public Profile",
              <IconEye />,
              undefined,
              viewPublicProfile
            )}
          </>
        )}

        {userRole === "admin" && (
          <>
            <Divider />
            {navItem("Admin Panel", <IconSparkle />, "/admin/experts")}
          </>
        )}

        <Divider />
        {navItem("Logout", <IconLogout />, undefined, logout)}
      </div>
    </aside>
  );
}

/* ---------- Helpers ---------- */

function Divider() {
  return <div className="my-3 border-t" />;
}
