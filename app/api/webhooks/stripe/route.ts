import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe";
import { sendOrderNotificationEmail } from "@/lib/orderNotification";

// The Stripe SDK needs Node's crypto module for signature verification.
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("Missing STRIPE_WEBHOOK_SECRET environment variable.");
    return NextResponse.json(
      { error: "Webhook is not configured." },
      { status: 500 }
    );
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header." },
      { status: 400 }
    );
  }

  // Signature verification requires the raw, untouched request body, so we
  // read it as text rather than calling request.json().
  const payload = await request.text();

  let event: Stripe.Event;

  try {
    const stripe = getStripeClient();
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    console.error("Stripe webhook signature verification failed", error);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      await sendOrderNotificationEmail(session);
    } catch (error) {
      // Log but still acknowledge the webhook below: an email delivery
      // failure shouldn't cause Stripe to keep retrying this event.
      console.error("Failed to send order notification email", error);
    }
  }

  return NextResponse.json({ received: true });
}
