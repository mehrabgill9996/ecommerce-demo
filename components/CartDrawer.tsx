"use client";

import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatPrice, getProductById } from "@/lib/products";

export function CartDrawer() {
  const {
    items,
    subtotal,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeFromCart,
  } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setError(null);
    setIsCheckingOut(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      const data = await response.json();

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Unable to start checkout.");
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setIsCheckingOut(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden={!isDrawerOpen}
        onClick={closeDrawer}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity ${
          isDrawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-white shadow-xl transition-transform duration-300 dark:bg-zinc-900 ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-black/[.08] px-5 py-4 dark:border-white/[.145]">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            Your cart
          </h2>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close cart"
            className="rounded-full p-1 text-zinc-500 transition-colors hover:bg-black/[.04] hover:text-zinc-900 dark:hover:bg-white/[.06] dark:hover:text-zinc-50"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <p className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
              Your cart is empty.
            </p>
          ) : (
            <ul className="flex flex-col gap-4">
              {items.map((item) => {
                const product = getProductById(item.id);
                if (!product) return null;
                return (
                  <li key={item.id} className="flex gap-3">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                          {product.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                        >
                          Remove
                        </button>
                      </div>
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        {formatPrice(product.price)}
                      </span>
                      <div className="mt-1 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          aria-label={`Decrease quantity of ${product.name}`}
                          className="flex h-6 w-6 items-center justify-center rounded-full border border-black/[.08] text-sm text-zinc-700 hover:bg-black/[.04] dark:border-white/[.145] dark:text-zinc-200 dark:hover:bg-white/[.06]"
                        >
                          −
                        </button>
                        <span className="w-4 text-center text-sm text-zinc-900 dark:text-zinc-50">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          aria-label={`Increase quantity of ${product.name}`}
                          className="flex h-6 w-6 items-center justify-center rounded-full border border-black/[.08] text-sm text-zinc-700 hover:bg-black/[.04] dark:border-white/[.145] dark:text-zinc-200 dark:hover:bg-white/[.06]"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="border-t border-black/[.08] px-5 py-4 dark:border-white/[.145]">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">Subtotal</span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-50">
              {formatPrice(subtotal)}
            </span>
          </div>
          <p className="mb-3 text-xs text-zinc-400 dark:text-zinc-500">
            Shipping calculated at checkout. Currently shipping to Canada only.
          </p>
          {error && (
            <p className="mb-3 text-xs text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          <button
            type="button"
            disabled={items.length === 0 || isCheckingOut}
            onClick={handleCheckout}
            className="w-full rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-[#ccc]"
          >
            {isCheckingOut ? "Redirecting to checkout…" : "Checkout"}
          </button>
        </div>
      </aside>
    </>
  );
}
