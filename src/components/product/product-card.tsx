"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import {
  formatBRL,
  getDiscountPercentage,
  getInstallmentInfo,
  getPixPrice,
} from "@/config/store.config";
import { useCartStore } from "@/store/use-cart";
import type { Product } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  const primaryImage = product.images[0];
  const secondaryImage = product.images[1] ?? primaryImage;
  const discountPercent = getDiscountPercentage(
    product.price,
    product.compareAtPrice
  );
  const pixPrice = getPixPrice(product.price);
  const installments = getInstallmentInfo(product.price);
  const hasVariants = Boolean(product.variants && product.variants.length > 0);
  const isOutOfStock = hasVariants
    ? product.variants!.every((v) => v.stock <= 0)
    : product.stock <= 0;

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (hasVariants) {
      const firstInStock = product.variants?.find((v) => v.stock > 0);
      if (!firstInStock) {
        toast.error("Produto esgotado no momento.");
        return;
      }
      const res = addItem(product, firstInStock, 1);
      if (res.success) {
        toast.success(`${product.name} adicionado à sacola.`);
      } else {
        toast.error(res.message);
      }
      return;
    }

    const res = addItem(product, undefined, 1);
    if (res.success) {
      toast.success(`${product.name} adicionado à sacola.`);
    } else {
      toast.error(res.message);
    }
  }

  return (
    <article
      className={cn(
        "group flex flex-col rounded-none border border-border bg-card transition-transform duration-100 ease-out active:scale-[0.98]",
        className
      )}
    >
      <Link
        href={`/produtos/${product.slug}`}
        className="relative aspect-[3/4] w-full overflow-hidden rounded-none border-b border-border bg-background"
      >
        <img
          src={primaryImage}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {secondaryImage !== primaryImage && (
          <img
            src={secondaryImage}
            alt={`${product.name} - vista alternativa`}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-[15px] p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
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

        <Link
          href={`/produtos/${product.slug}`}
          className="line-clamp-1 text-xs font-semibold tracking-normal text-foreground transition-colors hover:text-brand-accent sm:text-sm"
        >
          {product.name}
        </Link>

        <div className="mt-auto space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-sm font-bold tracking-tight text-foreground">
              {formatBRL(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="font-mono text-xs text-muted-foreground line-through">
                {formatBRL(product.compareAtPrice)}
              </span>
            )}
          </div>

          <p className="text-[11px] text-muted-foreground">
            <span className="font-mono font-bold text-foreground">
              {formatBRL(pixPrice)}
            </span>{" "}
            no Pix · até {installments.count}x
          </p>
        </div>
      </div>

      {!isOutOfStock && (
        <button
          type="button"
          onClick={handleQuickAdd}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-none border-t border-border bg-card px-3 text-[11px] font-semibold tracking-[0.12em] text-foreground uppercase transition-[transform,color,background-color] duration-100 ease-out active:scale-[0.98] hover:bg-cobalt hover:text-cobalt-foreground"
        >
          <ShoppingBag className="size-3.5" />
          <span>{hasVariants ? "Compra Rápida" : "Adicionar"}</span>
        </button>
      )}
    </article>
  );
}
