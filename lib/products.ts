import { Product } from "./types";

/**
 * Sample product catalog. Prices are in cents (CAD) and are the
 * source of truth used server-side when creating Stripe Checkout
 * sessions, so client-submitted prices are never trusted.
 */
export const products: Product[] = [
  {
    id: "prod_01",
    name: "Aurora Backpack",
    description: "Weatherproof daypack with padded laptop sleeve.",
    price: 8900,
    image: "https://picsum.photos/seed/aurora-backpack/600/600",
  },
  {
    id: "prod_02",
    name: "Summit Water Bottle",
    description: "Insulated stainless steel bottle, keeps drinks cold 24h.",
    price: 2900,
    image: "https://picsum.photos/seed/summit-bottle/600/600",
  },
  {
    id: "prod_03",
    name: "Nimbus Wireless Headphones",
    description: "Over-ear noise-cancelling headphones with 30h battery.",
    price: 15900,
    image: "https://picsum.photos/seed/nimbus-headphones/600/600",
  },
  {
    id: "prod_04",
    name: "Cascade Rain Jacket",
    description: "Packable, breathable shell jacket for unpredictable weather.",
    price: 12500,
    image: "https://picsum.photos/seed/cascade-jacket/600/600",
  },
  {
    id: "prod_05",
    name: "Ember Desk Lamp",
    description: "Adjustable LED lamp with warm-to-cool dimming.",
    price: 4400,
    image: "https://picsum.photos/seed/ember-lamp/600/600",
  },
  {
    id: "prod_06",
    name: "Voyager Travel Mug",
    description: "Leak-proof ceramic-lined mug that fits any cup holder.",
    price: 3200,
    image: "https://picsum.photos/seed/voyager-mug/600/600",
  },
  {
    id: "prod_07",
    name: "Pathfinder Trail Shoes",
    description: "Lightweight trail runners with grippy all-terrain soles.",
    price: 13900,
    image: "https://picsum.photos/seed/pathfinder-shoes/600/600",
  },
  {
    id: "prod_08",
    name: "Halo Desk Organizer",
    description: "Bamboo organizer for cables, pens, and small essentials.",
    price: 3900,
    image: "https://picsum.photos/seed/halo-organizer/600/600",
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}

export function formatPrice(cents: number, currency = "CAD"): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
  }).format(cents / 100);
}
