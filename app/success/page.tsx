import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <span className="text-4xl">✓</span>
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Thanks for your order!
      </h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        We&apos;ve received your payment and shipping details. A confirmation
        email is on its way.
      </p>
      <Link
        href="/"
        className="mt-4 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
      >
        Continue shopping
      </Link>
    </div>
  );
}
