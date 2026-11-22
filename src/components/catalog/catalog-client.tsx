"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PackageSearch, Search, SlidersHorizontal, X } from "lucide-react";
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from "@/data/mock-products";
import { ProductCard } from "@/components/product/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type PriceRange = "all" | "under-300" | "300-450" | "over-450";
type SortOption = "featured" | "price-asc" | "price-desc" | "newest";

const SIZE_OPTIONS = ["PP", "P", "M", "G"] as const;

const PRICE_RANGE_OPTIONS: { value: PriceRange; label: string }[] = [
  { value: "all", label: "Todos os preços" },
  { value: "under-300", label: "Até R$ 300" },
  { value: "300-450", label: "R$ 300 a R$ 450" },
  { value: "over-450", label: "Acima de R$ 450" },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Destaques" },
  { value: "price-asc", label: "Menor Preço" },
  { value: "price-desc", label: "Maior Preço" },
  { value: "newest", label: "Novidades" },
];

const COLOR_SWATCHES: Record<string, string> = {
  Areia: "#D6C7B2",
  Preto: "#1C1917",
  "Off-White": "#F5F2EB",
  Terracota: "#B85D43",
  Oliva: "#5D6B4F",
};

function resolveValidCategory(slug: string | null): string {
  if (!slug) return "all";
  return MOCK_CATEGORIES.some((cat) => cat.slug === slug) ? slug : "all";
}

interface FilterPanelProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (slug: string) => void;
  selectedSize: string | null;
  onSizeChange: (size: string | null) => void;
  availableColors: string[];
  selectedColor: string | null;
  onColorChange: (color: string | null) => void;
  priceRange: PriceRange;
  onPriceRangeChange: (range: PriceRange) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  idPrefix: string;
}

function FilterPanel({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedSize,
  onSizeChange,
  availableColors,
  selectedColor,
  onColorChange,
  priceRange,
  onPriceRangeChange,
  hasActiveFilters,
  onClearFilters,
  idPrefix,
}: FilterPanelProps) {
  return (
    <div className="space-y-6">
      {/* Busca */}
      <div className="space-y-2">
        <label
          htmlFor={`${idPrefix}-search`}
          className="block text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase"
        >
          Buscar no catálogo
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id={`${idPrefix}-search`}
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Nome, tecido ou tag..."
            className="h-9 bg-background pl-8 pr-8 text-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Limpar busca"
              className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Categorias */}
      <div className="space-y-2.5 border-t pt-5">
        <h3 className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          Categorias
        </h3>
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => onCategoryChange("all")}
            className={cn(
              "flex items-center justify-between rounded-md px-2.5 py-1.5 text-left text-sm transition-colors",
              selectedCategory === "all"
                ? "bg-primary font-medium text-primary-foreground"
                : "text-foreground hover:bg-muted"
            )}
          >
            <span>Todas</span>
            <span
              className={cn(
                "text-xs",
                selectedCategory === "all"
                  ? "text-primary-foreground/80"
                  : "text-muted-foreground"
              )}
            >
              {MOCK_PRODUCTS.length}
            </span>
          </button>
          {MOCK_CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category.slug;
            const count = MOCK_PRODUCTS.filter(
              (p) => p.categorySlug === category.slug
            ).length;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => onCategoryChange(category.slug)}
                className={cn(
                  "flex items-center justify-between rounded-md px-2.5 py-1.5 text-left text-sm transition-colors",
                  isSelected
                    ? "bg-primary font-medium text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                )}
              >
                <span>{category.name}</span>
                <span
                  className={cn(
                    "text-xs",
                    isSelected
                      ? "text-primary-foreground/80"
                      : "text-muted-foreground"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tamanhos */}
      <div className="space-y-2.5 border-t pt-5">
        <h3 className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          Tamanho
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {SIZE_OPTIONS.map((size) => {
            const isSelected = selectedSize === size;
            return (
              <button
                key={size}
                type="button"
                onClick={() => onSizeChange(isSelected ? null : size)}
                aria-pressed={isSelected}
                className={cn(
                  "flex h-9 items-center justify-center rounded-md border text-xs font-medium transition-colors",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:border-foreground/40 hover:bg-muted/60"
                )}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cores */}
      <div className="space-y-2.5 border-t pt-5">
        <h3 className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          Cor
        </h3>
        <div className="flex flex-wrap gap-2">
          {availableColors.map((color) => {
            const isSelected = selectedColor === color;
            const swatch = COLOR_SWATCHES[color] ?? "#A8A29E";
            return (
              <button
                key={color}
                type="button"
                onClick={() => onColorChange(isSelected ? null : color)}
                aria-pressed={isSelected}
                className={cn(
                  "inline-flex items-center gap-2 rounded-none border px-3 py-1.5 text-xs font-medium transition-colors",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:border-foreground/40 hover:bg-muted/60"
                )}
              >
                <span
                  aria-hidden="true"
                  className="size-3 rounded-none border border-black/15"
                  style={{ backgroundColor: swatch }}
                />
                <span>{color}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Faixa de Preço */}
      <div className="space-y-2.5 border-t pt-5">
        <h3 className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          Faixa de Preço
        </h3>
        <div className="flex flex-col gap-1">
          {PRICE_RANGE_OPTIONS.map((option) => {
            const isSelected = priceRange === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onPriceRangeChange(option.value)}
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-left text-sm transition-colors",
                  isSelected
                    ? "bg-primary font-medium text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Limpar Filtros */}
      {hasActiveFilters && (
        <div className="border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClearFilters}
            className="w-full"
          >
            Limpar filtros
          </Button>
        </div>
      )}
    </div>
  );
}

export function CatalogClient() {
  const searchParams = useSearchParams();

  const paramCategory = searchParams.get("categoria");
  const paramQuery = searchParams.get("q") ?? "";
  const paramKey = `${paramCategory ?? ""}\u0000${paramQuery}`;

  const [syncedParamKey, setSyncedParamKey] = useState(paramKey);
  const [searchQuery, setSearchQuery] = useState(paramQuery);
  const [selectedCategory, setSelectedCategory] = useState(() =>
    resolveValidCategory(paramCategory)
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<PriceRange>("all");
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  if (syncedParamKey !== paramKey) {
    setSyncedParamKey(paramKey);
    setSelectedCategory(resolveValidCategory(paramCategory));
    setSearchQuery(paramQuery);
  }

  const availableColors = useMemo(() => {
    const colors = new Set<string>();
    for (const product of MOCK_PRODUCTS) {
      for (const variant of product.variants ?? []) {
        const cor = variant.attributes.Cor;
        if (cor) colors.add(cor);
      }
    }
    return Array.from(colors).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, []);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const filtered = MOCK_PRODUCTS.filter((product) => {
      if (selectedCategory !== "all" && product.categorySlug !== selectedCategory) {
        return false;
      }

      if (q) {
        const matchesQuery =
          product.name.toLowerCase().includes(q) ||
          product.description.toLowerCase().includes(q) ||
          (product.shortDescription?.toLowerCase().includes(q) ?? false) ||
          product.categoryName.toLowerCase().includes(q) ||
          (product.tags?.some((tag) => tag.toLowerCase().includes(q)) ?? false);

        if (!matchesQuery) return false;
      }

      if (selectedSize) {
        const hasSize =
          product.variants?.some(
            (v) => v.attributes.Tamanho === selectedSize && v.stock > 0
          ) ?? false;
        if (!hasSize) return false;
      }

      if (selectedColor) {
        const hasColor =
          product.variants?.some((v) => v.attributes.Cor === selectedColor) ??
          false;
        if (!hasColor) return false;
      }

      if (priceRange === "under-300" && product.price >= 300) return false;
      if (
        priceRange === "300-450" &&
        (product.price < 300 || product.price > 450)
      ) {
        return false;
      }
      if (priceRange === "over-450" && product.price <= 450) return false;

      return true;
    });

    const sorted = [...filtered];
    switch (sortBy) {
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        sorted.sort(
          (a, b) => Number(Boolean(b.isNew)) - Number(Boolean(a.isNew))
        );
        break;
      case "featured":
      default:
        sorted.sort(
          (a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured))
        );
        break;
    }

    return sorted;
  }, [
    searchQuery,
    selectedCategory,
    selectedSize,
    selectedColor,
    priceRange,
    sortBy,
  ]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedCategory !== "all" ||
    selectedSize !== null ||
    selectedColor !== null ||
    priceRange !== "all";

  function clearAllFilters() {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedSize(null);
    setSelectedColor(null);
    setPriceRange("all");
  }

  const activeCategoryObj = MOCK_CATEGORIES.find(
    (cat) => cat.slug === selectedCategory
  );

  const activeFilterChips: { key: string; label: string; onRemove: () => void }[] =
    [];

  if (searchQuery.trim() !== "") {
    activeFilterChips.push({
      key: "search",
      label: `Busca: "${searchQuery.trim()}"`,
      onRemove: () => setSearchQuery(""),
    });
  }
  if (activeCategoryObj) {
    activeFilterChips.push({
      key: "category",
      label: `Categoria: ${activeCategoryObj.name}`,
      onRemove: () => setSelectedCategory("all"),
    });
  }
  if (selectedSize) {
    activeFilterChips.push({
      key: "size",
      label: `Tamanho: ${selectedSize}`,
      onRemove: () => setSelectedSize(null),
    });
  }
  if (selectedColor) {
    activeFilterChips.push({
      key: "color",
      label: `Cor: ${selectedColor}`,
      onRemove: () => setSelectedColor(null),
    });
  }
  if (priceRange !== "all") {
    const priceLabel =
      PRICE_RANGE_OPTIONS.find((opt) => opt.value === priceRange)?.label ?? "";
    activeFilterChips.push({
      key: "price",
      label: priceLabel,
      onRemove: () => setPriceRange("all"),
    });
  }

  const activeSortLabel =
    SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label ?? "Destaques";

  const productCountLabel =
    filteredProducts.length === 1
      ? "1 peça encontrada"
      : `${filteredProducts.length} peças encontradas`;

  const filterPanelProps = {
    searchQuery,
    onSearchChange: setSearchQuery,
    selectedCategory,
    onCategoryChange: setSelectedCategory,
    selectedSize,
    onSizeChange: setSelectedSize,
    availableColors,
    selectedColor,
    onColorChange: setSelectedColor,
    priceRange,
    onPriceRangeChange: setPriceRange,
    hasActiveFilters,
    onClearFilters: clearAllFilters,
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      {/* Cabeçalho da Página */}
      <div className="mb-8 border-b pb-6">
        <p className="text-[10px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
          Coleção AURA
        </p>
        <h1 className="mt-2 text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
          {activeCategoryObj ? activeCategoryObj.name : "Catálogo Completo"}
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
          {activeCategoryObj
            ? activeCategoryObj.description
            : "Alfaiataria em linho puro, seda, algodão egípcio e acessórios em couro legítimo."}
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10">
        {/* Sidebar Desktop */}
        <aside className="hidden lg:block" aria-label="Filtros do catálogo">
          <div className="sticky top-28 rounded-lg border bg-card p-5">
            <FilterPanel {...filterPanelProps} idPrefix="desktop" />
          </div>
        </aside>

        {/* Conteúdo Principal */}
        <div className="min-w-0">
          {/* Barra Superior: Mobile Filter + Contagem + Ordenação */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden"
              >
                <SlidersHorizontal className="size-4" />
                <span>Filtrar</span>
                {activeFilterChips.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 px-1.5 text-[10px]">
                    {activeFilterChips.length}
                  </Badge>
                )}
              </Button>

              <p className="text-sm text-muted-foreground">
                {productCountLabel}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden text-xs text-muted-foreground sm:inline">
                Ordenar por:
              </span>
              <Select
                value={sortBy}
                onValueChange={(value) => {
                  if (value) {
                    setSortBy(value as SortOption);
                  }
                }}
              >
                <SelectTrigger
                  aria-label="Ordenar produtos"
                  className="h-8 min-w-40 bg-background text-xs sm:text-sm"
                >
                  <SelectValue>{activeSortLabel}</SelectValue>
                </SelectTrigger>
                <SelectContent align="end">
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Chips de Filtros Ativos */}
          {activeFilterChips.length > 0 && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              {activeFilterChips.map((chip) => (
                <Badge
                  key={chip.key}
                  variant="secondary"
                  className="gap-1.5 py-1 pr-1.5 pl-2.5 text-xs font-normal"
                >
                  <span>{chip.label}</span>
                  <button
                    type="button"
                    onClick={chip.onRemove}
                    aria-label={`Remover filtro ${chip.label}`}
                    className="inline-flex size-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background/80 hover:text-foreground"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-xs font-medium text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
              >
                Limpar filtros
              </button>
            </div>
          )}

          {/* Grade de Produtos ou Estado Vazio */}
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 px-6 py-16 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <PackageSearch className="size-6" />
              </div>
              <h2 className="mt-4 text-base font-medium text-foreground">
                Nenhuma peça encontrada
              </h2>
              <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
                Não encontramos produtos com os filtros selecionados. Tente
                ajustar a busca ou limpar os filtros ativos.
              </p>
              <Button
                type="button"
                onClick={clearAllFilters}
                className="mt-6"
              >
                Limpar Filtros
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-3">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sheet de Filtros Mobile */}
      <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <SheetContent
          side="left"
          className="w-[86vw] max-w-sm overflow-y-auto p-0"
        >
          <SheetHeader className="border-b px-5 py-4">
            <SheetTitle className="text-sm font-semibold tracking-[0.14em] uppercase">
              Filtrar Catálogo
            </SheetTitle>
          </SheetHeader>
          <div className="p-5">
            <FilterPanel {...filterPanelProps} idPrefix="mobile" />
            <div className="mt-6 border-t pt-4">
              <Button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full"
              >
                Ver {productCountLabel}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
}
