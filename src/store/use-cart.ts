"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getCartItemKey, storeConfig } from "@/config/store.config";
import type { CartItem, Product, ProductVariant, ShippingQuote } from "@/types";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  couponCode: string | null;
  discountPercent: number;
  cep: string;
  selectedShipping: ShippingQuote | null;
  hasHydrated: boolean;

  addItem: (
    product: Product,
    variant?: ProductVariant,
    quantity?: number
  ) => { success: boolean; message: string };
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  setIsOpen: (open: boolean) => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  setCep: (cep: string) => void;
  setSelectedShipping: (quote: ShippingQuote | null) => void;
  setHasHydrated: (hydrated: boolean) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      couponCode: null,
      discountPercent: 0,
      cep: "",
      selectedShipping: null,
      hasHydrated: false,

      addItem: (product, variant, quantity = 1) => {
        const maxStock = variant ? variant.stock : product.stock;
        if (maxStock <= 0) {
          return {
            success: false,
            message: "Esta opção está esgotada no momento.",
          };
        }

        const key = getCartItemKey(product.id, variant?.id);
        const unitPrice = variant?.priceOverride ?? product.price;
        const currentItems = get().items;
        const existing = currentItems.find((item) => item.key === key);

        if (existing) {
          const nextQty = Math.min(existing.quantity + quantity, maxStock);
          if (nextQty === existing.quantity) {
            set({ isOpen: true });
            return {
              success: false,
              message: `Quantidade máxima em estoque atingida (${maxStock} un.).`,
            };
          }
          set({
            items: currentItems.map((item) =>
              item.key === key
                ? { ...item, quantity: nextQty, maxStock, price: unitPrice }
                : item
            ),
            isOpen: true,
          });
          return {
            success: true,
            message: "Quantidade atualizada na sacola.",
          };
        }

        const newItem: CartItem = {
          key,
          productId: product.id,
          variantId: variant?.id,
          slug: product.slug,
          name: product.name,
          image: product.images[0] ?? "",
          price: unitPrice,
          compareAtPrice: product.compareAtPrice,
          quantity: Math.min(quantity, maxStock),
          maxStock,
          attributes: variant?.attributes,
        };

        set({
          items: [...currentItems, newItem],
          isOpen: true,
        });

        return {
          success: true,
          message: "Produto adicionado à sacola!",
        };
      },

      removeItem: (key) => {
        set((state) => ({
          items: state.items.filter((item) => item.key !== key),
        }));
      },

      updateQuantity: (key, quantity) => {
        if (quantity <= 0) {
          get().removeItem(key);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.key === key
              ? { ...item, quantity: Math.min(quantity, item.maxStock) }
              : item
          ),
        }));
      },

      clearCart: () => {
        set({
          items: [],
          couponCode: null,
          discountPercent: 0,
          selectedShipping: null,
        });
      },

      setIsOpen: (open) => {
        set({ isOpen: open });
      },

      applyCoupon: (rawCode) => {
        const normalized = rawCode.trim().toUpperCase();
        if (!normalized) {
          return { success: false, message: "Digite um código de cupom." };
        }
        const found = storeConfig.coupons.find(
          (c) => c.code.toUpperCase() === normalized
        );
        if (!found) {
          return {
            success: false,
            message: "Cupom inválido. Tente BEMVINDO10 ou TECHFY15.",
          };
        }
        set({
          couponCode: found.code,
          discountPercent: found.discountPercent,
        });
        return {
          success: true,
          message: `Cupom ${found.code} aplicado (${found.discountPercent}% OFF).`,
        };
      },

      removeCoupon: () => {
        set({ couponCode: null, discountPercent: 0 });
      },

      setCep: (cep) => {
        set({ cep });
      },

      setSelectedShipping: (selectedShipping) => {
        set({ selectedShipping });
      },

      setHasHydrated: (hasHydrated) => {
        set({ hasHydrated });
      },
    }),
    {
      name: "techfy-store-cart",
      partialize: (state) => ({
        items: state.items,
        couponCode: state.couponCode,
        discountPercent: state.discountPercent,
        cep: state.cep,
        selectedShipping: state.selectedShipping,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export function selectCartTotalItems(items: CartItem[]): number {
  return items.reduce((acc, item) => acc + item.quantity, 0);
}

export function selectCartSubtotal(items: CartItem[]): number {
  return Number(
    items
      .reduce((acc, item) => acc + item.price * item.quantity, 0)
      .toFixed(2)
  );
}

export function selectCartDiscount(
  subtotal: number,
  discountPercent: number
): number {
  if (discountPercent <= 0) return 0;
  return Number(((subtotal * discountPercent) / 100).toFixed(2));
}
