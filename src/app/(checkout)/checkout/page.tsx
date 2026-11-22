import type { Metadata } from "next";
import { CheckoutClient } from "@/components/checkout/checkout-client";

export const metadata: Metadata = {
  title: "Finalizar Compra",
  description: "Checkout seguro e rápido",
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
