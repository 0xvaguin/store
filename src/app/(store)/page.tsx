import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MOCK_CATEGORIES, getFeaturedProducts } from "@/data/mock-products";
import { ProductCard } from "@/components/product/product-card";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NATURAL_FIBERS = [
  {
    name: "Linho Europeu",
    detail: "Beneficiado no Brasil com toque fresco e caimento arquitetônico.",
  },
  {
    name: "Seda Mista",
    detail: "Brilho acetinado sutil e fluidez natural no viés.",
  },
  {
    name: "Algodão Pima",
    detail: "Fibras extralongas de maciez superior e alta durabilidade.",
  },
] as const;

export default function HomePage() {
  const featuredProducts = getFeaturedProducts();

  return (
    <div className="flex flex-col">
      {/* 1. Editorial Fashion Hero */}
      <section className="border-b bg-background">
        <div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-12">
          <div className="flex flex-col justify-between px-4 py-12 sm:px-6 sm:py-16 lg:col-span-5 lg:py-24 lg:pr-12 lg:pl-8">
            <span className="text-[10px] font-medium tracking-[0.24em] text-muted-foreground uppercase">
              Coleção 01 — Essencialismo
            </span>

            <div className="my-10 space-y-5 lg:my-0">
              <h1 className="text-4xl font-normal tracking-tight text-balance text-foreground sm:text-5xl lg:text-[3.25rem] lg:leading-[1.06]">
                Alfaiataria contemporânea de corte arquitetônico.
              </h1>

              <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
                Silhuetas precisas em linho puro, seda e algodão pima produzidas
                no Brasil.
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-3">
                <Link
                  href="/produtos"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "h-11 rounded-none px-8 text-xs font-medium tracking-[0.16em] uppercase"
                  )}
                >
                  EXPLORAR COLEÇÃO
                </Link>

                <Link
                  href="/produtos?categoria=alfaiataria"
                  className="text-xs font-medium tracking-[0.12em] text-foreground uppercase underline underline-offset-4 transition-colors hover:text-muted-foreground"
                >
                  Ver alfaiataria
                </Link>
              </div>
            </div>

            <p className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
              Ateliê São Paulo · Pequenos Lotes
            </p>
          </div>

          <div className="lg:col-span-7">
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted sm:aspect-[16/11] lg:aspect-auto lg:h-full lg:min-h-[600px]">
              <img
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=85"
                alt="Editorial AURA — Coleção Essencialismo em alfaiataria minimalista"
                className="h-full w-full object-cover object-center"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Category Grid */}
      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="text-xl font-medium tracking-tight text-foreground sm:text-2xl">
            Categorias em Destaque
          </h2>

          <Link
            href="/produtos"
            className="inline-flex items-center gap-1.5 text-xs font-medium tracking-[0.14em] text-foreground uppercase transition-colors hover:text-muted-foreground"
          >
            <span>Ver catálogo</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-5 lg:grid-cols-4">
          {MOCK_CATEGORIES.map((category) => (
            <Link
              key={category.id}
              href={`/produtos?categoria=${category.slug}`}
              className="group flex flex-col"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-none bg-muted">
                <img
                  src={category.image}
                  alt={category.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </div>
              <div className="mt-2.5 flex items-center justify-between">
                <h3 className="text-xs font-medium tracking-[0.12em] text-foreground uppercase sm:text-sm">
                  {category.name}
                </h3>
                <ArrowRight className="size-3.5 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-foreground" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Featured Products */}
      <section className="border-t bg-background">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[10px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
                Edição Limitada
              </p>
              <h2 className="text-xl font-medium tracking-tight text-foreground sm:text-2xl">
                Seleção da Temporada
              </h2>
            </div>

            <Link
              href="/produtos"
              className="inline-flex items-center gap-1.5 text-xs font-medium tracking-[0.14em] text-foreground uppercase transition-colors hover:text-muted-foreground"
            >
              <span>Ver todos</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Editorial Brand Manifesto + Newsletter */}
      <section className="border-t bg-secondary/20">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-stretch">
            {/* Brand Manifesto */}
            <div className="grid grid-cols-1 border bg-background sm:grid-cols-12 lg:col-span-7">
              <div className="relative aspect-[4/3] bg-muted sm:col-span-5 sm:aspect-auto">
                <img
                  src="https://images.unsplash.com/photo-1588271968087-4c51abe05afc?auto=format&fit=crop&w=900&q=80"
                  alt="Trama natural e acabamento artesanal da coleção AURA"
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex flex-col justify-between space-y-6 p-6 sm:col-span-7 sm:p-8">
                <div className="space-y-3">
                  <p className="text-[10px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
                    Matéria-Prima
                  </p>
                  <h2 className="text-xl font-medium tracking-tight text-foreground sm:text-2xl">
                    Feito no Brasil, pensado para durar.
                  </h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Cada peça une ateliês locais a fibras naturais selecionadas:
                    linho respirável, seda de caimento fluido e algodão pima.
                  </p>
                </div>

                <dl className="grid grid-cols-1 gap-3 border-t pt-4">
                  {NATURAL_FIBERS.map((fiber) => (
                    <div key={fiber.name} className="space-y-0.5">
                      <dt className="text-xs font-medium tracking-wider text-foreground uppercase">
                        {fiber.name}
                      </dt>
                      <dd className="text-xs text-muted-foreground">
                        {fiber.detail}
                      </dd>
                    </div>
                  ))}
                </dl>

                <div>
                  <Link
                    href="/produtos"
                    className="inline-flex items-center gap-1.5 text-xs font-medium tracking-[0.14em] text-foreground uppercase underline underline-offset-4 transition-colors hover:text-muted-foreground"
                  >
                    <span>Explorar coleção completa</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Client Newsletter Island */}
            <div className="lg:col-span-5">
              <NewsletterSection />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
