import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getPayment, createPayment, updatePaymentStatus } from "@/lib/paymentStore";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let payment = await getPayment(id);

  if (payment && payment.status !== "pending") {
    return NextResponse.json(payment);
  }

  try {
    const intent = await stripe.paymentIntents.retrieve(id);
    const amount = intent.amount / 100;
    const currency = intent.currency;

    if (!payment) {
      payment = await createPayment(id, amount, currency);
    }

    if (intent.status === "succeeded") {
      payment = await updatePaymentStatus(id, "completed");
    } else if (intent.status === "canceled" || intent.status === "requires_payment_method") {
      payment = await updatePaymentStatus(id, "failed");
    }

    return NextResponse.json(payment);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch payment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
