"use client";

import { usePaymentIntent, StripeCheckout, PaymentStatus } from "@sumaiaaktar/stripe-payment";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function TestPageContent() {
  const searchParams = useSearchParams();
  const [returnUrl, setReturnUrl] = useState<string>("");

  // Check if we're coming back from Stripe redirect
  const paymentIntentId = searchParams.get("payment_intent");
  const redirectStatus = searchParams.get("redirect_status");
  const isRedirectedBack = !!paymentIntentId && !!redirectStatus;

  useEffect(() => {
    setReturnUrl(`${window.location.origin}/test-package`);
  }, []);

  const { clientSecret, isLoading, error } = usePaymentIntent({
    amount: 49.99,
    currency: "usd",
    cache: false,
  });

  const checks = [
    { label: "Package installed", ok: true },
    { label: "usePaymentIntent hook", ok: !error },
    { label: "clientSecret received", ok: !!clientSecret || isRedirectedBack },
    { label: "StripeCheckout component", ok: true },
    { label: "PaymentStatus component", ok: true },
  ];

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">

        {/* Header */}
        <div className="mb-6 text-center">
          <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
            Package Test Page
          </span>
          <h1 className="text-xl font-bold text-gray-900">
            Testing @sumaiaaktar/stripe-payment
          </h1>
        </div>

        {/* Status checks */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2 text-sm">
          {checks.map(({ label, ok }) => (
            <div key={label} className="flex items-center gap-2">
              <span>{ok ? "✅" : "❌"}</span>
              <span className={ok ? "text-gray-700" : "text-red-600"}>{label}</span>
            </div>
          ))}
        </div>

        {/* After payment redirect — show PaymentStatus */}
        {isRedirectedBack ? (
          <div>
            <PaymentStatus
              paymentIntentId={paymentIntentId}
              onCompleted={(p) => console.log("✅ Completed:", p)}
              onFailed={(p) => console.log("❌ Failed:", p)}
            />
            <div className="mt-6 text-center">
              <button
                onClick={() => window.location.href = "/test-package"}
                className="text-sm text-indigo-600 hover:underline"
              >
                ← Test again
              </button>
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 mb-6">
                Error: {error}
              </div>
            )}

            {isLoading && (
              <div className="flex items-center justify-center py-6 gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                <span className="text-gray-500 text-sm">Loading payment intent...</span>
              </div>
            )}

            {clientSecret && returnUrl && (
              <StripeCheckout
                publishableKey={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
                clientSecret={clientSecret}
                amount={49.99}
                returnUrl={returnUrl}
                title="Test Payment"
                description="Testing the npm package components"
                buttonText="Pay $49.99 (Test)"
              />
            )}
          </>
        )}

      </div>
    </main>
  );
}

export default function TestPackagePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    }>
      <TestPageContent />
    </Suspense>
  );
}
