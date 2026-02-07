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
    status: string;

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
            {rows.map((row) => (
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
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      row.status === "confirmed"
                        ? "bg-green-100 text-green-700"
                        : row.status === "pending_confirmation"
                        ? "bg-yellow-100 text-yellow-800"
                        : row.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {row.status.replaceAll("_", " ")}
                  </span>
                </td>

                <td className="px-4 py-3">
                  {row.actions ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
