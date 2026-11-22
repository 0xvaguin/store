"use client";

import { useState } from "react";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Tag, Trash2, Truck, X } from "lucide-react";
import { formatBRL, getPixPrice, storeConfig } from "@/config/store.config";
import {
  selectCartDiscount,
  selectCartSubtotal,
  selectCartTotalItems,
  useCartStore,
} from "@/store/use-cart";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function CartDrawer() {
  const [couponInput, setCouponInput] = useState("");
  const [couponFeedback, setCouponFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const rawItems = useCartStore((state) => state.items);
  const isOpen = useCartStore((state) => state.isOpen);
  const rawCouponCode = useCartStore((state) => state.couponCode);
  const rawDiscountPercent = useCartStore((state) => state.discountPercent);
  const setIsOpen = useCartStore((state) => state.setIsOpen);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const applyCoupon = useCartStore((state) => state.applyCoupon);
  const removeCoupon = useCartStore((state) => state.removeCoupon);

  const items = hasHydrated ? rawItems : [];
  const couponCode = hasHydrated ? rawCouponCode : null;
  const discountPercent = hasHydrated ? rawDiscountPercent : 0;

  const totalItems = selectCartTotalItems(items);
  const subtotal = selectCartSubtotal(items);
  const discount = selectCartDiscount(subtotal, discountPercent);
  const totalAfterDiscount = Math.max(0, subtotal - discount);
  const pixTotal = getPixPrice(totalAfterDiscount);

  const threshold = storeConfig.freeShippingThreshold;
  const remainingForFreeShipping = Math.max(0, threshold - subtotal);
  const shippingProgress = Math.min(100, Math.round((subtotal / threshold) * 100));

  function handleApplyCoupon(e: React.FormEvent) {
    e.preventDefault();
    const res = applyCoupon(couponInput);
    setCouponFeedback({
      type: res.success ? "success" : "error",
      text: res.message,
    });
    if (res.success) {
      setCouponInput("");
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent
        side="right"
        data-lenis-prevent
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle className="flex items-center gap-2 text-base font-semibold tracking-wide uppercase">
            <ShoppingBag className="size-4" />
            <span>
              Sua Sacola (<span className="font-mono">{totalItems}</span>)
            </span>
          </SheetTitle>
        </SheetHeader>

        {/* Free Shipping Progress Bar */}
        <div className="border-b bg-secondary/40 px-5 py-3">
          <div className="mb-1.5 flex items-center gap-2 text-xs font-medium">
            <Truck className="size-4 shrink-0 text-[var(--brand-accent)]" />
            {remainingForFreeShipping > 0 ? (
              <span>
                Faltam{" "}
                <strong className="font-mono text-foreground">
                  {formatBRL(remainingForFreeShipping)}
                </strong>{" "}
                para você ganhar <strong>Frete Grátis</strong>!
              </span>
            ) : (
              <span className="text-emerald-700 dark:text-emerald-400">
                Parabéns! Você ganhou <strong>Frete Grátis</strong> nesta
                compra.
              </span>
            )}
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-none bg-border">
            <div
              className="h-full bg-[var(--brand-accent)] transition-all duration-300"
              style={{ width: `${shippingProgress}%` }}
            />
          </div>
        </div>

        {/* Cart Items */}
        <div
          data-lenis-prevent
          className="flex-1 overflow-y-auto px-5 py-4"
        >
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex size-14 items-center justify-center rounded-none border border-border bg-muted">
                <ShoppingBag className="size-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                Sua sacola está vazia
              </p>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                Explore nossa coleção minimalista e descubra peças em linho,
                seda e alfaiataria.
              </p>
              <Link
                href="/produtos"
                onClick={() => setIsOpen(false)}
                className={cn(buttonVariants({ variant: "default" }), "mt-5")}
              >
                Explorar Catálogo
              </Link>
            </div>
          ) : (
            <ul className="divide-y">
              {items.map((item) => (
                <li key={item.key} className="flex gap-4 py-4 first:pt-0">
                  <Link
                    href={`/produtos/${item.slug}`}
                    onClick={() => setIsOpen(false)}
                    className="h-24 w-20 shrink-0 overflow-hidden rounded-none border border-border bg-muted"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          href={`/produtos/${item.slug}`}
                          onClick={() => setIsOpen(false)}
                          className="line-clamp-1 text-sm font-semibold text-foreground hover:underline"
                        >
                          {item.name}
                        </Link>
                        {item.attributes &&
                          Object.keys(item.attributes).length > 0 && (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {Object.entries(item.attributes)
                                .map(([k, v]) => `${k}: ${v}`)
                                .join(" • ")}
                            </p>
                          )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.key)}
                        aria-label={`Remover ${item.name}`}
                        className="text-muted-foreground transition-colors hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="inline-flex items-center rounded-none border border-border">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.key, item.quantity - 1)
                          }
                          aria-label="Diminuir quantidade"
                          className="inline-flex size-7 items-center justify-center text-muted-foreground hover:text-foreground"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="min-w-7 text-center font-mono text-xs font-bold">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          disabled={item.quantity >= item.maxStock}
                          onClick={() =>
                            updateQuantity(item.key, item.quantity + 1)
                          }
                          aria-label="Aumentar quantidade"
                          className="inline-flex size-7 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="font-mono text-sm font-bold text-foreground">
                          {formatBRL(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer Summary + Coupon + Checkout CTA */}
        {items.length > 0 && (
          <SheetFooter className="border-t bg-background px-5 py-4">
            {/* Coupon Form */}
            <div className="mb-3">
              {couponCode ? (
                <div className="flex items-center justify-between rounded-none border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs">
                  <div className="flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-400">
                    <Tag className="size-3.5" />
                    <span>
                      Cupom <strong>{couponCode}</strong> ({discountPercent}%
                      OFF)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      removeCoupon();
                      setCouponFeedback(null);
                    }}
                    aria-label="Remover cupom"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <Input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Cupom (ex: BEMVINDO10)"
                    aria-label="Código de cupom"
                    className="h-9 text-xs uppercase"
                  />
                  <Button type="submit" variant="outline" size="sm" className="h-9">
                    Aplicar
                  </Button>
                </form>
              )}
              {couponFeedback && !couponCode && (
                <p
                  className={cn(
                    "mt-1 text-[11px]",
                    couponFeedback.type === "error"
                      ? "text-destructive"
                      : "text-emerald-700"
                  )}
                >
                  {couponFeedback.text}
                </p>
              )}
            </div>

            {/* Totals */}
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-mono text-foreground">
                  {formatBRL(subtotal)}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 dark:text-emerald-400">
                  <span>Desconto ({couponCode})</span>
                  <span className="font-mono">-{formatBRL(discount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 font-semibold text-foreground">
                <span>Total estimado</span>
                <span className="font-mono font-bold">
                  {formatBRL(totalAfterDiscount)}
                </span>
              </div>
              <p className="text-right text-xs font-medium text-[var(--brand-accent)]">
                ou{" "}
                <span className="font-mono font-bold">
                  {formatBRL(pixTotal)}
                </span>{" "}
                no Pix ({storeConfig.pixDiscountPercent}% OFF)
              </p>
            </div>

            <Link
              href="/checkout"
              onClick={() => setIsOpen(false)}
              className={cn(
                buttonVariants({ variant: "cobalt", size: "lg" }),
                "mt-2 h-11 w-full text-xs font-semibold tracking-widest uppercase"
              )}
            >
              Finalizar Compra
            </Link>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
