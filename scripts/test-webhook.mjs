import { readFileSync } from "node:fs";
import { createHmac } from "node:crypto";

function loadEnvLocal(path) {
  const raw = readFileSync(path, "utf8");
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match) env[match[1]] = match[2];
  }
  return env;
}

const env = loadEnvLocal(new URL("../.env.local", import.meta.url));
const webhookSecret = env.STRIPE_WEBHOOK_SECRET;

const fakeEvent = {
  id: "evt_test_123",
  object: "event",
  type: "checkout.session.completed",
  data: {
    object: {
      id: "cs_test_123",
      object: "checkout.session",
      amount_total: 15998,
      currency: "cad",
      customer_details: {
        name: "Jamie Rivera",
        email: "jamie@example.com",
      },
      collected_information: {
        shipping_details: {
          name: "Jamie Rivera",
          address: {
            line1: "123 Maple Street",
            line2: "Unit 4",
            city: "Toronto",
            state: "ON",
            postal_code: "M5V 2T6",
            country: "CA",
          },
        },
      },
    },
  },
};

const payload = JSON.stringify(fakeEvent);
const timestamp = Math.floor(Date.now() / 1000);
const signedPayload = `${timestamp}.${payload}`;
// Stripe uses the full "whsec_..." secret string as the HMAC key, unmodified.
const signature = createHmac("sha256", webhookSecret).update(signedPayload).digest("hex");

const response = await fetch("http://localhost:3000/api/webhooks/stripe", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "stripe-signature": `t=${timestamp},v1=${signature}`,
  },
  body: payload,
});

console.log("HTTP status:", response.status);
console.log("Response body:", await response.text());
