import Link from "next/link";

export default function CancelPage() {
  return (
    <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <span className="text-4xl">✕</span>
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Checkout cancelled
      </h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        No worries — your cart is still saved. You can pick up right where
        you left off.
      </p>
      <Link
        href="/"
        className="mt-4 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
      >
        Back to shop
      </Link>
    </div>
  );
}
