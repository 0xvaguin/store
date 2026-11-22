import type { Metadata } from "next";
import { DM_Sans, Space_Mono, Syne } from "next/font/google";
import "./globals.css";
import { storeConfig } from "@/config/store.config";
import { Toaster } from "@/components/ui/sonner";

const dmSans = DM_Sans({
  weight: ["400", "500", "600"],
  variable: "--font-dm-sans",
  display: "swap",
  subsets: ["latin"],
});

const syne = Syne({
  weight: ["600", "700"],
  variable: "--font-syne",
  display: "swap",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${storeConfig.brandName} | ${storeConfig.tagline}`,
    template: `%s | ${storeConfig.brandName}`,
  },
  description: storeConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${dmSans.variable} ${syne.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-clip bg-background text-foreground">
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
