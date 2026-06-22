import type { Metadata } from "next";
import { cache } from "react";
import { productsApi } from "@/lib/api";
import ProductPageClient from "./product-page-client";
import { ProductNotFound } from "@/components/product-not-found";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// React cache memoizes the fetch per request to avoid double query to Supabase
const getProduct = cache(async (slug: string) => {
  try {
    return await productsApi.getBySlug(slug);
  } catch (err) {
    console.error("Failed to load product", err);
    return null;
  }
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Piece retired — Drapeva" };
  return {
    title: `${product.name} — Drapeva`,
    description: product.description,
    openGraph: {
      title: `${product.name} — Drapeva`,
      description: product.description,
      images: product.image ? [{ url: product.image }] : [],
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return <ProductNotFound />;
  }

  return <ProductPageClient initialProduct={product} slug={slug} />;
}
