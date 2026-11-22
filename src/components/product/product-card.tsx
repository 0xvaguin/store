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
    <article className={cn("group flex flex-col", className)}>
      <Link
        href={`/produtos/${product.slug}`}
        className="relative aspect-[3/4] w-full overflow-hidden rounded-none bg-muted"
      >
        <img
          src={primaryImage}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-all duration-500 group-hover:scale-[1.03]"
        />
        {secondaryImage !== primaryImage && (
          <img
            src={secondaryImage}
            alt={`${product.name} - vista alternativa`}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}

        {/* Single Subtle Badge */}
        <div className="absolute top-2.5 left-2.5">
          {isOutOfStock ? (
            <Badge
              variant="destructive"
              className="rounded-none px-2 py-0.5 text-[10px] tracking-wider uppercase"
            >
              Esgotado
            </Badge>
          ) : discountPercent !== null ? (
            <Badge className="rounded-none bg-foreground px-2 py-0.5 text-[10px] tracking-wider text-background uppercase">
              -{discountPercent}%
            </Badge>
          ) : product.isNew ? (
            <Badge
              variant="secondary"
              className="rounded-none bg-background/95 px-2 py-0.5 text-[10px] tracking-wider text-foreground uppercase backdrop-blur"
            >
              NOVO
            </Badge>
          ) : null}
        </div>

        {/* Quick Add on Hover */}
        {!isOutOfStock && (
          <button
            type="button"
            onClick={handleQuickAdd}
            className="absolute right-2.5 bottom-2.5 left-2.5 flex h-9 translate-y-1 items-center justify-center gap-1.5 rounded-none bg-background/95 px-3 text-[11px] font-medium tracking-[0.14em] text-foreground uppercase opacity-0 transition-all duration-200 hover:bg-primary hover:text-primary-foreground group-hover:translate-y-0 group-hover:opacity-100"
          >
            <ShoppingBag className="size-3.5" />
            <span>{hasVariants ? "Compra Rápida" : "Adicionar"}</span>
          </button>
        )}
      </Link>

      <div className="mt-3 flex flex-1 flex-col space-y-1">
        <Link
          href={`/produtos/${product.slug}`}
          className="line-clamp-1 text-xs font-normal tracking-wide text-foreground transition-colors hover:text-muted-foreground sm:text-sm"
        >
          {product.name}
        </Link>

        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium tracking-tight text-foreground">
            {formatBRL(product.price)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-xs text-muted-foreground line-through">
              {formatBRL(product.compareAtPrice)}
            </span>
          )}
        </div>

        <p className="text-[11px] text-muted-foreground">
          {formatBRL(pixPrice)} no Pix · até {installments.count}x
        </p>
      </div>
    </article>
  );
}
