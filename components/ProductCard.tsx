"use client";

import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/products";
import { Product } from "@/lib/types";

export function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const { addToCart } = useCart();

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-black/[.08] bg-white transition-shadow hover:shadow-lg dark:border-white/[.145] dark:bg-zinc-900">
      <div className="relative aspect-square w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <Image
          src={product.image}
          alt={product.name}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          {product.name}
        </h3>
        <p className="flex-1 text-sm text-zinc-500 dark:text-zinc-400">
          {product.description}
        </p>
        <div className="flex items-center justify-between pt-2">
          <span className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            {formatPrice(product.price)}
          </span>
          <button
            type="button"
            onClick={() => addToCart(product.id)}
            className="rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}
