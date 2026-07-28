import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe";
import { getProductById } from "@/lib/products";
import { CartItem } from "@/lib/types";

const MAX_QUANTITY_PER_ITEM = 20;

function getSiteUrl(request: NextRequest): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    request.headers.get("origin") ??
    "http://localhost:3000"
  );
}

export async function POST(request: NextRequest) {
  let body: { items?: CartItem[] };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const cartItems = body.items;

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
  }

  // Never trust prices from the client: look up each product server-side
  // and build Stripe line items from the catalog we control.
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

  for (const cartItem of cartItems) {
    const product = getProductById(cartItem?.id);
    const quantity = Number(cartItem?.quantity);

    if (!product) {
      return NextResponse.json(
        { error: `Unknown product: ${cartItem?.id}` },
        { status: 400 }
      );
    }

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY_PER_ITEM) {
      return NextResponse.json(
        { error: `Invalid quantity for ${product.name}.` },
        { status: 400 }
      );
    }

    lineItems.push({
      quantity,
      price_data: {
        currency: "cad",
        unit_amount: product.price,
        product_data: {
          name: product.name,
          description: product.description,
          images: [product.image],
        },
      },
    });
  }

  const siteUrl = getSiteUrl(request);

  try {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/cancel`,
      // Restrict Checkout to Canadian shipping addresses only, and
      // require Stripe to collect that address before payment.
      shipping_address_collection: {
        allowed_countries: ["CA"],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: 999, currency: "cad" },
            display_name: "Standard shipping (Canada)",
            delivery_estimate: {
              minimum: { unit: "business_day", value: 4 },
              maximum: { unit: "business_day", value: 8 },
            },
          },
        },
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: 2499, currency: "cad" },
            display_name: "Express shipping (Canada)",
            delivery_estimate: {
              minimum: { unit: "business_day", value: 1 },
              maximum: { unit: "business_day", value: 2 },
            },
          },
        },
      ],
      billing_address_collection: "auto",
      phone_number_collection: { enabled: true },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout session creation failed", error);

    // Surface setup issues (e.g. missing/invalid API key) verbatim since
    // this is the actionable message a developer needs locally. Genuine
    // Stripe API errors get a generic message instead of leaking details.
    const message =
      error instanceof Error && error.message.includes("STRIPE_SECRET_KEY")
        ? error.message
        : "Unable to create checkout session.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
