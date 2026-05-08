"use client";

import { useEffect, useState } from "react";
import type { PaymentRecord } from "@/lib/paymentStore";

const STATUS_STYLES: Record<string, string> = {
  pending:   "bg-yellow-100 text-yellow-700 border border-yellow-300",
  completed: "bg-green-100  text-green-700  border border-green-300",
  failed:    "bg-red-100    text-red-700    border border-red-300",
};

export default function DebugPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      const res = await fetch("/api/payments");
      const data = await res.json();
      setPayments(data);
      setLastRefresh(new Date());
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh every 2 seconds
  useEffect(() => {
    fetchPayments();
    const interval = setInterval(fetchPayments, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payment Debug Monitor</h1>
            <p className="text-sm text-gray-400 mt-1">
              Auto-refreshing every 2s — last updated: {lastRefresh.toLocaleTimeString()}
            </p>
          </div>
          <span className="flex items-center gap-2 text-xs text-green-600 font-medium">
            <span className="animate-pulse h-2 w-2 rounded-full bg-green-500 inline-block" />
            Live
          </span>
        </div>

        {/* Guide */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-800 space-y-1">
          <p className="font-semibold">How to test the pending → completed flow:</p>
          <ol className="list-decimal list-inside space-y-1 text-blue-700">
            <li>Run <code className="bg-blue-100 px-1 rounded">~/.local/bin/stripe login</code></li>
            <li>Run <code className="bg-blue-100 px-1 rounded">~/.local/bin/stripe listen --forward-to localhost:3000/api/webhook</code> in a terminal</li>
            <li>Copy the <code className="bg-blue-100 px-1 rounded">whsec_...</code> secret into <code className="bg-blue-100 px-1 rounded">.env.local</code> and restart the server</li>
            <li>Go to <a href="/checkout" className="underline font-medium">/checkout</a> and pay with card <code className="bg-blue-100 px-1 rounded">4242 4242 4242 4242</code></li>
            <li>Watch the status change below from <strong>pending</strong> → <strong>completed</strong></li>
          </ol>
        </div>

        {/* Payments table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        ) : payments.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
            No payments yet. Make a test payment at{" "}
            <a href="/checkout" className="text-indigo-500 underline">/checkout</a>.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Payment ID</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Amount</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Created</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{p.id}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      ${Number(p.amount).toFixed(2)}{" "}
                      <span className="text-gray-400 font-normal uppercase text-xs">{p.currency}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[p.status]}`}>
                        {p.status === "pending" && (
                          <span className="animate-pulse h-1.5 w-1.5 rounded-full bg-yellow-500 inline-block" />
                        )}
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(p.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(p.updatedAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
