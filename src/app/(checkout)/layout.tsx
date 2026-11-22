import Link from "next/link";
import { Lock, ShieldCheck } from "lucide-react";
import { storeConfig } from "@/config/store.config";

export default function CheckoutLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="text-xl font-semibold tracking-[0.22em] text-brand-accent uppercase transition-opacity hover:opacity-80 sm:text-2xl"
          >
            {storeConfig.logoText}
          </Link>

          <div className="inline-flex items-center gap-2 rounded-none border bg-secondary/50 px-3 py-1.5 text-xs font-medium text-foreground">
            <Lock className="size-3.5 text-emerald-700 dark:text-emerald-400" />
            <span className="hidden sm:inline">Checkout 100% Seguro</span>
            <span className="sm:hidden">Ambiente Seguro</span>
            <ShieldCheck className="size-3.5 text-emerald-700 dark:text-emerald-400" />
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
