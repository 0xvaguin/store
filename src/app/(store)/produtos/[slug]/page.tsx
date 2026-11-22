import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { storeConfig } from "@/config/store.config";
import {
  getProductBySlug,
  getRelatedProducts,
  MOCK_PRODUCTS,
} from "@/data/mock-products";
import { PdpClient } from "@/components/product/pdp-client";

export async function generateStaticParams() {
  return MOCK_PRODUCTS.map((p) => ({ slug: p.slug }));
}

// shortcut: desativa instant shell enquanto usa mock; envolver await params em <Suspense> ao ligar o Supabase
export const instant = false;

export async function generateMetadata({
  params,
}: PageProps<"/produtos/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return {
      title: "Produto não encontrado",
    };
  }

  const description = product.shortDescription ?? product.description;

  return {
    title: product.name,
    description,
    openGraph: {
      title: `${product.name} | ${storeConfig.brandName}`,
      description,
      images: product.images[0]
        ? [{ url: product.images[0], alt: product.name }]
        : undefined,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: PageProps<"/produtos/[slug]">) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = getRelatedProducts(product);

  return <PdpClient product={product} relatedProducts={relatedProducts} />;
}
