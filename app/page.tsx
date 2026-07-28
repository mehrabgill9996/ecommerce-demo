import { ProductGrid } from "@/components/ProductGrid";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Shop the collection
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Free returns. Currently shipping to Canada only.
        </p>
      </div>
      <ProductGrid />
    </main>
  );
}
