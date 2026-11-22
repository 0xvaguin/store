import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogClient } from "@/components/catalog/catalog-client";

export const metadata: Metadata = {
  title: "Catálogo",
  description:
    "Explore o catálogo completo da AURA: alfaiataria em linho puro, vestidos fluidos, tricots em algodão pima e acessórios em couro legítimo.",
};

function CatalogFallback() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mb-8 border-b pb-6">
        <div className="h-3 w-28 animate-pulse rounded bg-muted" />
        <div className="mt-3 h-8 w-56 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-4 w-80 max-w-full animate-pulse rounded bg-muted" />
      </div>
      <div className="lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10">
        <div className="hidden h-96 animate-pulse rounded-lg border bg-muted/40 lg:block" />
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-10">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <div className="aspect-[3/4] w-full animate-pulse rounded-lg bg-muted" />
              <div className="h-3 w-20 animate-pulse rounded bg-muted" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function ProdutosPage() {
  return (
    <Suspense fallback={<CatalogFallback />}>
      <CatalogClient />
    </Suspense>
  );
}
