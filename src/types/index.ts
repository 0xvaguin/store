export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  featured?: boolean;
}

export interface ProductVariant {
  id: string;
  sku: string;
  attributes: Record<string, string>;
  stock: number;
  priceOverride?: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  categoryId: string;
  categorySlug: string;
  categoryName: string;
  tags?: string[];
  featured?: boolean;
  isNew?: boolean;
  stock: number;
  variants?: ProductVariant[];
  specifications?: Record<string, string>;
  createdAt?: string;
}

export interface CartItem {
  key: string; // `${productId}:${variantId ?? 'default'}`
  productId: string;
  variantId?: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  compareAtPrice?: number;
  quantity: number;
  maxStock: number;
  attributes?: Record<string, string>;
}

export interface Coupon {
  code: string;
  discountPercent: number;
  description: string;
}

export interface ShippingQuote {
  id: string;
  service: "PAC" | "SEDEX";
  name: string;
  price: number;
  estimatedDays: number;
}

export interface CustomerInfo {
  fullName: string;
  email: string;
  whatsapp: string;
  cpf: string;
}

export interface ShippingAddress {
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

export type PaymentMethodType = "pix" | "credit_card";

export interface OrderPayload {
  id?: string;
  customer: CustomerInfo;
  address: ShippingAddress;
  shipping: ShippingQuote;
  items: CartItem[];
  paymentMethod: PaymentMethodType;
  subtotal: number;
  discount: number;
  shippingCost: number;
  pixDiscount: number;
  total: number;
  couponCode?: string;
  status: "pending" | "paid" | "failed";
  externalPaymentId?: string; // Phase 3: Mercado Pago / Asaas ID
  createdAt: string;
}

export interface StoreConfig {
  brandName: string;
  legalName: string;
  tagline: string;
  description: string;
  logoText: string;
  whatsappNumber: string;
  whatsappDisplay: string;
  supportEmail: string;
  instagramHandle: string;
  announcementBar: string;
  freeShippingThreshold: number;
  pixDiscountPercent: number;
  maxInstallments: number;
  minInstallmentValue: number;
  currency: "BRL";
  locale: "pt-BR";
  coupons: Coupon[];
  navLinks: { label: string; href: string }[];
  benefits: { title: string; subtitle: string }[];
  theme: {
    canvas: string;
    surface: string;
    ink: string;
    border: string;
    brandAccent: string;
    urgencyAccent: string;
  };
}
