"use client";

type OrderRow = {
  id: string; // internal row key

  // from Supabase (ISO strings expected)
  orderCode?: string;
  orderDate?: string; // order created_at
  dateTime: string; // conversation datetime

  name: string; // requestor / host name
  duration: number;
  amount: number;

  status: string; // booking.status
  paymentStatus?: string; // 🔹 NEW (optional, backward-safe)

  // backward compatibility (unused)
  joinEnabled?: boolean;
  meetingLink?: string;

  actions?: React.ReactNode;
};

function formatDateTime(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "—";

  const datePart = date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const timePart = date
    .toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .toLowerCase();

  return `${datePart}, IST ${timePart}`;
}

/* ---------------- Status Badge Logic ---------------- */

function getStatusBadge(
  status: string,
  paymentStatus?: string
) {
  // Confirmed booking
  if (status === "confirmed") {
    return {
      label: "Confirmed",
      className: "bg-green-100 text-green-700",
    };
  }

  // Awaiting host
  if (status === "pending_confirmation") {
    return {
      label: "Awaiting confirmation",
      className: "bg-yellow-100 text-yellow-800",
    };
  }

  // Cancelled cases
  if (status === "cancelled") {
    if (paymentStatus === "abandoned") {
      return {
        label: "Payment abandoned",
        className: "bg-gray-100 text-gray-600",
      };
    }

    if (paymentStatus === "failed") {
      return {
        label: "Payment failed",
        className: "bg-red-100 text-red-700",
      };
    }

    return {
      label: "Cancelled",
      className: "bg-gray-100 text-gray-600",
    };
  }

  // Rejected by host
  if (status === "rejected") {
    return {
      label: "Rejected",
      className: "bg-red-100 text-red-700",
    };
  }

  // Fallback
  return {
    label: status.replaceAll("_", " "),
    className: "bg-gray-100 text-gray-600",
  };
}

/* ---------------- Component ---------------- */

export default function OrdersTable({
  rows,
  nameLabel,
}: {
  rows: OrderRow[];
  nameLabel: string;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-6 text-sm text-gray-500">
        No orders found
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-white">
      <table className="w-full text-sm">
        <thead className="bg-orange-50">
          <tr className="text-gray-700">
            <th className="px-4 py-3 text-left font-medium">
              Order ID
            </th>
            <th className="px-4 py-3 text-left font-medium">
              Order Time
            </th>
            <th className="px-4 py-3 text-left font-medium">
              {nameLabel}
            </th>
            <th className="px-4 py-3 text-left font-medium">
              Conversation Date & Time
            </th>
            <th className="px-4 py-3 text-left font-medium">
              Duration
            </th>
            <th className="px-4 py-3 text-left font-medium">
              Amount
            </th>
            <th className="px-4 py-3 text-left font-medium">
              Order Status
            </th>
            <th className="px-4 py-3 text-left font-medium">
              Action
            </th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => {
            const badge = getStatusBadge(
              row.status,
              row.paymentStatus
            );

            return (
              <tr
                key={row.id}
                className="border-t transition hover:bg-gray-50"
              >
                <td className="px-4 py-3 font-mono text-xs text-gray-700">
                  {row.orderCode ?? "—"}
                </td>

                <td className="px-4 py-3 text-gray-600">
                  {formatDateTime(row.orderDate)}
                </td>

                <td className="px-4 py-3 font-medium">
                  {row.name}
                </td>

                <td className="px-4 py-3">
                  {formatDateTime(row.dateTime)}
                </td>

                <td className="px-4 py-3">
                  {row.duration} mins
                </td>

                <td className="px-4 py-3">
                  ₹{row.amount}
                </td>

                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                </td>

                <td className="px-4 py-3">
                  {row.actions ?? "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
