"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  CreditCard,
  Lock,
  MapPin,
  Package,
  QrCode,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tag,
  Truck,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  calculateMockShipping,
  formatBRL,
  getInstallmentInfo,
  getPixPrice,
  storeConfig,
} from "@/config/store.config";
import {
  selectCartDiscount,
  selectCartSubtotal,
  selectCartTotalItems,
  useCartStore,
} from "@/store/use-cart";
import type {
  CustomerInfo,
  OrderPayload,
  PaymentMethodType,
  ShippingAddress,
  ShippingQuote,
} from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type CheckoutStep = 1 | 2 | 3;

interface CreditCardForm {
  number: string;
  holderName: string;
  expiry: string;
  cvv: string;
  installments: number;
}

const BRAZILIAN_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

function maskPhone(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function maskCPF(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function maskCEP(value: string): string {
  const digits = onlyDigits(value).slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function maskCardNumber(value: string): string {
  const digits = onlyDigits(value).slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

function maskExpiry(value: string): string {
  const digits = onlyDigits(value).slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function maskCVV(value: string): string {
  return onlyDigits(value).slice(0, 4);
}

interface MockCepResult {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

function lookupMockCEP(rawCep: string): MockCepResult {
  const digits = onlyDigits(rawCep);
  if (digits.startsWith("01")) {
    return {
      street: "Av. Paulista",
      neighborhood: "Bela Vista",
      city: "São Paulo",
      state: "SP",
    };
  }
  const prefix = digits[0] ?? "0";
  const presets: Record<string, MockCepResult> = {
    "0": {
      street: "Rua Oscar Freire",
      neighborhood: "Jardins",
      city: "São Paulo",
      state: "SP",
    },
    "1": {
      street: "Av. Barão de Itapura",
      neighborhood: "Guanabara",
      city: "Campinas",
      state: "SP",
    },
    "2": {
      street: "Av. Atlântica",
      neighborhood: "Copacabana",
      city: "Rio de Janeiro",
      state: "RJ",
    },
    "3": {
      street: "Av. Afonso Pena",
      neighborhood: "Centro",
      city: "Belo Horizonte",
      state: "MG",
    },
    "4": {
      street: "Av. Sete de Setembro",
      neighborhood: "Barra",
      city: "Salvador",
      state: "BA",
    },
    "5": {
      street: "Av. Boa Viagem",
      neighborhood: "Boa Viagem",
      city: "Recife",
      state: "PE",
    },
    "6": {
      street: "Av. Beira Mar",
      neighborhood: "Meireles",
      city: "Fortaleza",
      state: "CE",
    },
    "7": {
      street: "SQS 308 Bloco A",
      neighborhood: "Asa Sul",
      city: "Brasília",
      state: "DF",
    },
    "8": {
      street: "Av. do Batel",
      neighborhood: "Batel",
      city: "Curitiba",
      state: "PR",
    },
    "9": {
      street: "Rua Padre Chagas",
      neighborhood: "Moinhos de Vento",
      city: "Porto Alegre",
      state: "RS",
    },
  };
  return presets[prefix] ?? presets["0"];
}

function createOrderId(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `TF-${num}`;
}

function generateMockPixCode(order: OrderPayload): string {
  const amount = order.total.toFixed(2);
  const idClean = (order.id ?? "TF0000").replace(/[^A-Z0-9]/gi, "");
  return `00020126580014BR.GOV.BCB.PIX0136pix@aurastudio.com.br5204000053039865406${amount}5802BR5911AURA STUDIO6009SAO PAULO62110507${idClean}6304A1B2`;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-destructive">{message}</p>;
}

function StepBadge({
  step,
  label,
  activeStep,
  completed,
  onSelect,
}: {
  step: CheckoutStep;
  label: string;
  activeStep: CheckoutStep;
  completed: boolean;
  onSelect: (step: CheckoutStep) => void;
}) {
  const isActive = activeStep === step;
  const canNavigate = completed && !isActive;

  return (
    <button
      type="button"
      disabled={!canNavigate}
      onClick={() => canNavigate && onSelect(step)}
      className={cn(
        "flex items-center gap-2 text-left transition-colors",
        canNavigate ? "cursor-pointer hover:opacity-80" : "cursor-default"
      )}
    >
      <span
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
          isActive &&
            "border-primary bg-primary text-primary-foreground",
          completed &&
            !isActive &&
            "border-emerald-600 bg-emerald-600 text-white",
          !isActive &&
            !completed &&
            "border-border bg-muted text-muted-foreground"
        )}
      >
        {completed && !isActive ? <Check className="size-3.5" /> : step}
      </span>
      <span
        className={cn(
          "text-xs font-medium tracking-wide uppercase sm:text-sm sm:normal-case sm:tracking-normal",
          isActive
            ? "text-foreground"
            : completed
              ? "text-foreground"
              : "text-muted-foreground"
        )}
      >
        {step}. {label}
      </span>
    </button>
  );
}

function MockPixQrSvg() {
  const pattern = [
    1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1,
    1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 1,
    1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1,
    1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 1, 1, 0, 1,
    1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1,
    1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1,
    1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1,
    0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0,
    1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0,
    0, 1, 0, 1, 1, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1,
    1, 1, 0, 0, 1, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0,
    1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 0, 1, 1,
    1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 1, 0, 0,
    1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1,
    1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1,
    1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1,
  ];
  const size = 19;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="size-40 rounded-lg border bg-white p-3 text-zinc-900"
      role="img"
      aria-label="QR Code Pix para pagamento"
    >
      {pattern.map((cell, idx) => {
        if (!cell) return null;
        const x = idx % size;
        const y = Math.floor(idx / size);
        return (
          <rect
            key={idx}
            x={x}
            y={y}
            width={1}
            height={1}
            fill="currentColor"
          />
        );
      })}
    </svg>
  );
}

export function CheckoutClient() {
  const hasHydrated = useCartStore((state) => state.hasHydrated);

  const items = useCartStore((state) => state.items);
  const couponCode = useCartStore((state) => state.couponCode);
  const discountPercent = useCartStore((state) => state.discountPercent);
  const storedCep = useCartStore((state) => state.cep);
  const storedShipping = useCartStore((state) => state.selectedShipping);
  const applyCoupon = useCartStore((state) => state.applyCoupon);
  const removeCoupon = useCartStore((state) => state.removeCoupon);
  const setStoredCep = useCartStore((state) => state.setCep);
  const setStoredShipping = useCartStore((state) => state.setSelectedShipping);
  const clearCart = useCartStore((state) => state.clearCart);

  // Checkout navigation & summary collapse
  const [activeStep, setActiveStep] = useState<CheckoutStep>(1);
  const [completedSteps, setCompletedSteps] = useState<{
    step1: boolean;
    step2: boolean;
  }>({ step1: false, step2: false });
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [couponFeedback, setCouponFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Step 1: Customer info
  const [customer, setCustomer] = useState<CustomerInfo>({
    fullName: "",
    email: "",
    whatsapp: "",
    cpf: "",
  });
  const [step1Errors, setStep1Errors] = useState<
    Partial<Record<keyof CustomerInfo, string>>
  >({});

  // Step 2: Shipping address & quote
  const [syncedStoredCep, setSyncedStoredCep] = useState(false);
  const [address, setAddress] = useState<ShippingAddress>({
    cep: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
  });
  const [cepSearched, setCepSearched] = useState(false);
  const [selectedShippingId, setSelectedShippingId] = useState<string>("pac");
  const [step2Errors, setStep2Errors] = useState<
    Partial<Record<keyof ShippingAddress | "shipping", string>>
  >({});

  // Hydrate CEP and selected shipping from Zustand store once rehydrated
  if (hasHydrated && !syncedStoredCep) {
    setSyncedStoredCep(true);
    const digits = onlyDigits(storedCep);
    if (digits.length === 8) {
      const found = lookupMockCEP(digits);
      setAddress((prev) => ({
        ...prev,
        cep: maskCEP(digits),
        street: prev.street || found.street,
        neighborhood: prev.neighborhood || found.neighborhood,
        city: prev.city || found.city,
        state: prev.state || found.state,
      }));
      setCepSearched(true);
    }
    if (storedShipping?.id) {
      setSelectedShippingId(storedShipping.id);
    }
  }

  // Step 3: Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("pix");
  const [card, setCard] = useState<CreditCardForm>({
    number: "",
    holderName: "",
    expiry: "",
    cvv: "",
    installments: 1,
  });
  const [step3Errors, setStep3Errors] = useState<
    Partial<Record<keyof CreditCardForm, string>>
  >({});

  // Confirmed order
  const [confirmedOrder, setConfirmedOrder] = useState<OrderPayload | null>(
    null
  );
  const [confirmedInstallments, setConfirmedInstallments] = useState<number>(1);

  const totalItems = selectCartTotalItems(items);
  const subtotal = selectCartSubtotal(items);
  const discount = selectCartDiscount(subtotal, discountPercent);
  const subtotalAfterCoupon = Math.max(
    0,
    Number((subtotal - discount).toFixed(2))
  );

  // Reactive shipping quotes whenever a valid 8-digit CEP is present
  const cepDigits = onlyDigits(address.cep);
  const shippingQuotes = useMemo<ShippingQuote[]>(() => {
    if (cepDigits.length !== 8) return [];
    return calculateMockShipping(cepDigits, subtotalAfterCoupon);
  }, [cepDigits, subtotalAfterCoupon]);

  const selectedShipping = useMemo<ShippingQuote | null>(() => {
    if (shippingQuotes.length === 0) return null;
    return (
      shippingQuotes.find((q) => q.id === selectedShippingId) ??
      shippingQuotes[0]
    );
  }, [shippingQuotes, selectedShippingId]);

  const shippingCost = selectedShipping ? selectedShipping.price : 0;
  const totalBeforePix = Number((subtotalAfterCoupon + shippingCost).toFixed(2));
  const pixDiscount =
    paymentMethod === "pix"
      ? Number(
          (subtotalAfterCoupon - getPixPrice(subtotalAfterCoupon)).toFixed(2)
        )
      : 0;
  const finalTotal = Number((totalBeforePix - pixDiscount).toFixed(2));

  const installmentInfo = getInstallmentInfo(totalBeforePix);
  const installmentOptions = useMemo(() => {
    const count = Math.max(1, installmentInfo.count);
    return Array.from({ length: count }, (_, idx) => {
      const n = idx + 1;
      return {
        count: n,
        value: Number((totalBeforePix / n).toFixed(2)),
      };
    });
  }, [installmentInfo.count, totalBeforePix]);

  const effectiveInstallments = Math.min(
    card.installments,
    installmentOptions.length
  );

  function handleCepLookup(rawCep: string, showToast = false) {
    const digits = onlyDigits(rawCep);
    if (digits.length !== 8) {
      setStep2Errors((prev) => ({
        ...prev,
        cep: "Informe um CEP válido com 8 dígitos.",
      }));
      return;
    }

    const found = lookupMockCEP(digits);
    const formattedCep = maskCEP(digits);
    setAddress((prev) => ({
      ...prev,
      cep: formattedCep,
      street: found.street,
      neighborhood: found.neighborhood,
      city: found.city,
      state: found.state,
    }));
    setStoredCep(formattedCep);
    const quotes = calculateMockShipping(digits, subtotalAfterCoupon);
    const matchedQuote =
      quotes.find((q) => q.id === selectedShippingId) ?? quotes[0] ?? null;
    setStoredShipping(matchedQuote);
    setCepSearched(true);
    setStep2Errors((prev) => ({
      ...prev,
      cep: undefined,
      street: undefined,
      neighborhood: undefined,
      city: undefined,
      state: undefined,
      shipping: undefined,
    }));

    if (showToast) {
      toast.success(`Endereço encontrado para ${maskCEP(digits)}.`);
    }
  }

  function handleCepChange(value: string) {
    const masked = maskCEP(value);
    setAddress((prev) => ({ ...prev, cep: masked }));
    setStep2Errors((prev) => ({ ...prev, cep: undefined }));

    if (onlyDigits(masked).length === 8) {
      handleCepLookup(masked, false);
    }
  }

  function validateStep1(): boolean {
    const errors: Partial<Record<keyof CustomerInfo, string>> = {};
    const nameParts = customer.fullName.trim().split(/\s+/).filter(Boolean);
    if (nameParts.length < 2 || customer.fullName.trim().length < 4) {
      errors.fullName = "Informe seu nome e sobrenome.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim())) {
      errors.email = "Informe um e-mail válido.";
    }
    const phoneDigits = onlyDigits(customer.whatsapp);
    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      errors.whatsapp = "Informe um WhatsApp válido com DDD.";
    }
    const cpfDigits = onlyDigits(customer.cpf);
    if (cpfDigits.length !== 11) {
      errors.cpf = "Informe um CPF válido com 11 dígitos.";
    }

    setStep1Errors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleContinueStep1(e: React.FormEvent) {
    e.preventDefault();
    if (!validateStep1()) return;
    setCompletedSteps((prev) => ({ ...prev, step1: true }));
    setActiveStep(2);
  }

  function validateStep2(): boolean {
    const errors: Partial<Record<keyof ShippingAddress | "shipping", string>> =
      {};
    if (onlyDigits(address.cep).length !== 8) {
      errors.cep = "Informe um CEP válido com 8 dígitos.";
    }
    if (address.street.trim().length < 2) {
      errors.street = "Informe o logradouro (rua/avenida).";
    }
    if (!address.number.trim()) {
      errors.number = "Informe o número.";
    }
    if (address.neighborhood.trim().length < 2) {
      errors.neighborhood = "Informe o bairro.";
    }
    if (address.city.trim().length < 2) {
      errors.city = "Informe a cidade.";
    }
    if (address.state.trim().length !== 2) {
      errors.state = "Selecione a UF.";
    }
    if (!selectedShipping) {
      errors.shipping = "Selecione uma opção de frete.";
    }

    setStep2Errors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleContinueStep2(e: React.FormEvent) {
    e.preventDefault();
    if (!validateStep2()) return;
    setCompletedSteps((prev) => ({ ...prev, step2: true }));
    setActiveStep(3);
  }

  function validateStep3(): boolean {
    if (paymentMethod === "pix") {
      setStep3Errors({});
      return true;
    }

    const errors: Partial<Record<keyof CreditCardForm, string>> = {};
    const cardDigits = onlyDigits(card.number);
    if (cardDigits.length < 13 || cardDigits.length > 16) {
      errors.number = "Número do cartão inválido.";
    }
    if (card.holderName.trim().length < 3) {
      errors.holderName = "Informe o nome impresso no cartão.";
    }
    const expiryDigits = onlyDigits(card.expiry);
    if (expiryDigits.length !== 4) {
      errors.expiry = "Informe a validade no formato MM/AA.";
    } else {
      const month = Number(expiryDigits.slice(0, 2));
      if (month < 1 || month > 12) {
        errors.expiry = "Mês de validade inválido.";
      }
    }
    const cvvDigits = onlyDigits(card.cvv);
    if (cvvDigits.length < 3 || cvvDigits.length > 4) {
      errors.cvv = "CVV deve ter 3 ou 4 dígitos.";
    }

    setStep3Errors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleSubmitOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!validateStep1()) {
      setActiveStep(1);
      toast.error("Verifique seus dados pessoais antes de finalizar.");
      return;
    }
    if (!validateStep2() || !selectedShipping) {
      setActiveStep(2);
      toast.error("Verifique o endereço e o frete antes de finalizar.");
      return;
    }
    if (!validateStep3()) return;

    const payload: OrderPayload = {
      id: createOrderId(),
      customer: {
        ...customer,
        fullName: customer.fullName.trim(),
        email: customer.email.trim(),
      },
      address: {
        ...address,
        street: address.street.trim(),
        number: address.number.trim(),
        complement: address.complement?.trim() || undefined,
        neighborhood: address.neighborhood.trim(),
        city: address.city.trim(),
        state: address.state.trim().toUpperCase(),
      },
      shipping: selectedShipping,
      items: [...items],
      paymentMethod,
      subtotal,
      discount,
      shippingCost,
      pixDiscount,
      total: finalTotal,
      couponCode: couponCode ?? undefined,
      status: paymentMethod === "pix" ? "pending" : "paid",
      createdAt: new Date().toISOString(),
    };

    setConfirmedInstallments(effectiveInstallments);
    setConfirmedOrder(payload);
    clearCart();
    toast.success("Pedido realizado com sucesso!");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleApplyCoupon(e: React.FormEvent) {
    e.preventDefault();
    const res = applyCoupon(couponInput);
    setCouponFeedback({
      type: res.success ? "success" : "error",
      text: res.message,
    });
    if (res.success) {
      setCouponInput("");
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  }

  function handleCopyPixCode(code: string) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    toast.success("Código Pix copiado para a área de transferência!");
  }

  // Hydration loading state
  if (!hasHydrated) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-7">
            <div className="h-8 w-56 animate-pulse rounded-md bg-muted" />
            <div className="h-64 animate-pulse rounded-xl border bg-card" />
          </div>
          <div className="lg:col-span-5">
            <div className="h-80 animate-pulse rounded-xl border bg-card" />
          </div>
        </div>
      </div>
    );
  }

  // Empty cart state (when no order has been confirmed)
  if (items.length === 0 && !confirmedOrder) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
        <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-muted">
          <ShoppingBag className="size-7 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Sua sacola está vazia
        </h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Adicione peças da coleção {storeConfig.brandName} à sua sacola antes
          de prosseguir para a finalização da compra.
        </p>
        <Link
          href="/produtos"
          className={cn(buttonVariants({ variant: "default", size: "lg" }), "mt-6")}
        >
          Explorar Catálogo
        </Link>
      </div>
    );
  }

  // Order confirmation state
  if (confirmedOrder) {
    const pixCode =
      confirmedOrder.paymentMethod === "pix"
        ? generateMockPixCode(confirmedOrder)
        : "";
    const installmentUnit = Number(
      (confirmedOrder.total / Math.max(1, confirmedInstallments)).toFixed(2)
    );

    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="rounded-2xl border bg-card p-6 shadow-xs sm:p-10">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="size-8" />
            </div>
            <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              Pedido Confirmado
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              Obrigado pela sua compra,{" "}
              {confirmedOrder.customer.fullName.split(" ")[0]}!
            </h1>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <Badge variant="outline" className="px-3 py-1 font-mono text-xs">
                Pedido #{confirmedOrder.id}
              </Badge>
              {confirmedOrder.paymentMethod === "credit_card" ? (
                <Badge className="bg-emerald-600 px-3 py-1 text-white hover:bg-emerald-600">
                  Pagamento aprovado com sucesso
                </Badge>
              ) : (
                <Badge variant="secondary" className="px-3 py-1">
                  Aguardando pagamento via Pix
                </Badge>
              )}
            </div>
          </div>

          {/* Pix QR & Copy-Paste Box */}
          {confirmedOrder.paymentMethod === "pix" && (
            <div className="mt-8 rounded-xl border bg-secondary/35 p-5 sm:p-6">
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                <div className="shrink-0">
                  <MockPixQrSvg />
                </div>
                <div className="min-w-0 flex-1 space-y-3 text-center sm:text-left">
                  <div className="flex items-center justify-center gap-2 sm:justify-start">
                    <QrCode className="size-4 text-[var(--brand-accent)]" />
                    <h2 className="text-sm font-semibold">
                      Pague com Pix ({formatBRL(confirmedOrder.total)})
                    </h2>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Escaneie o QR Code no aplicativo do seu banco ou copie o
                    código Pix Copia e Cola abaixo. A aprovação é imediata.
                  </p>
                  <div className="rounded-lg border bg-background p-2.5 font-mono text-[11px] break-all text-muted-foreground">
                    {pixCode}
                  </div>
                  <Button
                    type="button"
                    onClick={() => handleCopyPixCode(pixCode)}
                    className="w-full sm:w-auto"
                  >
                    <Copy className="size-4" />
                    Copiar código Pix
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Customer & Shipping Summary */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                <User className="size-3.5" />
                <span>Dados do Cliente</span>
              </div>
              <p className="text-sm font-medium">
                {confirmedOrder.customer.fullName}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {confirmedOrder.customer.email}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                WhatsApp: {confirmedOrder.customer.whatsapp}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                CPF: {confirmedOrder.customer.cpf}
              </p>
            </div>

            <div className="rounded-xl border p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                <Truck className="size-3.5" />
                <span>Entrega ({confirmedOrder.shipping.service})</span>
              </div>
              <p className="text-sm font-medium">
                {confirmedOrder.address.street}, {confirmedOrder.address.number}
                {confirmedOrder.address.complement
                  ? ` — ${confirmedOrder.address.complement}`
                  : ""}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {confirmedOrder.address.neighborhood} •{" "}
                {confirmedOrder.address.city}/{confirmedOrder.address.state}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                CEP: {confirmedOrder.address.cep}
              </p>
              <p className="mt-2 text-xs font-medium text-foreground">
                Prazo estimado: até {confirmedOrder.shipping.estimatedDays} dias
                úteis
              </p>
            </div>
          </div>

          {/* Items & Totals */}
          <div className="mt-6 rounded-xl border p-4 sm:p-5">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              <Package className="size-3.5" />
              <span>Itens do Pedido ({confirmedOrder.items.length})</span>
            </div>
            <ul className="divide-y">
              {confirmedOrder.items.map((item) => (
                <li
                  key={item.key}
                  className="flex items-center justify-between gap-3 py-2.5 text-sm"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="size-12 shrink-0 rounded-md bg-muted object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Qtd: {item.quantity}
                        {item.attributes &&
                        Object.keys(item.attributes).length > 0
                          ? ` • ${Object.entries(item.attributes)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(" • ")}`
                          : ""}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 font-medium">
                    {formatBRL(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-4 space-y-1.5 border-t pt-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatBRL(confirmedOrder.subtotal)}</span>
              </div>
              {confirmedOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-700 dark:text-emerald-400">
                  <span>
                    Cupom{" "}
                    {confirmedOrder.couponCode
                      ? `(${confirmedOrder.couponCode})`
                      : ""}
                  </span>
                  <span>-{formatBRL(confirmedOrder.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Frete ({confirmedOrder.shipping.service})</span>
                <span>
                  {confirmedOrder.shippingCost === 0
                    ? "Grátis"
                    : formatBRL(confirmedOrder.shippingCost)}
                </span>
              </div>
              {confirmedOrder.pixDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 dark:text-emerald-400">
                  <span>Desconto Pix ({storeConfig.pixDiscountPercent}%)</span>
                  <span>-{formatBRL(confirmedOrder.pixDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 text-base font-semibold text-foreground">
                <span>Total</span>
                <span>
                  {formatBRL(confirmedOrder.total)}
                  {confirmedOrder.paymentMethod === "credit_card" &&
                    confirmedInstallments > 1 && (
                      <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                        ({confirmedInstallments}x de {formatBRL(installmentUnit)}{" "}
                        sem juros)
                      </span>
                    )}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/produtos"
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "w-full sm:w-auto"
              )}
            >
              Continuar Comprando
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Shared Order Summary panel renderer
  const summaryPanel = (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-5 shadow-xs">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-wide uppercase">
            Resumo do Pedido
          </h2>
          <span className="text-xs text-muted-foreground">
            {totalItems} {totalItems === 1 ? "item" : "itens"}
          </span>
        </div>

        {/* Items list */}
        <ul className="max-h-72 divide-y overflow-y-auto pr-1">
          {items.map((item) => (
            <li key={item.key} className="flex gap-3 py-3 first:pt-0">
              <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
                <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                  {item.quantity}
                </span>
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div>
                  <p className="line-clamp-1 text-sm font-medium text-foreground">
                    {item.name}
                  </p>
                  {item.attributes &&
                    Object.keys(item.attributes).length > 0 && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {Object.entries(item.attributes)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(" • ")}
                      </p>
                    )}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {item.quantity} × {formatBRL(item.price)}
                  </span>
                  <span className="font-medium text-foreground">
                    {formatBRL(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Coupon Input / Active Coupon */}
        <div className="mt-4 border-t pt-4">
          {couponCode ? (
            <div className="flex items-center justify-between rounded-lg border border-emerald-600/30 bg-emerald-500/10 px-3 py-2">
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                <Tag className="size-3.5" />
                <span>
                  Cupom <strong>{couponCode}</strong> ({discountPercent}% OFF)
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  removeCoupon();
                  setCouponFeedback(null);
                  toast.info("Cupom removido.");
                }}
                aria-label="Remover cupom"
                className="rounded p-1 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleApplyCoupon} className="space-y-1.5">
              <label
                htmlFor="checkout-coupon"
                className="block text-xs font-medium text-muted-foreground"
              >
                Cupom de desconto
              </label>
              <div className="flex gap-2">
                <Input
                  id="checkout-coupon"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Ex: BEMVINDO10"
                  className="h-9 uppercase"
                />
                <Button type="submit" variant="outline" className="h-9 px-3">
                  Aplicar
                </Button>
              </div>
              {couponFeedback && (
                <p
                  className={cn(
                    "text-xs",
                    couponFeedback.type === "success"
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-destructive"
                  )}
                >
                  {couponFeedback.text}
                </p>
              )}
            </form>
          )}
        </div>

        {/* Totals Breakdown */}
        <div className="mt-4 space-y-2 border-t pt-4 text-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span className="text-foreground">{formatBRL(subtotal)}</span>
          </div>

          {discount > 0 && (
            <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
              <span>Cupom de Desconto ({discountPercent}%)</span>
              <span>-{formatBRL(discount)}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-muted-foreground">
            <span>
              Frete{" "}
              {selectedShipping ? `(${selectedShipping.service})` : ""}
            </span>
            <span
              className={cn(
                selectedShipping && selectedShipping.price === 0
                  ? "font-medium text-emerald-700 dark:text-emerald-400"
                  : "text-foreground"
              )}
            >
              {!selectedShipping
                ? "A calcular"
                : selectedShipping.price === 0
                  ? "Grátis"
                  : formatBRL(selectedShipping.price)}
            </span>
          </div>

          {paymentMethod === "pix" && pixDiscount > 0 && (
            <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
              <span>Desconto Pix (-{storeConfig.pixDiscountPercent}%)</span>
              <span>-{formatBRL(pixDiscount)}</span>
            </div>
          )}

          <div className="flex items-baseline justify-between border-t pt-3">
            <span className="text-base font-semibold text-foreground">
              Total Final
            </span>
            <div className="text-right">
              <p className="text-xl font-semibold tracking-tight text-foreground">
                {formatBRL(finalTotal)}
              </p>
              {paymentMethod === "pix" ? (
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                  Economia de {formatBRL(pixDiscount)} no Pix
                </p>
              ) : (
                <p className="text-[11px] text-muted-foreground">
                  ou {installmentInfo.count}x de{" "}
                  {formatBRL(installmentInfo.value)} sem juros
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 rounded-xl border bg-secondary/35 px-4 py-3 text-xs text-muted-foreground">
        <ShieldCheck className="size-4 shrink-0 text-emerald-700 dark:text-emerald-400" />
        <span>Ambiente protegido com criptografia SSL</span>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      {/* Minimal Distraction-Free Header */}
      <div className="mb-8 flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/produtos"
            className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Voltar para a loja
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Finalizar Compra
          </h1>
        </div>

        {/* Step Indicator */}
        <nav
          aria-label="Etapas do checkout"
          className="flex flex-wrap items-center gap-3 sm:gap-5"
        >
          <StepBadge
            step={1}
            label="Dados Pessoais"
            activeStep={activeStep}
            completed={completedSteps.step1}
            onSelect={setActiveStep}
          />
          <span className="text-muted-foreground/40">/</span>
          <StepBadge
            step={2}
            label="Entrega"
            activeStep={activeStep}
            completed={completedSteps.step2}
            onSelect={setActiveStep}
          />
          <span className="text-muted-foreground/40">/</span>
          <StepBadge
            step={3}
            label="Pagamento"
            activeStep={activeStep}
            completed={false}
            onSelect={setActiveStep}
          />
        </nav>
      </div>

      {/* Mobile Collapsible Order Summary */}
      <div className="mb-6 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileSummaryOpen((prev) => !prev)}
          className="flex w-full items-center justify-between rounded-xl border bg-card px-4 py-3.5 text-left shadow-xs"
        >
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              Resumo do Pedido ({totalItems}{" "}
              {totalItems === 1 ? "item" : "itens"})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">
              {formatBRL(finalTotal)}
            </span>
            {mobileSummaryOpen ? (
              <ChevronUp className="size-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="size-4 text-muted-foreground" />
            )}
          </div>
        </button>
        {mobileSummaryOpen && <div className="mt-3">{summaryPanel}</div>}
      </div>

      {/* Main 2-Column Checkout Grid */}
      <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
        {/* Left Column: 3-Step Progressive Form */}
        <div className="space-y-5 lg:col-span-7">
          {/* STEP 1: DADOS PESSOAIS */}
          <section className="rounded-xl border bg-card p-5 shadow-xs sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    completedSteps.step1 && activeStep !== 1
                      ? "bg-emerald-600 text-white"
                      : "bg-primary text-primary-foreground"
                  )}
                >
                  {completedSteps.step1 && activeStep !== 1 ? (
                    <Check className="size-3.5" />
                  ) : (
                    "1"
                  )}
                </span>
                <div>
                  <h2 className="text-base font-semibold">Dados Pessoais</h2>
                  <p className="text-xs text-muted-foreground">
                    Para nota fiscal e acompanhamento do pedido
                  </p>
                </div>
              </div>

              {completedSteps.step1 && activeStep !== 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveStep(1)}
                >
                  Editar
                </Button>
              )}
            </div>

            {activeStep !== 1 && completedSteps.step1 ? (
              <div className="mt-4 rounded-lg bg-secondary/40 px-4 py-3 text-xs text-muted-foreground sm:text-sm">
                <p className="font-medium text-foreground">
                  {customer.fullName}
                </p>
                <p className="mt-0.5">
                  {customer.email} • {customer.whatsapp} • CPF: {customer.cpf}
                </p>
              </div>
            ) : activeStep === 1 ? (
              <form onSubmit={handleContinueStep1} className="mt-5 space-y-4">
                <div>
                  <label
                    htmlFor="fullName"
                    className="mb-1.5 block text-xs font-medium text-foreground"
                  >
                    Nome Completo *
                  </label>
                  <Input
                    id="fullName"
                    autoComplete="name"
                    value={customer.fullName}
                    onChange={(e) => {
                      setCustomer((p) => ({ ...p, fullName: e.target.value }));
                      setStep1Errors((p) => ({ ...p, fullName: undefined }));
                    }}
                    placeholder="Ex: Mariana Almeida"
                    aria-invalid={Boolean(step1Errors.fullName)}
                    className="h-10"
                  />
                  <FieldError message={step1Errors.fullName} />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-xs font-medium text-foreground"
                  >
                    E-mail *
                  </label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={customer.email}
                    onChange={(e) => {
                      setCustomer((p) => ({ ...p, email: e.target.value }));
                      setStep1Errors((p) => ({ ...p, email: undefined }));
                    }}
                    placeholder="mariana@exemplo.com.br"
                    aria-invalid={Boolean(step1Errors.email)}
                    className="h-10"
                  />
                  <FieldError message={step1Errors.email} />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="whatsapp"
                      className="mb-1.5 block text-xs font-medium text-foreground"
                    >
                      WhatsApp *
                    </label>
                    <Input
                      id="whatsapp"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      value={customer.whatsapp}
                      onChange={(e) => {
                        setCustomer((p) => ({
                          ...p,
                          whatsapp: maskPhone(e.target.value),
                        }));
                        setStep1Errors((p) => ({ ...p, whatsapp: undefined }));
                      }}
                      placeholder="(11) 99999-9999"
                      aria-invalid={Boolean(step1Errors.whatsapp)}
                      className="h-10"
                    />
                    <FieldError message={step1Errors.whatsapp} />
                  </div>

                  <div>
                    <label
                      htmlFor="cpf"
                      className="mb-1.5 block text-xs font-medium text-foreground"
                    >
                      CPF *
                    </label>
                    <Input
                      id="cpf"
                      inputMode="numeric"
                      value={customer.cpf}
                      onChange={(e) => {
                        setCustomer((p) => ({
                          ...p,
                          cpf: maskCPF(e.target.value),
                        }));
                        setStep1Errors((p) => ({ ...p, cpf: undefined }));
                      }}
                      placeholder="000.000.000-00"
                      aria-invalid={Boolean(step1Errors.cpf)}
                      className="h-10"
                    />
                    <FieldError message={step1Errors.cpf} />
                  </div>
                </div>

                <div className="pt-2">
                  <Button type="submit" size="lg" className="h-11 w-full sm:w-auto sm:px-8">
                    Continuar para Entrega
                  </Button>
                </div>
              </form>
            ) : null}
          </section>

          {/* STEP 2: ENTREGA */}
          <section
            className={cn(
              "rounded-xl border bg-card p-5 shadow-xs transition-opacity sm:p-6",
              activeStep < 2 && !completedSteps.step2 && "opacity-60"
            )}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    completedSteps.step2 && activeStep !== 2
                      ? "bg-emerald-600 text-white"
                      : activeStep === 2
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  {completedSteps.step2 && activeStep !== 2 ? (
                    <Check className="size-3.5" />
                  ) : (
                    "2"
                  )}
                </span>
                <div>
                  <h2 className="text-base font-semibold">Entrega</h2>
                  <p className="text-xs text-muted-foreground">
                    Endereço de recebimento e modalidade de envio
                  </p>
                </div>
              </div>

              {completedSteps.step2 && activeStep !== 2 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveStep(2)}
                >
                  Editar
                </Button>
              )}
            </div>

            {activeStep !== 2 && completedSteps.step2 && selectedShipping ? (
              <div className="mt-4 rounded-lg bg-secondary/40 px-4 py-3 text-xs text-muted-foreground sm:text-sm">
                <p className="font-medium text-foreground">
                  {address.street}, {address.number}
                  {address.complement ? ` — ${address.complement}` : ""}
                </p>
                <p className="mt-0.5">
                  {address.neighborhood} • {address.city}/{address.state} • CEP{" "}
                  {address.cep}
                </p>
                <p className="mt-1 font-medium text-foreground">
                  {selectedShipping.name} —{" "}
                  {selectedShipping.price === 0
                    ? "Grátis"
                    : formatBRL(selectedShipping.price)}{" "}
                  (até {selectedShipping.estimatedDays} dias úteis)
                </p>
              </div>
            ) : activeStep === 2 ? (
              <form onSubmit={handleContinueStep2} className="mt-5 space-y-4">
                <div>
                  <label
                    htmlFor="cep"
                    className="mb-1.5 block text-xs font-medium text-foreground"
                  >
                    CEP *
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="cep"
                      inputMode="numeric"
                      autoComplete="postal-code"
                      value={address.cep}
                      onChange={(e) => handleCepChange(e.target.value)}
                      placeholder="00000-000"
                      aria-invalid={Boolean(step2Errors.cep)}
                      className="h-10 max-w-48"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleCepLookup(address.cep, true)}
                      className="h-10 px-4"
                    >
                      <MapPin className="size-4" />
                      Buscar CEP
                    </Button>
                  </div>
                  <FieldError message={step2Errors.cep} />
                </div>

                {/* Shipping Quotes */}
                {shippingQuotes.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <p className="text-xs font-medium text-foreground">
                      Modalidade de Envio *
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {shippingQuotes.map((quote) => {
                        const isSelected = selectedShipping?.id === quote.id;
                        return (
                          <button
                            key={quote.id}
                            type="button"
                            onClick={() => {
                              setSelectedShippingId(quote.id);
                              setStoredShipping(quote);
                              setStep2Errors((p) => ({
                                ...p,
                                shipping: undefined,
                              }));
                            }}
                            className={cn(
                              "flex items-start justify-between gap-3 rounded-xl border p-3.5 text-left transition-all",
                              isSelected
                                ? "border-primary bg-secondary/50 ring-1 ring-primary"
                                : "hover:border-foreground/30"
                            )}
                          >
                            <div className="flex items-start gap-2.5">
                              <span
                                className={cn(
                                  "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border",
                                  isSelected
                                    ? "border-primary bg-primary"
                                    : "border-muted-foreground/40"
                                )}
                              >
                                {isSelected && (
                                  <span className="size-1.5 rounded-full bg-primary-foreground" />
                                )}
                              </span>
                              <div>
                                <p className="text-sm font-medium text-foreground">
                                  {quote.service}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Até {quote.estimatedDays} dias úteis
                                </p>
                              </div>
                            </div>
                            <span
                              className={cn(
                                "text-sm font-semibold",
                                quote.price === 0
                                  ? "text-emerald-700 dark:text-emerald-400"
                                  : "text-foreground"
                              )}
                            >
                              {quote.price === 0
                                ? "Grátis"
                                : formatBRL(quote.price)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <FieldError message={step2Errors.shipping} />
                  </div>
                )}

                {/* Address Fields */}
                {(cepSearched || cepDigits.length === 8 || address.street) && (
                  <div className="space-y-4 pt-1">
                    <div className="grid gap-4 sm:grid-cols-4">
                      <div className="sm:col-span-3">
                        <label
                          htmlFor="street"
                          className="mb-1.5 block text-xs font-medium text-foreground"
                        >
                          Rua / Avenida *
                        </label>
                        <Input
                          id="street"
                          value={address.street}
                          onChange={(e) => {
                            setAddress((p) => ({
                              ...p,
                              street: e.target.value,
                            }));
                            setStep2Errors((p) => ({
                              ...p,
                              street: undefined,
                            }));
                          }}
                          placeholder="Av. Paulista"
                          aria-invalid={Boolean(step2Errors.street)}
                          className="h-10"
                        />
                        <FieldError message={step2Errors.street} />
                      </div>

                      <div>
                        <label
                          htmlFor="number"
                          className="mb-1.5 block text-xs font-medium text-foreground"
                        >
                          Número *
                        </label>
                        <Input
                          id="number"
                          value={address.number}
                          onChange={(e) => {
                            setAddress((p) => ({
                              ...p,
                              number: e.target.value,
                            }));
                            setStep2Errors((p) => ({
                              ...p,
                              number: undefined,
                            }));
                          }}
                          placeholder="1000"
                          aria-invalid={Boolean(step2Errors.number)}
                          className="h-10"
                        />
                        <FieldError message={step2Errors.number} />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="complement"
                          className="mb-1.5 block text-xs font-medium text-foreground"
                        >
                          Complemento (opcional)
                        </label>
                        <Input
                          id="complement"
                          value={address.complement ?? ""}
                          onChange={(e) =>
                            setAddress((p) => ({
                              ...p,
                              complement: e.target.value,
                            }))
                          }
                          placeholder="Apto 42, Bloco B"
                          className="h-10"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="neighborhood"
                          className="mb-1.5 block text-xs font-medium text-foreground"
                        >
                          Bairro *
                        </label>
                        <Input
                          id="neighborhood"
                          value={address.neighborhood}
                          onChange={(e) => {
                            setAddress((p) => ({
                              ...p,
                              neighborhood: e.target.value,
                            }));
                            setStep2Errors((p) => ({
                              ...p,
                              neighborhood: undefined,
                            }));
                          }}
                          placeholder="Bela Vista"
                          aria-invalid={Boolean(step2Errors.neighborhood)}
                          className="h-10"
                        />
                        <FieldError message={step2Errors.neighborhood} />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="sm:col-span-2">
                        <label
                          htmlFor="city"
                          className="mb-1.5 block text-xs font-medium text-foreground"
                        >
                          Cidade *
                        </label>
                        <Input
                          id="city"
                          value={address.city}
                          onChange={(e) => {
                            setAddress((p) => ({ ...p, city: e.target.value }));
                            setStep2Errors((p) => ({ ...p, city: undefined }));
                          }}
                          placeholder="São Paulo"
                          aria-invalid={Boolean(step2Errors.city)}
                          className="h-10"
                        />
                        <FieldError message={step2Errors.city} />
                      </div>

                      <div>
                        <label
                          htmlFor="state"
                          className="mb-1.5 block text-xs font-medium text-foreground"
                        >
                          Estado (UF) *
                        </label>
                        <Select
                          value={address.state}
                          onValueChange={(val) => {
                            if (val !== null) {
                              setAddress((p) => ({ ...p, state: val }));
                              setStep2Errors((p) => ({
                                ...p,
                                state: undefined,
                              }));
                            }
                          }}
                        >
                          <SelectTrigger
                            id="state"
                            aria-invalid={Boolean(step2Errors.state)}
                            className="h-10 w-full"
                          >
                            <SelectValue placeholder="UF">
                              {(val: string | null) => val || "UF"}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {BRAZILIAN_STATES.map((uf) => (
                              <SelectItem key={uf} value={uf}>
                                {uf}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FieldError message={step2Errors.state} />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Button type="submit" size="lg" className="h-11 w-full sm:w-auto sm:px-8">
                    Continuar para Pagamento
                  </Button>
                </div>
              </form>
            ) : null}
          </section>

          {/* STEP 3: PAGAMENTO */}
          <section
            className={cn(
              "rounded-xl border bg-card p-5 shadow-xs transition-opacity sm:p-6",
              activeStep < 3 && "opacity-60"
            )}
          >
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  activeStep === 3
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                3
              </span>
              <div>
                <h2 className="text-base font-semibold">Pagamento</h2>
                <p className="text-xs text-muted-foreground">
                  Escolha entre Pix com desconto ou Cartão de Crédito
                </p>
              </div>
            </div>

            {activeStep === 3 && (
              <form onSubmit={handleSubmitOrder} className="mt-5 space-y-5">
                {/* Payment Method Toggle Cards */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod("pix");
                      setStep3Errors({});
                    }}
                    className={cn(
                      "flex flex-col justify-between rounded-xl border p-4 text-left transition-all",
                      paymentMethod === "pix"
                        ? "border-primary bg-secondary/50 ring-1 ring-primary"
                        : "hover:border-foreground/30"
                    )}
                  >
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center gap-2">
                        <QrCode className="size-4 text-[var(--brand-accent)]" />
                        <span className="text-sm font-semibold">Pix</span>
                      </div>
                      <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                        {storeConfig.pixDiscountPercent}% OFF
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      5% de desconto imediato e aprovação na hora
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("credit_card")}
                    className={cn(
                      "flex flex-col justify-between rounded-xl border p-4 text-left transition-all",
                      paymentMethod === "credit_card"
                        ? "border-primary bg-secondary/50 ring-1 ring-primary"
                        : "hover:border-foreground/30"
                    )}
                  >
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="size-4 text-foreground" />
                        <span className="text-sm font-semibold">
                          Cartão de Crédito
                        </span>
                      </div>
                      <Badge variant="outline">
                        Até {storeConfig.maxInstallments}x
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Parcele em até {storeConfig.maxInstallments}x sem juros
                    </p>
                  </button>
                </div>

                {/* Pix Details */}
                {paymentMethod === "pix" ? (
                  <div className="rounded-xl border border-emerald-600/25 bg-emerald-500/8 p-4">
                    <div className="flex items-start gap-3">
                      <Sparkles className="mt-0.5 size-4 shrink-0 text-emerald-700 dark:text-emerald-400" />
                      <div className="space-y-1 text-xs leading-relaxed">
                        <p className="font-semibold text-foreground">
                          Desconto de {storeConfig.pixDiscountPercent}%
                          aplicado automaticamente ({formatBRL(pixDiscount)} de
                          economia)
                        </p>
                        <p className="text-muted-foreground">
                          Ao clicar em <strong>Finalizar Pedido</strong>, um QR
                          Code e código Pix Copia e Cola serão gerados
                          instantaneamente para pagamento no app do seu banco.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Credit Card Fields */
                  <div className="space-y-4 rounded-xl border bg-secondary/20 p-4">
                    <div>
                      <label
                        htmlFor="cardNumber"
                        className="mb-1.5 block text-xs font-medium text-foreground"
                      >
                        Número do Cartão *
                      </label>
                      <Input
                        id="cardNumber"
                        inputMode="numeric"
                        autoComplete="cc-number"
                        value={card.number}
                        onChange={(e) => {
                          setCard((p) => ({
                            ...p,
                            number: maskCardNumber(e.target.value),
                          }));
                          setStep3Errors((p) => ({ ...p, number: undefined }));
                        }}
                        placeholder="0000 0000 0000 0000"
                        aria-invalid={Boolean(step3Errors.number)}
                        className="h-10 bg-background font-mono"
                      />
                      <FieldError message={step3Errors.number} />
                    </div>

                    <div>
                      <label
                        htmlFor="cardHolder"
                        className="mb-1.5 block text-xs font-medium text-foreground"
                      >
                        Nome Impresso no Cartão *
                      </label>
                      <Input
                        id="cardHolder"
                        autoComplete="cc-name"
                        value={card.holderName}
                        onChange={(e) => {
                          setCard((p) => ({
                            ...p,
                            holderName: e.target.value.toUpperCase(),
                          }));
                          setStep3Errors((p) => ({
                            ...p,
                            holderName: undefined,
                          }));
                        }}
                        placeholder="MARIANA ALMEIDA"
                        aria-invalid={Boolean(step3Errors.holderName)}
                        className="h-10 bg-background uppercase"
                      />
                      <FieldError message={step3Errors.holderName} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="cardExpiry"
                          className="mb-1.5 block text-xs font-medium text-foreground"
                        >
                          Validade (MM/AA) *
                        </label>
                        <Input
                          id="cardExpiry"
                          inputMode="numeric"
                          autoComplete="cc-exp"
                          value={card.expiry}
                          onChange={(e) => {
                            setCard((p) => ({
                              ...p,
                              expiry: maskExpiry(e.target.value),
                            }));
                            setStep3Errors((p) => ({
                              ...p,
                              expiry: undefined,
                            }));
                          }}
                          placeholder="12/29"
                          aria-invalid={Boolean(step3Errors.expiry)}
                          className="h-10 bg-background font-mono"
                        />
                        <FieldError message={step3Errors.expiry} />
                      </div>

                      <div>
                        <label
                          htmlFor="cardCvv"
                          className="mb-1.5 block text-xs font-medium text-foreground"
                        >
                          CVV *
                        </label>
                        <Input
                          id="cardCvv"
                          inputMode="numeric"
                          autoComplete="cc-csc"
                          value={card.cvv}
                          onChange={(e) => {
                            setCard((p) => ({
                              ...p,
                              cvv: maskCVV(e.target.value),
                            }));
                            setStep3Errors((p) => ({ ...p, cvv: undefined }));
                          }}
                          placeholder="000"
                          aria-invalid={Boolean(step3Errors.cvv)}
                          className="h-10 bg-background font-mono"
                        />
                        <FieldError message={step3Errors.cvv} />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="installments"
                        className="mb-1.5 block text-xs font-medium text-foreground"
                      >
                        Parcelamento *
                      </label>
                      <Select
                        value={String(effectiveInstallments)}
                        onValueChange={(val) => {
                          if (val !== null) {
                            setCard((p) => ({
                              ...p,
                              installments: Number(val),
                            }));
                          }
                        }}
                      >
                        <SelectTrigger
                          id="installments"
                          className="h-10 w-full bg-background"
                        >
                          <SelectValue>
                            {(val: string | null) => {
                              const n = Number(val ?? 1);
                              const opt =
                                installmentOptions.find((o) => o.count === n) ??
                                installmentOptions[0];
                              return `${opt.count}x de ${formatBRL(opt.value)} sem juros`;
                            }}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {installmentOptions.map((opt) => (
                            <SelectItem
                              key={opt.count}
                              value={String(opt.count)}
                            >
                              {opt.count}x de {formatBRL(opt.value)} sem juros
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                <Button type="submit" size="lg" className="h-12 w-full text-sm">
                  <Lock className="size-4" />
                  Finalizar Pedido • {formatBRL(finalTotal)}
                </Button>
              </form>
            )}
          </section>
        </div>

        {/* Right Column: Sticky Live Order Summary (Desktop) */}
        <aside className="hidden lg:sticky lg:top-24 lg:col-span-5 lg:block">
          {summaryPanel}
        </aside>
      </div>
    </div>
  );
}
