"use client";

import { useCart } from "@/context/CartContext";

export function Header() {
  const { itemCount, openDrawer } = useCart();

  return (
    <header className="sticky top-0 z-30 border-b border-black/[.08] bg-white/80 backdrop-blur dark:border-white/[.145] dark:bg-black/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <span className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Northwind Goods
        </span>
        <button
          type="button"
          onClick={openDrawer}
          className="relative flex items-center gap-2 rounded-full border border-black/[.08] px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:text-zinc-50 dark:hover:bg-white/[.06]"
        >
          Cart
          {itemCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1 text-xs font-semibold text-background">
              {itemCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
