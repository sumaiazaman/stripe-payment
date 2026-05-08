"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type Status = "loading" | "pending" | "completed" | "failed";

const STATUS_CONFIG: Record<string, { label: string; description: string; color: string; icon: "check" | "clock" | "x" }> = {
  completed: {
    label: "Payment Successful!",
    description: "Thank you for your purchase. Your payment has been confirmed.",
    color: "green",
    icon: "check",
  },
  pending: {
    label: "Payment Pending",
    description: "Your payment is being processed. This page will update automatically.",
    color: "yellow",
    icon: "clock",
  },
  failed: {
    label: "Payment Failed",
    description: "Something went wrong with your payment. Please try again.",
    color: "red",
    icon: "x",
  },
};

function StatusIcon({ type, color }: { type: "check" | "clock" | "x"; color: string }) {
  const bg = { green: "bg-green-100", yellow: "bg-yellow-100", red: "bg-red-100" }[color];
  const text = { green: "text-green-600", yellow: "text-yellow-600", red: "text-red-600" }[color];

  return (
    <div className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full ${bg}`}>
      {type === "check" && (
        <svg className={`h-8 w-8 ${text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )}
      {type === "clock" && (
        <svg className={`h-8 w-8 ${text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}
      {type === "x" && (
        <svg className={`h-8 w-8 ${text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
    </div>
  );
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const paymentIntentId = searchParams.get("payment_intent");

  const [status, setStatus] = useState<Status>("loading");
  const [pollCount, setPollCount] = useState(0);

  const fetchStatus = useCallback(async () => {
    if (!paymentIntentId) {
      setStatus("failed");
      return;
    }

    try {
      const res = await fetch(`/api/payment-status/${paymentIntentId}`);
      if (!res.ok) {
        setStatus("failed");
        return;
      }
      const data = await res.json();
      setStatus(data.status as Status);
    } catch {
      setStatus("failed");
    }
  }, [paymentIntentId]);

  // Initial fetch
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Poll every 3 seconds while pending (max 10 attempts)
  useEffect(() => {
    if (status !== "pending" || pollCount >= 10) return;

    const timer = setTimeout(() => {
      fetchStatus();
      setPollCount((c) => c + 1);
    }, 3000);

    return () => clearTimeout(timer);
  }, [status, pollCount, fetchStatus]);

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
        <p className="text-sm text-gray-400">Checking payment status…</p>
      </div>
    );
  }

  const config = STATUS_CONFIG[status];

  return (
    <div className="text-center">
      <StatusIcon type={config.icon} color={config.color} />

      <h1 className="text-2xl font-bold text-gray-900 mb-2">{config.label}</h1>
      <p className="text-gray-500 mb-4">{config.description}</p>

      {paymentIntentId && (
        <p className="text-xs text-gray-400 mb-2">
          Reference: <span className="font-mono">{paymentIntentId}</span>
        </p>
      )}

      {/* Live status badge */}
      <div className="flex justify-center mb-8">
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full
          ${status === "completed" ? "bg-green-100 text-green-700" : ""}
          ${status === "pending" ? "bg-yellow-100 text-yellow-700" : ""}
          ${status === "failed" ? "bg-red-100 text-red-700" : ""}
        `}>
          {status === "pending" && (
            <span className="animate-pulse h-1.5 w-1.5 rounded-full bg-yellow-500 inline-block" />
          )}
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>

      {status === "completed" && (
        <Link href="/" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors">
          Back to Home
        </Link>
      )}
      {status === "failed" && (
        <Link href="/checkout" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors">
          Try Again
        </Link>
      )}
      {status === "pending" && (
        <p className="text-xs text-gray-400">Checking every 3 seconds…</p>
      )}
    </div>
  );
}

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        <Suspense fallback={
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
          </div>
        }>
          <SuccessContent />
        </Suspense>
      </div>
    </main>
  );
}
