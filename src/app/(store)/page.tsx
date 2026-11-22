import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MOCK_CATEGORIES, getFeaturedProducts } from "@/data/mock-products";
import { ProductCard } from "@/components/product/product-card";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { Reveal } from "@/components/motion/Reveal";
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
      {/* 1. Full-Bleed Editorial Lifestyle Hero */}
      <section className="relative flex min-h-[100svh] w-full items-end overflow-hidden border-b border-border">
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=85"
          alt="Editorial AURA — Coleção Essencialismo em alfaiataria minimalista"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[#0E0E0E]/80 via-[#0E0E0E]/25 to-transparent"
        />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8 lg:pb-20">
          <Reveal variant="hero" className="max-w-4xl space-y-5">
            <p className="font-mono text-[11px] tracking-[0.12em] text-[#F9F6F2]/80 uppercase">
              Coleção 01 — Ateliê São Paulo · Pequenos Lotes
            </p>
            <h1 className="font-heading text-4xl leading-[1.02] font-bold tracking-[-0.04em] text-[#F9F6F2] uppercase sm:text-6xl lg:text-[68px]">
              Essencialismo Arquitetônico
            </h1>
            <p className="max-w-lg text-sm leading-[1.55] text-[#F9F6F2]/90 sm:text-base">
              Silhuetas precisas em linho puro, seda e algodão pima produzidas no Brasil.
            </p>
            <div className="flex flex-wrap items-center gap-6 pt-2">
              <Link
                href="/produtos"
                className={cn(
                  buttonVariants({ variant: "cobalt", size: "lg" }),
                  "h-11 rounded-none px-8 text-xs font-semibold tracking-[0.12em] uppercase"
                )}
              >
                Explorar Coleção
              </Link>
              <Link
                href="/produtos?categoria=alfaiataria"
                className="border-b border-[#F9F6F2] pb-0.5 text-xs font-semibold tracking-[0.12em] text-[#F9F6F2] uppercase transition-opacity hover:opacity-75"
              >
                Ver Alfaiataria
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 2. Category Grid */}
      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-[100px]">
        <div className="mb-10 flex items-end justify-between gap-4">
          <h2 className="inline-block border-b-2 border-brand-accent pb-2 font-heading text-3xl leading-[1.05] font-bold tracking-[-0.03em] text-foreground uppercase sm:text-4xl lg:text-5xl">
            Categorias
          </h2>

          <Link
            href="/produtos"
            className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.12em] text-foreground uppercase transition-colors hover:text-brand-accent"
          >
            <span>Ver catálogo</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <Reveal
          variant="grid"
          className="grid grid-cols-2 gap-[15px] lg:grid-cols-4"
        >
          {MOCK_CATEGORIES.map((category) => (
            <Link
              key={category.id}
              href={`/produtos?categoria=${category.slug}`}
              className="group flex flex-col border border-border bg-card transition-transform duration-100 ease-out active:scale-[0.98]"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-none border-b border-border bg-background">
                <img
                  src={category.image}
                  alt={category.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </div>
              <div className="flex items-center justify-between p-4">
                <h3 className="text-xs font-semibold tracking-[0.12em] text-foreground uppercase sm:text-sm">
                  {category.name}
                </h3>
                <ArrowRight className="size-3.5 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-brand-accent" />
              </div>
            </Link>
          ))}
        </Reveal>
      </section>

      {/* Full-Bleed Photographic Palate Cleanser */}
      <Reveal
        variant="image"
        className="h-[42vh] min-h-[280px] w-full overflow-hidden border-y border-border"
      >
        <img
          src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1800&q=85"
          alt="Ateliê AURA — alfaiataria em fibras naturais"
          loading="lazy"
          className="h-full w-full object-cover object-center"
        />
      </Reveal>

      {/* 3. Featured Products */}
      <section className="bg-background">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-[100px]">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div className="space-y-2">
              <p className="font-mono text-[10px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
                Edição Limitada
              </p>
              <h2 className="inline-block border-b-2 border-brand-accent pb-2 font-heading text-3xl leading-[1.05] font-bold tracking-[-0.03em] text-foreground uppercase sm:text-4xl lg:text-5xl">
                Seleção
              </h2>
            </div>

            <Link
              href="/produtos"
              className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.12em] text-foreground uppercase transition-colors hover:text-brand-accent"
            >
              <span>Ver todos</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <Reveal
            variant="grid"
            className="grid grid-cols-2 gap-[15px] lg:grid-cols-4"
          >
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </Reveal>
        </div>
      </section>

      {/* 4. Editorial Brand Manifesto + Newsletter */}
      <section className="border-t border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-[100px]">
          <div className="grid grid-cols-1 gap-[15px] lg:grid-cols-12 lg:items-stretch">
            {/* Brand Manifesto */}
            <div className="grid grid-cols-1 border border-border bg-card sm:grid-cols-12 lg:col-span-7">
              <Reveal
                variant="image"
                className="relative aspect-[4/3] overflow-hidden border-b border-border bg-background sm:col-span-5 sm:aspect-auto sm:border-r sm:border-b-0"
              >
                <img
                  src="https://images.unsplash.com/photo-1588271968087-4c51abe05afc?auto=format&fit=crop&w=900&q=80"
                  alt="Trama natural e acabamento artesanal da coleção AURA"
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </Reveal>

              <div className="flex flex-col justify-between space-y-6 p-6 sm:col-span-7 sm:p-10">
                <div className="space-y-3">
                  <p className="font-mono text-[10px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
                    Matéria-Prima
                  </p>
                  <h2 className="border-b-2 border-brand-accent pb-2 font-heading text-xl leading-[1.08] font-bold tracking-[-0.03em] text-foreground sm:text-2xl">
                    Feito no Brasil, pensado para durar.
                  </h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Cada peça une ateliês locais a fibras naturais selecionadas:
                    linho respirável, seda de caimento fluido e algodão pima.
                  </p>
                </div>

                <dl className="grid grid-cols-1 gap-3 border-t border-border pt-4">
                  {NATURAL_FIBERS.map((fiber) => (
                    <div key={fiber.name} className="space-y-0.5">
                      <dt className="text-xs font-semibold tracking-wider text-foreground uppercase">
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
                    className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.14em] text-foreground uppercase underline underline-offset-4 transition-colors hover:text-brand-accent"
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
