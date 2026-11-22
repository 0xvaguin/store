"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Check,
  ChevronRight,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import {
  calculateMockShipping,
  formatBRL,
  getDiscountPercentage,
  getInstallmentInfo,
  getPixPrice,
  storeConfig,
} from "@/config/store.config";
import { useCartStore } from "@/store/use-cart";
import type { Product, ProductVariant, ShippingQuote } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductCard } from "@/components/product/product-card";
import { SizeGuideModal } from "@/components/product/size-guide-modal";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

interface PdpClientProps {
  product: Product;
  relatedProducts: Product[];
}

interface AttributeGroup {
  name: string;
  values: string[];
}

function extractAttributeGroups(variants: ProductVariant[]): AttributeGroup[] {
  const map = new Map<string, Set<string>>();

  for (const variant of variants) {
    for (const [key, value] of Object.entries(variant.attributes)) {
      if (!map.has(key)) {
        map.set(key, new Set());
      }
      map.get(key)!.add(value);
    }
  }

  return Array.from(map.entries()).map(([name, set]) => ({
    name,
    values: Array.from(set),
  }));
}

function getInitialAttributes(variants?: ProductVariant[]): Record<string, string> {
  if (!variants || variants.length === 0) return {};
  const firstInStock = variants.find((v) => v.stock > 0) ?? variants[0];
  return { ...firstInStock.attributes };
}

function formatCepMask(rawValue: string): string {
  const digits = rawValue.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function PdpClient({ product, relatedProducts }: PdpClientProps) {
  const addItem = useCartStore((state) => state.addItem);
  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const storedCep = useCartStore((state) => state.cep);
  const storedShipping = useCartStore((state) => state.selectedShipping);
  const setStoredCep = useCartStore((state) => state.setCep);
  const setStoredShipping = useCartStore((state) => state.setSelectedShipping);

  const hasVariants = Boolean(product.variants && product.variants.length > 0);
  const attributeGroups = useMemo(
    () => (product.variants ? extractAttributeGroups(product.variants) : []),
    [product.variants]
  );

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string>
  >(() => getInitialAttributes(product.variants));
  const [quantity, setQuantity] = useState(1);

  const [cepDraft, setCepDraft] = useState<string | null>(null);
  const [cepError, setCepError] = useState<string | null>(null);
  const [shippingQuotes, setShippingQuotes] = useState<ShippingQuote[] | null>(
    null
  );
  const cepInput = cepDraft ?? (hasHydrated ? storedCep : "");

  const ctaContainerRef = useRef<HTMLDivElement>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

  const selectedVariant = useMemo(() => {
    if (!hasVariants || !product.variants) return undefined;
    return product.variants.find((variant) =>
      Object.entries(selectedAttributes).every(
        ([key, val]) => variant.attributes[key] === val
      )
    );
  }, [hasVariants, product.variants, selectedAttributes]);

  const availableStock = hasVariants
    ? (selectedVariant?.stock ?? 0)
    : product.stock;
  const isOutOfStock = availableStock <= 0;

  const activePrice = selectedVariant?.priceOverride ?? product.price;
  const discountPercent = getDiscountPercentage(
    activePrice,
    product.compareAtPrice
  );
  const pixPrice = getPixPrice(activePrice);
  const installments = getInstallmentInfo(activePrice);

  const activeImage =
    product.images[activeImageIndex] ?? product.images[0] ?? "";
  const activeSku = selectedVariant?.sku ?? product.id.toUpperCase();
  const effectiveQuantity =
    availableStock <= 0 ? 1 : Math.min(quantity, availableStock);

  // Sticky mobile bar visibility via IntersectionObserver on main CTA
  useEffect(() => {
    const target = ctaContainerRef.current;
    if (!target || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyBar(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  function getOptionAvailability(groupName: string, value: string): {
    exists: boolean;
    inStock: boolean;
  } {
    if (!product.variants) return { exists: false, inStock: false };

    const groupIndex = attributeGroups.findIndex((g) => g.name === groupName);

    // Primary attribute (e.g. Cor): check if any variant with this value has stock
    if (groupIndex === 0) {
      const matching = product.variants.filter(
        (v) => v.attributes[groupName] === value
      );
      return {
        exists: matching.length > 0,
        inStock: matching.some((v) => v.stock > 0),
      };
    }

    // Secondary attributes (e.g. Tamanho): check combination with earlier selected attributes
    const candidateAttrs: Record<string, string> = {
      ...selectedAttributes,
      [groupName]: value,
    };
    const exactMatch = product.variants.find((v) =>
      Object.entries(candidateAttrs).every(
        ([k, val]) => v.attributes[k] === val
      )
    );

    return {
      exists: Boolean(exactMatch),
      inStock: Boolean(exactMatch && exactMatch.stock > 0),
    };
  }

  function handleSelectAttribute(groupName: string, value: string) {
    if (!product.variants) return;

    const nextCandidate: Record<string, string> = {
      ...selectedAttributes,
      [groupName]: value,
    };

    const exactInStock = product.variants.find(
      (v) =>
        v.stock > 0 &&
        Object.entries(nextCandidate).every(
          ([k, val]) => v.attributes[k] === val
        )
    );

    if (exactInStock) {
      setSelectedAttributes({ ...exactInStock.attributes });
      return;
    }

    // Fallback to first in-stock variant that has the chosen attribute value
    const fallbackInStock = product.variants.find(
      (v) => v.stock > 0 && v.attributes[groupName] === value
    );
    if (fallbackInStock) {
      setSelectedAttributes({ ...fallbackInStock.attributes });
      return;
    }

    // Otherwise fallback to any variant matching the attribute value
    const anyMatch = product.variants.find(
      (v) => v.attributes[groupName] === value
    );
    if (anyMatch) {
      setSelectedAttributes({ ...anyMatch.attributes });
    }
  }

  function handleDecrement() {
    setQuantity((prev) => Math.max(1, Math.min(prev, Math.max(1, availableStock)) - 1));
  }

  function handleIncrement() {
    setQuantity((prev) =>
      Math.min(Math.max(1, availableStock), Math.min(prev, Math.max(1, availableStock)) + 1)
    );
  }

  function handleAddToCart() {
    if (isOutOfStock) {
      toast.error("Esta opção está esgotada no momento.");
      return;
    }

    const res = addItem(
      product,
      hasVariants ? selectedVariant : undefined,
      effectiveQuantity
    );
    if (res.success) {
      toast.success(`${product.name} adicionado à sacola.`);
    } else {
      toast.error(res.message);
    }
  }

  function handleCalculateShipping(e: React.FormEvent) {
    e.preventDefault();
    const cleanCep = cepInput.replace(/\D/g, "");
    if (cleanCep.length !== 8) {
      setCepError("Digite um CEP válido com 8 dígitos.");
      setShippingQuotes(null);
      return;
    }

    const formatted = formatCepMask(cleanCep);
    setCepError(null);
    setCepDraft(null);
    setStoredCep(formatted);
    const quotes = calculateMockShipping(
      cleanCep,
      activePrice * effectiveQuantity
    );
    setShippingQuotes(quotes);
    const matchingExisting = quotes.find((q) => q.id === storedShipping?.id);
    setStoredShipping(matchingExisting ?? quotes[0] ?? null);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 pb-24 sm:px-6 sm:py-10 md:pb-14 lg:px-8">
      {/* Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"
      >
        <Link href="/" className="transition-colors hover:text-foreground">
          Início
        </Link>
        <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" />
        <Link
          href="/produtos"
          className="transition-colors hover:text-foreground"
        >
          Catálogo
        </Link>
        <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" />
        <Link
          href={`/produtos?categoria=${product.categorySlug}`}
          className="transition-colors hover:text-foreground"
        >
          {product.categoryName}
        </Link>
        <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" />
        <span
          aria-current="page"
          className="truncate font-medium text-foreground"
        >
          {product.name}
        </span>
      </nav>

      {/* Main Product Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
        {/* Image Gallery */}
        <div className="lg:col-span-7">
          <div className="flex flex-col gap-3 sm:flex-row-reverse sm:gap-4">
            {/* Main Image */}
            <Reveal
              variant="image"
              className="relative aspect-[3/4] w-full flex-1 overflow-hidden rounded-none border border-border bg-card"
            >
              {activeImage && (
                <img
                  src={activeImage}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              )}
            </Reveal>

            {/* Thumbnail Strip */}
            {product.images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1 sm:w-20 sm:flex-col sm:overflow-x-visible sm:pb-0">
                {product.images.map((imageUrl, idx) => {
                  const isActive = idx === activeImageIndex;
                  return (
                    <button
                      key={`${imageUrl}-${idx}`}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      aria-label={`Ver imagem ${idx + 1} de ${product.name}`}
                      aria-pressed={isActive}
                      className={cn(
                        "relative aspect-[3/4] w-16 shrink-0 overflow-hidden rounded-none border bg-muted transition-all sm:w-full",
                        isActive
                          ? "border-brand-accent"
                          : "border-border opacity-75 hover:opacity-100"
                      )}
                    >
                      <img
                        src={imageUrl}
                        alt={`${product.name} - miniatura ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Product Info & Purchase Column */}
        <div className="flex flex-col lg:col-span-5">
          {/* Category, Status & SKU */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2.5">
              <span className="font-semibold tracking-[0.12em] uppercase">
                {product.categoryName}
              </span>
              {isOutOfStock ? (
                <Badge variant="destructive">Esgotado</Badge>
              ) : discountPercent !== null ? (
                <Badge className="bg-foreground text-background">
                  -{discountPercent}%
                </Badge>
              ) : product.isNew ? (
                <Badge variant="cobalt">NOVO</Badge>
              ) : null}
            </div>
            <span className="font-mono text-[11px]">SKU: {activeSku}</span>
          </div>

          {/* Title */}
          <h1 className="mt-2 font-heading text-2xl leading-[1.06] font-bold tracking-[-0.03em] text-foreground sm:text-3xl">
            {product.name}
          </h1>

          {product.shortDescription && (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {product.shortDescription}
            </p>
          )}

          {/* Pricing Block */}
          <div className="mt-5 space-y-2 border-y py-5">
            <div className="flex flex-wrap items-baseline gap-2.5">
              <span className="font-mono text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {formatBRL(activePrice)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > activePrice && (
                <span className="font-mono text-sm text-muted-foreground line-through">
                  {formatBRL(product.compareAtPrice)}
                </span>
              )}
              {discountPercent !== null && (
                <span className="text-xs font-semibold text-[var(--brand-accent)]">
                  Economize <span className="font-mono">{discountPercent}%</span>
                </span>
              )}
            </div>

            {/* Highlighted Pix Box */}
            <div className="flex items-center gap-2.5 rounded-none border border-[var(--brand-accent)]/40 bg-[var(--brand-accent)]/8 px-3.5 py-2.5">
              <Sparkles className="size-4 shrink-0 text-[var(--brand-accent)]" />
              <p className="text-sm font-semibold text-[var(--brand-accent)]">
                <span className="font-mono">{formatBRL(pixPrice)}</span> no Pix —{" "}
                <span className="font-mono">{storeConfig.pixDiscountPercent}%</span>{" "}
                OFF
              </p>
            </div>

            <p className="text-xs text-muted-foreground">
              ou até{" "}
              <strong className="font-mono font-bold text-foreground">
                {installments.count}x de {formatBRL(installments.value)}
              </strong>{" "}
              sem juros no cartão de crédito
            </p>
          </div>

          {/* Variant Selectors */}
          {hasVariants && attributeGroups.length > 0 && (
            <div className="mt-5 space-y-4">
              {attributeGroups.map((group) => {
                const isSizeGroup = group.name.toLowerCase() === "tamanho";
                const currentVal = selectedAttributes[group.name];

                return (
                  <div key={group.name} className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium tracking-wider text-foreground uppercase">
                        {group.name}:{" "}
                        <span className="font-normal text-muted-foreground normal-case">
                          {currentVal}
                        </span>
                      </span>
                      {isSizeGroup && (
                        <SizeGuideModal
                          modelagem={product.specifications?.Modelagem}
                        />
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {group.values.map((val) => {
                        const isSelected = currentVal === val;
                        const { exists, inStock } = getOptionAvailability(
                          group.name,
                          val
                        );
                        const isUnavailable = !exists || !inStock;

                        return (
                          <button
                            key={val}
                            type="button"
                            disabled={isUnavailable}
                            onClick={() => handleSelectAttribute(group.name, val)}
                            aria-pressed={isSelected}
                            title={isUnavailable ? "Esgotado" : val}
                            className={cn(
                              "relative inline-flex min-w-[2.75rem] items-center justify-center rounded-none border px-3.5 py-2 text-xs font-semibold transition-all",
                              isSelected && !isUnavailable
                                ? "border-foreground bg-primary text-primary-foreground"
                                : !isUnavailable
                                  ? "border-border bg-background text-foreground hover:border-foreground/60 hover:bg-muted/50"
                                  : "cursor-not-allowed border-border/60 bg-muted/40 text-muted-foreground/60 line-through opacity-65"
                            )}
                          >
                            <span>{val}</span>
                            {isUnavailable && (
                              <span className="sr-only"> (Esgotado)</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Stock Status */}
          <div className="mt-4 flex items-center gap-2 text-xs">
            {isOutOfStock ? (
              <span className="font-medium text-destructive">
                Esgotado no momento
              </span>
            ) : !hasVariants ? (
              <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-400">
                <Check className="size-3.5" />
                Em estoque — <span className="font-mono">{product.stock}</span> unidades
                {product.stock <= 4 && (
                  <span className="text-[var(--brand-accent)]">
                    (Últimas <span className="font-mono">{product.stock}</span> unidades!)
                  </span>
                )}
              </span>
            ) : availableStock <= 4 ? (
              <span className="font-semibold text-[var(--brand-accent)]">
                Últimas <span className="font-mono">{availableStock}</span>{" "}
                {availableStock === 1 ? "unidade!" : "unidades!"}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-400">
                <Check className="size-3.5" />
                Em estoque (<span className="font-mono">{availableStock}</span>)
              </span>
            )}
          </div>

          {/* Quantity Stepper + Primary CTA */}
          <div
            ref={ctaContainerRef}
            className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <div className="inline-flex h-11 items-center justify-between rounded-none border border-border bg-background px-1 sm:w-32">
              <button
                type="button"
                onClick={handleDecrement}
                disabled={isOutOfStock || effectiveQuantity <= 1}
                aria-label="Diminuir quantidade"
                className="inline-flex size-9 items-center justify-center rounded-none text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
              >
                <Minus className="size-4" />
              </button>
              <span
                aria-live="polite"
                className="min-w-8 text-center font-mono text-sm font-bold tabular-nums"
              >
                {effectiveQuantity}
              </span>
              <button
                type="button"
                onClick={handleIncrement}
                disabled={isOutOfStock || effectiveQuantity >= availableStock}
                aria-label="Aumentar quantidade"
                className="inline-flex size-9 items-center justify-center rounded-none text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
              >
                <Plus className="size-4" />
              </button>
            </div>

            <Button
              type="button"
              variant="cobalt"
              size="lg"
              data-testid="add-to-cart-button"
              disabled={isOutOfStock}
              onClick={handleAddToCart}
              className="h-11 flex-1 gap-2 text-xs font-semibold tracking-[0.12em] uppercase"
            >
              <ShoppingBag className="size-4" />
              <span>
                {isOutOfStock ? "Produto Esgotado" : "Adicionar à Sacola"}
              </span>
            </Button>
          </div>

          {/* Mocked CEP Shipping Estimator */}
          <div className="mt-6 rounded-none border border-border bg-card p-4">
            <div className="mb-2.5 flex items-center gap-2 text-xs font-semibold tracking-wider text-foreground uppercase">
              <Truck className="size-4 text-[var(--brand-accent)]" />
              <span>Calcular Frete e Prazo</span>
            </div>

            <form
              onSubmit={handleCalculateShipping}
              className="flex items-center gap-2"
            >
              <Input
                type="text"
                inputMode="numeric"
                value={cepInput}
                onChange={(e) => {
                  setCepDraft(formatCepMask(e.target.value));
                  if (cepError) setCepError(null);
                }}
                placeholder="00000-000"
                maxLength={9}
                aria-label="CEP para cálculo de frete"
                className="h-9 flex-1 font-mono text-sm"
              />
              <Button type="submit" variant="outline" className="h-9 px-4">
                Calcular
              </Button>
            </form>

            {cepError && (
              <p className="mt-2 text-xs text-destructive">{cepError}</p>
            )}

            {shippingQuotes && (
              <div className="mt-3 space-y-2">
                {shippingQuotes.map((quote) => {
                  const isSelected = storedShipping?.id === quote.id;
                  return (
                    <button
                      key={quote.id}
                      type="button"
                      onClick={() => setStoredShipping(quote)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-none border bg-background px-3 py-2.5 text-left text-xs transition-colors",
                        isSelected
                          ? "border-primary"
                          : "hover:border-foreground/50"
                      )}
                    >
                      <div>
                        <p className="font-semibold text-foreground">
                          {quote.name}
                        </p>
                        <p className="text-muted-foreground">
                          Entrega em até {quote.estimatedDays} dias úteis
                        </p>
                      </div>
                      <span
                        className={cn(
                          "font-mono font-bold",
                          quote.price === 0
                            ? "text-emerald-700 dark:text-emerald-400"
                            : "text-foreground"
                        )}
                      >
                        {quote.price === 0 ? "Grátis" : formatBRL(quote.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            <p className="mt-2.5 text-[11px] text-muted-foreground">
              Frete PAC grátis nas compras acima de{" "}
              <span className="font-mono font-medium text-foreground">
                {formatBRL(storeConfig.freeShippingThreshold)}
              </span>
              .
            </p>
          </div>

          {/* Trust Micro-signals */}
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 rounded-none border border-border bg-card px-3 py-2">
              <RotateCcw className="size-4 shrink-0 text-foreground" />
              <span>1ª troca grátis em até 7 dias</span>
            </div>
            <div className="flex items-center gap-2 rounded-none border border-border bg-card px-3 py-2">
              <ShieldCheck className="size-4 shrink-0 text-foreground" />
              <span>Compra 100% segura</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <section className="mt-12 border-t pt-10">
        <Tabs defaultValue="descricao" className="w-full">
          <TabsList
            variant="line"
            className="w-full justify-start gap-6 border-b bg-transparent p-0"
          >
            <TabsTrigger
              value="descricao"
              className="rounded-none px-1 pb-3 text-xs font-semibold tracking-wider uppercase"
            >
              Descrição
            </TabsTrigger>
            <TabsTrigger
              value="especificacoes"
              className="rounded-none px-1 pb-3 text-xs font-semibold tracking-wider uppercase"
            >
              Especificações
            </TabsTrigger>
            <TabsTrigger
              value="trocas"
              className="rounded-none px-1 pb-3 text-xs font-semibold tracking-wider uppercase"
            >
              Trocas e Devoluções
            </TabsTrigger>
          </TabsList>

          <TabsContent value="descricao" className="pt-6">
            <div className="max-w-3xl space-y-4 text-sm leading-relaxed text-muted-foreground">
              <p className="text-foreground">{product.description}</p>
              {product.shortDescription && <p>{product.shortDescription}</p>}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {product.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-[11px] uppercase"
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="especificacoes" className="pt-6">
            {product.specifications &&
            Object.keys(product.specifications).length > 0 ? (
              <div className="max-w-2xl overflow-hidden rounded-none border border-border">
                <dl className="divide-y text-sm">
                  {Object.entries(product.specifications).map(([key, val]) => (
                    <div
                      key={key}
                      className="grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-3 sm:gap-4"
                    >
                      <dt className="font-medium text-foreground">{key}</dt>
                      <dd className="text-muted-foreground sm:col-span-2">
                        {val}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Peça confeccionada com padrões exclusivos de acabamento{" "}
                {storeConfig.brandName}.
              </p>
            )}
          </TabsContent>

          <TabsContent value="trocas" className="pt-6">
            <div className="max-w-3xl space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p className="font-medium text-foreground">
                Política de Trocas e Devoluções — {storeConfig.brandName}
              </p>
              <p>
                Você pode solicitar a troca ou devolução de qualquer peça em até{" "}
                <strong className="text-foreground">7 dias corridos</strong>{" "}
                após o recebimento do pedido, conforme o Código de Defesa do
                Consumidor. A primeira troca é totalmente gratuita.
              </p>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>
                  A peça deve estar sem sinais de uso, lavagem ou ajustes e com
                  a etiqueta original fixada.
                </li>
                <li>
                  Para iniciar o processo, entre em contato pelo e-mail{" "}
                  <span className="font-medium text-foreground">
                    {storeConfig.supportEmail}
                  </span>{" "}
                  ou WhatsApp{" "}
                  <span className="font-medium text-foreground">
                    {storeConfig.whatsappDisplay}
                  </span>
                  .
                </li>
                <li>
                  O estorno ou vale-compras é processado em até 5 dias úteis após
                  o recebimento e conferência em nosso ateliê.
                </li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-14 border-t pt-10">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <span className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
                Curadoria {storeConfig.brandName}
              </span>
              <h2 className="mt-1 font-heading text-xl leading-[1.08] font-bold tracking-[-0.03em] text-foreground sm:text-2xl">
                Você também pode gostar
              </h2>
            </div>
            <Link
              href="/produtos"
              className="text-xs font-medium tracking-wider text-muted-foreground uppercase underline underline-offset-4 transition-colors hover:text-foreground"
            >
              Ver catálogo
            </Link>
          </div>

          <Reveal
            variant="grid"
            className="grid grid-cols-2 gap-[15px] lg:grid-cols-4"
          >
            {relatedProducts.map((related) => (
              <ProductCard key={related.id} product={related} />
            ))}
          </Reveal>
        </section>
      )}

      {/* Sticky Mobile Buy Bar */}
      {showStickyBar && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background px-4 py-3 md:hidden">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-foreground">
                {product.name}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-sm font-bold text-foreground">
                  {formatBRL(activePrice)}
                </span>
                <span className="text-[11px] font-medium text-[var(--brand-accent)]">
                  <span className="font-mono font-bold">
                    {formatBRL(pixPrice)}
                  </span>{" "}
                  no Pix
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="cobalt"
              size="lg"
              disabled={isOutOfStock}
              onClick={handleAddToCart}
              className="h-10 shrink-0 px-5 text-xs font-semibold tracking-wider uppercase"
            >
              {isOutOfStock ? "Esgotado" : "Comprar"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
