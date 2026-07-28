import Stripe from "stripe";
import { getResendClient } from "./resend";

type CollectedInformation = NonNullable<
  Stripe.Checkout.Session["collected_information"]
>;
type ShippingDetails = NonNullable<CollectedInformation["shipping_details"]>;
type Address = ShippingDetails["address"];

function formatAddress(address: Address | null | undefined): string {
  if (!address) return "Not provided";

  return [
    address.line1,
    address.line2,
    [address.city, address.state, address.postal_code]
      .filter(Boolean)
      .join(", "),
    address.country,
  ]
    .filter(Boolean)
    .join("\n");
}

function formatAmount(session: Stripe.Checkout.Session): string {
  const currency = (session.currency ?? "cad").toUpperCase();
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
  }).format((session.amount_total ?? 0) / 100);
}

/**
 * Sends an order notification email (via Resend) to the store owner when a
 * Stripe Checkout Session completes successfully.
 */
export async function sendOrderNotificationEmail(
  session: Stripe.Checkout.Session
) {
  const notifyEmail = process.env.ORDER_NOTIFICATION_EMAIL;

  if (!notifyEmail) {
    throw new Error(
      "Missing ORDER_NOTIFICATION_EMAIL environment variable. Add it to your .env.local file."
    );
  }

  const fromEmail =
    process.env.ORDER_NOTIFICATION_FROM_EMAIL ?? "onboarding@resend.dev";

  const shippingDetails = session.collected_information?.shipping_details;
  const customerName =
    session.customer_details?.name ?? shippingDetails?.name ?? "a customer";
  const amountFormatted = formatAmount(session);
  const shippingAddressText = shippingDetails
    ? `${shippingDetails.name}\n${formatAddress(shippingDetails.address)}`
    : "Not provided";

  const resend = getResendClient();

  await resend.emails.send({
    from: `Northwind Goods <${fromEmail}>`,
    to: notifyEmail,
    subject: `New order from ${customerName} — ${amountFormatted}`,
    text: [
      "You have a new paid order!",
      "",
      `Customer: ${customerName}`,
      `Total paid: ${amountFormatted}`,
      "",
      "Shipping address:",
      shippingAddressText,
      "",
      `Stripe Checkout Session: ${session.id}`,
    ].join("\n"),
    html: `
      <h2>You have a new paid order!</h2>
      <p><strong>Customer:</strong> ${customerName}</p>
      <p><strong>Total paid:</strong> ${amountFormatted}</p>
      <p><strong>Shipping address:</strong><br />${shippingAddressText.replace(/\n/g, "<br />")}</p>
      <p style="color:#666;font-size:12px;">Stripe Checkout Session: ${session.id}</p>
    `,
  });
}
