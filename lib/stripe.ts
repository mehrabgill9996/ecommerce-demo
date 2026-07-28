import Stripe from "stripe";

let stripeClient: Stripe | null = null;

/**
 * Lazily creates the Stripe client so a missing STRIPE_SECRET_KEY only
 * surfaces as an error when a request actually needs Stripe (e.g. the
 * checkout route), rather than crashing the whole module graph on import.
 */
export function getStripeClient(): Stripe {
  if (stripeClient) return stripeClient;

  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error(
      "Missing STRIPE_SECRET_KEY environment variable. Copy .env.local.example to .env.local and add your Stripe test secret key, then restart the dev server."
    );
  }

  stripeClient = new Stripe(secretKey);
  return stripeClient;
}
