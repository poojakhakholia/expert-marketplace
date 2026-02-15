"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const sections = [
  {
    title: "Experts",
    items: [
      { label: "Approvals", href: "/admin/experts" },
    ],
  },
  {
    title: "Withdrawals",
    items: [
      { label: "Requests", href: "/admin/withdrawals" },
      { label: "Processed", href: "/admin/withdrawals/processed" },
    ],
  },
  {
    title: "Intella Fees",
    items: [
      { label: "Configuration", href: "/admin/fees" },
    ],
  },
  {
    title: "Jobs",
    items: [
      { label: "Expiry Jobs", href: "/admin/jobs/expiry" },
    ],
  },
  {
    title: "Reports",
    items: [
      { label: "Financial", href: "/admin/reports/finance" },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-white p-4">
      <div className="mb-6 text-lg font-semibold text-gray-900">
        Admin Panel
      </div>

      <nav className="space-y-6">
        {sections.map((section) => (
          <div key={section.title}>
            <div className="mb-2 text-xs font-semibold uppercase text-gray-400">
              {section.title}
            </div>

            <ul className="space-y-1">
              {section.items.map((item) => {
                const active = pathname === item.href;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`block rounded-md px-3 py-2 text-sm transition
                        ${
                          active
                            ? "bg-orange-50 text-orange-700 font-medium"
                            : "text-gray-700 hover:bg-gray-100"
                        }
                      `}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
