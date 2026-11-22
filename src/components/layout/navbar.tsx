"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { formatBRL, storeConfig } from "@/config/store.config";
import { MOCK_PRODUCTS } from "@/data/mock-products";
import { selectCartTotalItems, useCartStore } from "@/store/use-cart";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const items = useCartStore((state) => state.items);
  const setCartOpen = useCartStore((state) => state.setIsOpen);
  const totalItems = hasHydrated ? selectCartTotalItems(items) : 0;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return MOCK_PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q) ||
        p.tags?.some((tag) => tag.toLowerCase().includes(q))
    ).slice(0, 5);
  }, [searchQuery]);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
      {/* Announcement Bar */}
      <div className="bg-primary px-4 py-2 text-center text-[11px] font-medium tracking-[0.14em] text-primary-foreground uppercase">
        {storeConfig.announcementBar}
      </div>

      {/* Main Header */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Mobile Menu Trigger + Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Abrir menu de navegação"
            className="inline-flex size-9 items-center justify-center rounded-none text-foreground transition-colors hover:bg-muted md:hidden"
          >
            <Menu className="size-5" />
          </button>

          <Link
            href="/"
            className="text-xl font-semibold tracking-[0.22em] text-foreground uppercase transition-opacity hover:opacity-80 sm:text-2xl"
          >
            {storeConfig.logoText}
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav
          aria-label="Navegação principal"
          className="hidden items-center gap-5 md:flex lg:gap-7"
        >
          {storeConfig.navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs font-medium tracking-[0.1em] text-muted-foreground uppercase transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions: Live Search + Cart */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div ref={searchContainerRef} className="relative">
            <div className="hidden items-center md:flex">
              <div className="relative w-44 lg:w-60">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  value={searchQuery}
                  onFocus={() => setSearchOpen(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchOpen(true);
                  }}
                  placeholder="Buscar peças..."
                  aria-label="Buscar peças"
                  className="h-9 rounded-none bg-muted/50 pl-8 pr-7 text-xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label="Limpar busca"
                    className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSearchOpen((prev) => !prev)}
              aria-label="Buscar produtos"
              className="inline-flex size-9 items-center justify-center rounded-none text-foreground transition-colors hover:bg-muted md:hidden"
            >
              <Search className="size-5" />
            </button>

            {/* Live Search Dropdown */}
            {searchOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-none border bg-popover p-3 shadow-lg sm:w-80">
                <div className="mb-2 md:hidden">
                  <Input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar peças, categorias..."
                    autoFocus
                    className="h-9 rounded-none text-sm"
                  />
                </div>

                {searchQuery.trim() === "" ? (
                  <p className="py-3 text-center text-xs text-muted-foreground">
                    Digite para buscar por nome, tecido ou categoria.
                  </p>
                ) : searchResults.length === 0 ? (
                  <div className="py-4 text-center">
                    <p className="text-xs text-muted-foreground">
                      Nenhuma peça encontrada para &ldquo;{searchQuery}&rdquo;.
                    </p>
                    <Link
                      href="/produtos"
                      onClick={() => setSearchOpen(false)}
                      className="mt-2 inline-block text-xs font-medium text-foreground underline underline-offset-4"
                    >
                      Ver todo o catálogo
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {searchResults.map((product) => (
                      <Link
                        key={product.id}
                        href={`/produtos/${product.slug}`}
                        onClick={() => {
                          setSearchOpen(false);
                          setSearchQuery("");
                        }}
                        className="flex items-center gap-3 rounded-md p-1.5 transition-colors hover:bg-muted"
                      >
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="size-12 rounded object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium text-foreground">
                            {product.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {product.categoryName}
                          </p>
                          <p className="text-xs font-semibold text-foreground">
                            {formatBRL(product.price)}
                          </p>
                        </div>
                      </Link>
                    ))}
                    <Link
                      href={`/produtos?q=${encodeURIComponent(searchQuery.trim())}`}
                      onClick={() => setSearchOpen(false)}
                      className="mt-1 border-t pt-2 text-center text-xs font-medium text-foreground hover:underline"
                    >
                      Ver todos os resultados
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cart Drawer Trigger */}
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            aria-label={`Abrir sacola de compras (${totalItems} itens)`}
            data-testid="navbar-cart-button"
            className="relative inline-flex h-9 items-center gap-2 rounded-none border border-transparent px-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <ShoppingBag className="size-5" />
            <span className="hidden text-xs font-medium tracking-wider uppercase md:inline">
              Sacola
            </span>
            <span
              data-testid="navbar-cart-count"
              className="inline-flex min-w-5 items-center justify-center rounded-none bg-primary px-1.5 py-0.5 text-[10px] font-medium leading-none text-primary-foreground"
            >
              {totalItems}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-[82vw] max-w-xs">
          <SheetHeader className="border-b pb-4">
            <SheetTitle className="tracking-[0.2em] uppercase">
              {storeConfig.logoText}
            </SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-1 p-4">
            {storeConfig.navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto border-t p-4 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">Atendimento WhatsApp</p>
            <p className="mt-1">{storeConfig.whatsappDisplay}</p>
            <p className="mt-0.5">{storeConfig.supportEmail}</p>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
