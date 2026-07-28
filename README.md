## Northwind Goods — Next.js + Stripe Checkout demo

A small e-commerce demo built with the Next.js App Router:

- **Product grid** (`components/ProductGrid.tsx`) rendering a sample catalog (`lib/products.ts`).
- **Cart drawer** (`components/CartDrawer.tsx`) backed by React context (`context/CartContext.tsx`) that persists the cart to `localStorage` so it survives page reloads.
- **Stripe Checkout API route** (`app/api/checkout/route.ts`) that creates a Checkout Session, re-prices items server-side from the catalog (never trusting client-submitted prices), and collects a **Canada-only shipping address** via `shipping_address_collection: { allowed_countries: ["CA"] }`, plus two CAD shipping rate options.
- **Stripe webhook route** (`app/api/webhooks/stripe/route.ts`) that verifies the `checkout.session.completed` event and emails an order notification (via [Resend](https://resend.com)) containing the customer's name, total paid, and shipping address.

### Getting started

1. Install dependencies (already done if you just scaffolded this project):

   ```bash
   npm install
   ```

2. Copy the env example and add your Stripe **test mode** keys from the [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys):

   ```bash
   cp .env.local.example .env.local
   ```

   ```
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   RESEND_API_KEY=re_...
   ORDER_NOTIFICATION_EMAIL=you@example.com
   ORDER_NOTIFICATION_FROM_EMAIL=onboarding@resend.dev
   ```

3. Run the dev server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000), add a few products to the cart, open the cart drawer, and click **Checkout**. You'll be redirected to Stripe Checkout, where you'll be asked for a Canadian shipping address before you can pay.

### Testing payments

Use any of [Stripe's test card numbers](https://docs.stripe.com/testing), e.g.:

- Card number: `4242 4242 4242 4242`
- Expiry: any future date
- CVC: any 3 digits
- Shipping address: any valid Canadian address (e.g. postal code `M5V 2T6`, province Ontario)

On success you'll land on `/success`; if you cancel out of Checkout you'll land on `/cancel`. In both cases the cart in `localStorage` is left untouched — clearing it on success is a good next step once you have a way to detect success client-side (e.g. reading the `session_id` query param on `/success`).

### Order notification emails (Stripe webhook + Resend)

`app/api/webhooks/stripe/route.ts` listens for the `checkout.session.completed` event, verifies the Stripe signature, and emails you (via [Resend](https://resend.com)) the customer's name, total paid, and shipping address.

To test it locally:

1. Sign up for Resend and grab an API key from the [API Keys page](https://resend.com/api-keys). Set `RESEND_API_KEY` and `ORDER_NOTIFICATION_EMAIL` (your inbox) in `.env.local`. Leave `ORDER_NOTIFICATION_FROM_EMAIL` as the default `onboarding@resend.dev` — Resend's shared test sender only delivers to the email address on your own Resend account, which is fine for local testing. Verify your own domain in Resend before using this for real customers.
2. Install the [Stripe CLI](https://docs.stripe.com/stripe-cli) and run:

   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

   Copy the `whsec_...` signing secret it prints into `STRIPE_WEBHOOK_SECRET` in `.env.local`, then restart `npm run dev`.
3. Complete a test checkout (see above). You should see the event logged in the `stripe listen` terminal, a `200` response from your app, and a notification email arrive in your inbox within a few seconds.

In production, create a webhook endpoint pointing at `https://yourdomain.com/api/webhooks/stripe` in the [Stripe Dashboard](https://dashboard.stripe.com/webhooks), subscribe it to `checkout.session.completed`, and use the signing secret it gives you.

### Project structure

```
app/
  api/checkout/route.ts          Stripe Checkout session creation (server-only)
  api/webhooks/stripe/route.ts   Verifies checkout.session.completed and emails an order notification
  success/page.tsx               Post-payment landing page
  cancel/page.tsx                Checkout-cancelled landing page
  layout.tsx                     Wraps the app in CartProvider, renders Header + CartDrawer
  page.tsx                       Home page rendering the product grid
components/
  Header.tsx              Top bar with cart toggle + item count
  ProductGrid.tsx          Grid of ProductCard
  ProductCard.tsx          Single product with "Add to cart"
  CartDrawer.tsx           Slide-in cart drawer + checkout button
context/
  CartContext.tsx          Cart state, localStorage persistence
lib/
  products.ts              Sample product catalog + price formatting
  stripe.ts                Server-side Stripe client
  resend.ts                Server-side Resend client
  orderNotification.ts     Builds and sends the order notification email
  types.ts                 Shared Product / CartItem types
```

### Notes / things to harden for production

- The webhook handler only sends an email; it doesn't yet persist orders, decrement inventory, or clear the cart. Extend `app/api/webhooks/stripe/route.ts` for real fulfilment.
- The product catalog lives in a local TypeScript file for simplicity; swap `lib/products.ts` for a real database or CMS as needed.
- `shipping_address_collection` currently allows only `CA`; add more [ISO country codes](https://docs.stripe.com/api/checkout/sessions/create#create_checkout_session-shipping_address_collection-allowed_countries) if you want to ship elsewhere.
- Never commit real API keys. `.env.local` is git-ignored by default — double-check any docs or commits don't have real secrets pasted into them.
