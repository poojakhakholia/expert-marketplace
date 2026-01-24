"use client";

type OrderRow = {
  id: string;
  name: string;
  dateTime: string;
  duration: number;
  amount: number;
  status: string;
  joinEnabled: boolean;
  actions?: React.ReactNode;
};

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
        No sessions
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left">{nameLabel}</th>
            <th className="px-4 py-3 text-left">Date & Time</th>
            <th className="px-4 py-3 text-left">Duration</th>
            <th className="px-4 py-3 text-left">Amount</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Join</th>
            <th className="px-4 py-3 text-left">Action</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className="border-t hover:bg-gray-50 transition"
            >
              <td className="px-4 py-3 font-medium">{row.name}</td>
              <td className="px-4 py-3">{row.dateTime}</td>
              <td className="px-4 py-3">{row.duration} mins</td>
              <td className="px-4 py-3">₹{row.amount}</td>

              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    row.status === "confirmed"
                      ? "bg-blue-100 text-blue-700"
                      : row.status === "pending_confirmation"
                      ? "bg-yellow-100 text-yellow-800"
                      : row.status === "cancelled"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {row.status.replace("_", " ")}
                </span>
              </td>

              <td className="px-4 py-3">
                {row.joinEnabled ? (
                  <button className="cursor-pointer text-indigo-600 hover:underline">
                    Join
                  </button>
                ) : (
                  <span className="cursor-not-allowed text-gray-400">
                    Join
                  </span>
                )}
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
