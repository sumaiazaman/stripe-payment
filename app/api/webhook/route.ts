import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createPayment, updatePaymentStatus, getPayment } from "@/lib/paymentStore";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
});

export async function POST(request: NextRequest) {
  const sig = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    console.error("[webhook] Missing stripe-signature or STRIPE_WEBHOOK_SECRET");
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await request.text();
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook verification failed";
    console.error("[webhook] Signature verification failed:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const intent = event.data.object as Stripe.PaymentIntent;
      const existing = await getPayment(intent.id);
      if (!existing) {
        await createPayment(intent.id, intent.amount / 100, intent.currency);
      }
      await updatePaymentStatus(intent.id, "completed");
      console.log(`[webhook] ✅ Payment ${intent.id} → COMPLETED`);
      break;
    }

    case "payment_intent.payment_failed": {
      const intent = event.data.object as Stripe.PaymentIntent;
      const existing = await getPayment(intent.id);
      if (!existing) {
        await createPayment(intent.id, intent.amount / 100, intent.currency);
      }
      await updatePaymentStatus(intent.id, "failed");
      console.log(`[webhook] ❌ Payment ${intent.id} → FAILED`);
      break;
    }

    default:
      console.log(`[webhook] Skipped event: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
