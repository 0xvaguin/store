import Link from "next/link";
import { MessageCircle, ShieldCheck } from "lucide-react";
import { storeConfig } from "@/config/store.config";

export function Footer() {
  const whatsappUrl = `https://wa.me/${storeConfig.whatsappNumber}`;

  return (
    <footer className="border-t bg-secondary/40 text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-block text-xl font-semibold tracking-[0.22em] uppercase"
            >
              {storeConfig.logoText}
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {storeConfig.description}
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-xs font-medium transition-colors hover:bg-muted"
            >
              <MessageCircle className="size-4 text-[var(--brand-accent)]" />
              <span>Atendimento via WhatsApp</span>
            </a>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold tracking-[0.14em] uppercase">
              Coleções
            </h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/produtos"
                  className="transition-colors hover:text-foreground"
                >
                  Todos os Produtos
                </Link>
              </li>
              <li>
                <Link
                  href="/produtos?categoria=alfaiataria"
                  className="transition-colors hover:text-foreground"
                >
                  Alfaiataria
                </Link>
              </li>
              <li>
                <Link
                  href="/produtos?categoria=vestidos"
                  className="transition-colors hover:text-foreground"
                >
                  Vestidos
                </Link>
              </li>
              <li>
                <Link
                  href="/produtos?categoria=tricot-malhas"
                  className="transition-colors hover:text-foreground"
                >
                  Tricot &amp; Malhas
                </Link>
              </li>
              <li>
                <Link
                  href="/produtos?categoria=acessorios"
                  className="transition-colors hover:text-foreground"
                >
                  Acessórios
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold tracking-[0.14em] uppercase">
              Atendimento
            </h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>Seg a Sex, das 9h às 18h</li>
              <li>{storeConfig.whatsappDisplay}</li>
              <li>{storeConfig.supportEmail}</li>
              <li>Instagram: {storeConfig.instagramHandle}</li>
            </ul>
          </div>

          {/* Payment & Security */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold tracking-[0.14em] uppercase">
              Pagamento &amp; Segurança
            </h3>
            <div className="flex flex-wrap gap-2">
              <span className="rounded border bg-background px-2.5 py-1 text-xs font-medium">
                Pix (5% OFF)
              </span>
              <span className="rounded border bg-background px-2.5 py-1 text-xs font-medium">
                Cartão até {storeConfig.maxInstallments}x
              </span>
              <span className="rounded border bg-background px-2.5 py-1 text-xs font-medium">
                Visa / Master / Elo
              </span>
            </div>
            <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
              <ShieldCheck className="size-4 shrink-0 text-[var(--brand-accent)]" />
              <span>Ambiente 100% seguro e criptografado</span>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>
            &copy; 2026 {storeConfig.legalName} Todos os
            direitos reservados.
          </p>
          <p>
            Plataforma desenvolvida por{" "}
            <span className="font-medium text-foreground">
              Techfy Soluções Inteligentes
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
