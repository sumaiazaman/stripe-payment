"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useEffect, useState } from "react";
import CheckoutForm from "@/components/CheckoutForm";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const AMOUNT = 49.99;
const SESSION_KEY = "stripe_payment_intent";

export default function CheckoutPage() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reuse existing payment intent if already created in this session
    const cached = sessionStorage.getItem(SESSION_KEY);
    if (cached) {
      setClientSecret(cached);
      return;
    }

    // Create a new payment intent and cache it
    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: AMOUNT }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          sessionStorage.setItem(SESSION_KEY, data.clientSecret);
          setClientSecret(data.clientSecret);
        }
      })
      .catch(() => setError("Failed to initialize payment."));
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Checkout</h1>
          <p className="text-gray-500 text-sm">Secure payment powered by Stripe</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-8">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Pro Plan (1 month)</span>
            <span className="font-semibold text-gray-900">${AMOUNT}</span>
          </div>
          <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between items-center">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="text-xl font-bold text-indigo-600">${AMOUNT}</span>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700 mb-6">
            {error}
          </div>
        )}

        {!clientSecret && !error && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        )}

        {clientSecret && (
          <Elements
            stripe={stripePromise}
            options={{ clientSecret, appearance: { theme: "stripe" } }}
          >
            <CheckoutForm amount={AMOUNT} />
          </Elements>
        )}

        <p className="text-xs text-center text-gray-400 mt-6">
          Your payment info is encrypted and secure.
        </p>
      </div>
    </main>
  );
}
