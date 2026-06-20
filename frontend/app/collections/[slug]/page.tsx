"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { productsApi, collectionsApi, categoriesApi } from "@/lib/api";
import { ProductCard } from "@/components/product-card";
import { SkeletonLoader } from "@/components/skeleton-loader";
import { Layers, Folder, ArrowRight } from "lucide-react";

export default function CollectionDetail() {
  const params = useParams();
  const slug = typeof params?.slug === "string" ? params.slug : "";

  const { data: collections = [], isLoading: collectionsLoading } = useQuery({
    queryKey: ["collections"],
    queryFn: collectionsApi.list,
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesApi.list,
  });

  const collectionInfo = collections.find((c: any) => c.slug === slug);
  const displayName = collectionInfo?.name;

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["shop-products", undefined, slug],
    queryFn: () => productsApi.list({ collection: slug }),
    enabled: !!collectionInfo,
  });

  const isLoading =
    collectionsLoading || categoriesLoading || (!!collectionInfo && productsLoading);

  if (isLoading) {
    return <SkeletonLoader variant="collection" />;
  }

  // Collection Not Found Fallback State
  if (!collectionInfo) {
    return (
      <div className="bg-background min-h-screen">
        <section className="container-luxe py-20 text-center border-b border-border bg-champagne/15 relative overflow-hidden">
          <div className="absolute inset-4 border border-gold/10 pointer-events-none" />
          <div className="max-w-xl mx-auto space-y-5 relative z-10 animate-rise">
            <div className="h-16 w-16 mx-auto rounded bg-gold/10 grid place-items-center text-gold border border-gold/20">
              <Layers className="h-7 w-7" />
            </div>
            <p className="eyebrow text-gold font-bold tracking-[0.25em]">Error 404</p>
            <h1 className="font-display text-4xl md:text-5xl font-semibold text-ink leading-tight">
              Collection Not Found
            </h1>
            <span className="gold-divider mx-auto block" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              The editorial collection you are seeking is either unavailable or has been archived.
              You can browse our other edits below.
            </p>
            <div className="pt-6 flex flex-wrap justify-center gap-4">
              <Link
                href="/shop"
                className="bg-foreground text-background px-6 py-3.5 text-xs font-semibold tracking-widest uppercase hover:bg-gold hover:text-gold-foreground transition-all duration-300 inline-flex items-center gap-2 group"
              >
                Go to Shop
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>

        <div className="container-luxe py-20 space-y-16">
          {/* Featured Collections list */}
          {collections.length > 0 && (
            <section className="space-y-6">
              <h2 className="font-display text-2xl md:text-3xl border-b border-border pb-4">
                Explore Active Edits
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {collections.map((col: any) => (
                  <Link
                    key={col.id}
                    href={`/collections/${col.slug}`}
                    className="group relative h-64 overflow-hidden border border-border flex flex-col justify-end p-6 bg-ink text-background"
                  >
                    {col.image && (
                      <img
                        src={col.image}
                        alt={col.name}
                        className="absolute inset-0 h-full w-full object-cover opacity-50 transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
                    <div className="relative z-10 space-y-1">
                      <p className="text-[10px] eyebrow text-gold">{col.tagline || "ATELIER"}</p>
                      <h3 className="font-display text-xl">{col.name}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Popular Categories list */}
          {categories.length > 0 && (
            <section className="space-y-6">
              <h2 className="font-display text-2xl md:text-3xl border-b border-border pb-4">
                Shop by Categories
              </h2>
              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {categories.map((cat: any) => (
                  <Link
                    key={cat.id}
                    href={`/shop?category=${cat.slug}`}
                    className="group flex items-center gap-4 border border-border p-5 hover:border-gold hover:bg-gold/5 transition-all"
                  >
                    <div className="h-10 w-10 rounded bg-gold/15 grid place-items-center text-gold group-hover:bg-gold/25 transition-colors">
                      <Folder className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold uppercase tracking-wider">{cat.name}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto group-hover:text-gold transition-colors" />
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <div className="relative h-[40svh] min-h-[300px] w-full overflow-hidden bg-ink text-background flex items-center justify-center">
        {collectionInfo?.image && (
          <img
            src={collectionInfo.image}
            alt={displayName}
            className="absolute inset-0 h-full w-full object-cover opacity-50"
          />
        )}
        <div className="absolute inset-0 bg-background/25" />
        <div className="relative text-center z-10 px-4">
          <p className="eyebrow text-gold">{collectionInfo?.tagline || "Atelier Edit"}</p>
          <h1 className="mt-3 font-display text-4xl md:text-6xl text-foreground">{displayName}</h1>
          <span className="gold-divider mt-4 block mx-auto" />
        </div>
      </div>

      <div className="container-luxe py-16">
        {products.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border bg-champagne/5">
            <p className="font-display text-xl text-muted-foreground">
              No pieces in this edit just yet.
            </p>
            <Link
              href="/shop"
              className="mt-4 inline-block border-b border-foreground pb-0.5 eyebrow text-xs hover:text-gold hover:border-gold transition-colors"
            >
              Return to shop
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4 md:gap-x-8">
            {products.map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
