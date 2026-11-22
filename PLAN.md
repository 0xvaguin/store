# PLAN.md — Techfy White-Label Storefront (Phase 1)

## Global Constraints
- **Stack:** Next.js 16.4.6 App Router (`cacheComponents: true`), TypeScript (`strict`), Tailwind CSS v4, Shadcn/UI (`@base-ui/react`), Lucide Icons, Zustand (`persist`).
- **Scope:** Frontend UI + interactive cart/checkout with typed mocks ONLY. No Supabase client, no auth screens, no payment SDKs.
- **Copy & Currency:** 100% PT-BR UI copy, currency in BRL (`R$`).
- **White-Label Config:** Centralized in `src/config/store.config.ts` and `src/app/globals.css`.
- **Image Config:** `next.config.ts` configures `images: { unoptimized: true, remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }] }`.
- **Route Groups Isolation:**
  - `src/app/layout.tsx`: Root shell (`html`, `body`, `<Toaster />` only).
  - `src/app/(store)/layout.tsx`: Storefront chrome (`Navbar`, `Footer`, `CartDrawer`) wrapping `/`, `/produtos`, `/produtos/[slug]`.
  - `src/app/(checkout)/layout.tsx`: Minimal distraction-free header (logo + security badge only) wrapping `/checkout`.
- **SKU Matrix & Cart Hydration:** Optional `variants?: ProductVariant[]` on `Product`; Cart key `${productId}:${variantId ?? 'default'}`. `useCartStore` persists `items`, `couponCode`, `discountPercent`, `cep`, `selectedShipping`, and exposes `hasHydrated` via `onRehydrateStorage` to gate SSR/client cart & checkout renders.
- **Next.js 16 Compatibility:** `generateStaticParams` + `await params` on `[slug]`; `<Suspense>` around `useSearchParams()` consumers; no `asChild` on Base UI primitives.

## Wave 1 — Foundation & Shared Shell (Sequential)
- `next.config.ts`: `images.unoptimized` + `remotePatterns` for `images.unsplash.com`.
- `src/types/index.ts`: Phase 2 (Supabase) & Phase 3 (Mercado Pago/Asaas) ready domain contracts.
- `src/config/store.config.ts`: White-label config (`storeConfig`) + BRL/Pix/installment/discount + shared `calculateMockShipping(cep, subtotal?)`.
- `src/app/globals.css`: White-label CSS theme tokens (`--primary`, `--accent`, `--brand-accent`, `--radius: 0.375rem`).
- `src/data/mock-products.ts`: `MOCK_CATEGORIES` (4 categories), `MOCK_PRODUCTS` (8 products with variant matrices, stock=0, `priceOverride`, and non-variant accessories).
- `src/store/use-cart.ts`: Zustand `useCartStore` with `persist`, `hasHydrated` via `onRehydrateStorage`, persisted `cep` + `selectedShipping`, stock clamping, and coupons.
- `src/app/layout.tsx`, `src/app/(store)/layout.tsx`, `src/app/(checkout)/layout.tsx`: Isolated route group layouts.
- `src/components/layout/navbar.tsx`, `footer.tsx`, `src/components/cart/cart-drawer.tsx`, `src/components/product/product-card.tsx`: Hydration-safe shared UI.
- **Acceptance Criteria:** `pnpm tsc --noEmit` exits 0.

## Wave 2 — Storefront Pages (Parallel)
- **Agent A (`/`)**: `src/app/(store)/page.tsx`, `src/components/home/newsletter-section.tsx` — Editorial hero, trust strip, category grid, featured products, manifesto + newsletter.
- **Agent B (`/produtos`)**: `src/app/(store)/produtos/page.tsx`, `src/components/catalog/catalog-client.tsx` — `<Suspense>` wrapper, filters, sort, mobile filter `Sheet`.
- **Agent C (`/produtos/[slug]`)**: `src/app/(store)/produtos/[slug]/page.tsx`, `src/components/product/pdp-client.tsx`, `src/components/product/size-guide-modal.tsx` — `generateStaticParams`, gallery, variant matrix, size guide `Dialog`, shared CEP shipping calculator persisting to `useCartStore`, sticky mobile buy bar.
- **Agent D (`/checkout`)**: `src/app/(checkout)/checkout/page.tsx`, `src/components/checkout/checkout-client.tsx` — Hydration-gated 3-step guest checkout reading/updating persisted `cep` & `selectedShipping`, live order summary, mocked `OrderPayload` confirmation.
- **Acceptance Criteria:** `pnpm tsc --noEmit`, `pnpm lint`, and `pnpm build` (or `pnpm next build --webpack` under proot) pass cleanly; `/checkout` excludes storefront `Navbar`/`Footer`.
