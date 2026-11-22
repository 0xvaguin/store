"use client";

import { useState } from "react";
import { ArrowRight, Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const WELCOME_COUPON = "BEMVINDO10";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = email.trim();

    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("Por favor, insira um e-mail válido.");
      return;
    }

    setSubmittedEmail(trimmed);
    setEmail("");
    toast.success(
      `Boas-vindas à AURA! Use o cupom ${WELCOME_COUPON} para 10% OFF na sua primeira compra.`
    );
  }

  async function handleCopyCoupon() {
    try {
      await navigator.clipboard.writeText(WELCOME_COUPON);
      setCopied(true);
      toast.success(`Cupom ${WELCOME_COUPON} copiado.`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.info(`Cupom disponível: ${WELCOME_COUPON}`);
    }
  }

  return (
    <div className="flex h-full flex-col justify-between rounded-none border border-border bg-card p-6 sm:p-10">
      <div className="space-y-4">
        <p className="text-[10px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
          Lista Privada AURA
        </p>

        <h2 className="text-xl font-medium tracking-tight text-foreground sm:text-2xl">
          Receba novidades e 10% OFF
        </h2>

        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          Acesso antecipado aos lançamentos em pequenos lotes e 10% de desconto
          na primeira compra.
        </p>
      </div>

      <div className="mt-8 space-y-4">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 sm:flex-row"
          noValidate
        >
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com.br"
            aria-label="Seu melhor e-mail"
            required
            className="h-11 flex-1 rounded-none bg-background px-3.5 text-sm"
          />
          <Button
            type="submit"
            size="lg"
            className="h-11 gap-2 rounded-none px-6 text-xs font-medium tracking-[0.14em] uppercase"
          >
            <span>Inscrever</span>
            <ArrowRight className="size-4" />
          </Button>
        </form>

        {submittedEmail ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-none border bg-secondary/60 px-4 py-3 text-xs">
            <div className="space-y-0.5">
              <p className="font-medium text-foreground">
                Cadastro confirmado para {submittedEmail}
              </p>
              <p className="text-muted-foreground">
                Aplique o cupom na sacola ou no checkout:
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopyCoupon}
              className="inline-flex items-center gap-1.5 rounded-none border bg-background px-3 py-1.5 font-mono text-xs font-semibold tracking-wider text-foreground transition-colors hover:bg-muted"
            >
              <span>{WELCOME_COUPON}</span>
              {copied ? (
                <Check className="size-3.5 text-[var(--brand-accent)]" />
              ) : (
                <Copy className="size-3.5 text-muted-foreground" />
              )}
            </button>
          </div>
        ) : (
          <p className="text-[11px] text-muted-foreground">
            Ao se inscrever, você desbloqueia o cupom{" "}
            <span className="font-mono font-medium text-foreground">
              {WELCOME_COUPON}
            </span>{" "}
            e pode cancelar o envio quando desejar.
          </p>
        )}
      </div>
    </div>
  );
}
