import type { Metadata } from "next";
import { productsApi } from "@/lib/api";
import ProductPageClient from "./product-page-client";
import { ProductNotFound } from "@/components/product-not-found";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await productsApi.getBySlug(slug);
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
  } catch {
    return { title: "Atelier Couture — Drapeva" };
  }
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  let product = null;
  try {
    product = await productsApi.getBySlug(slug);
  } catch (err) {
    console.error("Failed to load product", err);
  }

  if (!product) {
    return <ProductNotFound />;
  }

  return <ProductPageClient initialProduct={product} slug={slug} />;
}
