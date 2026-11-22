import type { ShippingQuote, StoreConfig } from "@/types";

export const storeConfig: StoreConfig = {
  brandName: "AURA",
  legalName: "Aura Studio Moda Contemporânea Ltda.",
  tagline: "Essencialismo e alfaiataria brasileira contemporânea.",
  description:
    "Alfaiataria contemporânea em linho, seda e algodão pima, produzida em pequenos lotes no Brasil.",
  logoText: "AURA",
  whatsappNumber: "5511999999999",
  whatsappDisplay: "(11) 99999-9999",
  supportEmail: "atendimento@aurastudio.com.br",
  instagramHandle: "@aurastudio.br",
  announcementBar:
    "FRETE GRÁTIS ACIMA DE R$ 399 • 5% OFF NO PIX • ATÉ 6X SEM JUROS",
  freeShippingThreshold: 399,
  pixDiscountPercent: 5,
  maxInstallments: 6,
  minInstallmentValue: 50,
  currency: "BRL",
  locale: "pt-BR",
  coupons: [
    {
      code: "BEMVINDO10",
      discountPercent: 10,
      description: "10% de desconto na primeira compra",
    },
    {
      code: "TECHFY15",
      discountPercent: 15,
      description: "15% de desconto especial Techfy",
    },
    {
      code: "FRETEGRATIS",
      discountPercent: 5,
      description: "5% OFF adicional para compensar o envio",
    },
  ],
  navLinks: [
    { label: "Início", href: "/" },
    { label: "Catálogo", href: "/produtos" },
    { label: "Alfaiataria", href: "/produtos?categoria=alfaiataria" },
    { label: "Vestidos", href: "/produtos?categoria=vestidos" },
    { label: "Tricot & Malhas", href: "/produtos?categoria=tricot-malhas" },
    { label: "Acessórios", href: "/produtos?categoria=acessorios" },
  ],
  benefits: [
    {
      title: "Frete Grátis",
      subtitle: "Nas compras acima de R$ 399",
    },
    {
      title: "5% OFF no Pix",
      subtitle: "Desconto imediato na finalização",
    },
    {
      title: "Até 6x Sem Juros",
      subtitle: "No cartão de crédito",
    },
    {
      title: "Primeira Troca Grátis",
      subtitle: "Até 7 dias após o recebimento",
    },
  ],
  theme: {
    canvas: "#F9F6F2",
    surface: "#ECECED",
    ink: "#0E0E0E",
    border: "#868686",
    brandAccent: "#892500",
    urgencyAccent: "#000aff",
  },
};

export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function getCartItemKey(productId: string, variantId?: string): string {
  return `${productId}:${variantId ?? "default"}`;
}

export function getPixPrice(
  price: number,
  discountPercent = storeConfig.pixDiscountPercent
): number {
  return Number((price * (1 - discountPercent / 100)).toFixed(2));
}

export function getDiscountPercentage(
  price: number,
  compareAtPrice?: number
): number | null {
  if (!compareAtPrice || compareAtPrice <= price) return null;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

export function getInstallmentInfo(
  price: number,
  maxInstallments = storeConfig.maxInstallments,
  minInstallmentValue = storeConfig.minInstallmentValue
): { count: number; value: number } {
  const maxByValue = Math.max(1, Math.floor(price / minInstallmentValue));
  const count = Math.min(maxInstallments, maxByValue);
  return {
    count,
    value: Number((price / count).toFixed(2)),
  };
}

export function calculateMockShipping(
  cep: string,
  subtotal = 0
): ShippingQuote[] {
  const cleanCep = cep.replace(/\D/g, "");
  const regionDigit = cleanCep.length > 0 ? Number(cleanCep[0]) : 0;
  const isSoutheast = regionDigit <= 3;
  const pacBase = isSoutheast ? 19.9 : 29.9;
  const sedexBase = isSoutheast ? 32.9 : 49.9;
  const freePac = subtotal >= storeConfig.freeShippingThreshold;

  return [
    {
      id: "pac",
      service: "PAC",
      name: "Envio Econômico (PAC)",
      price: freePac ? 0 : pacBase,
      estimatedDays: isSoutheast ? 5 : 9,
    },
    {
      id: "sedex",
      service: "SEDEX",
      name: "Envio Expresso (SEDEX)",
      price: sedexBase,
      estimatedDays: isSoutheast ? 2 : 4,
    },
  ];
}
