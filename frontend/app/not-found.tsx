"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";
import { productsApi } from "@/lib/api";
import { ProductCard } from "@/components/product-card";
import { SkeletonLoader } from "@/components/skeleton-loader";

export default function NotFoundPage() {
  const { data: bestsellers = [], isLoading: bsLoading } = useQuery({
    queryKey: ["404-bestsellers"],
    queryFn: () => productsApi.getBestsellers(4),
  });

  const { data: newArrivals = [], isLoading: naLoading } = useQuery({
    queryKey: ["404-newarrivals"],
    queryFn: () => productsApi.getNewArrivals(4),
  });

  const { data: trending = [], isLoading: trendLoading } = useQuery({
    queryKey: ["404-trending"],
    queryFn: () =>
      productsApi.list({ isFeatured: true, sort: "featured" }).then((res) => res.slice(0, 4)),
  });

  return (
    <div className="bg-background min-h-screen">
      {/* Hero section */}
      <section className="container-luxe py-24 text-center border-b border-border bg-champagne/15 relative overflow-hidden">
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(0.91_0.012_80/0.05)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.91_0.012_80/0.05)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

        {/* Luxury Border Frame */}
        <div className="absolute inset-4 border border-gold/10 pointer-events-none" />

        <div className="max-w-xl mx-auto space-y-6 relative z-10 animate-rise">
          <div className="h-16 w-16 mx-auto rounded bg-gold/10 grid place-items-center text-gold border border-gold/20">
            <Compass className="h-7 w-7" />
          </div>
          <p className="eyebrow text-gold font-bold tracking-[0.25em]">Error 404</p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-ink leading-tight">
            Page Not Found
          </h1>
          <span className="gold-divider mx-auto block" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            The path you followed does not exist within the DRAPEVA STORE. You may explore our
            latest curated collections below.
          </p>
          <div className="pt-6 flex flex-wrap justify-center gap-4">
            <Link
              href="/collections"
              className="bg-foreground text-background px-6 py-3.5 text-xs font-semibold tracking-widest uppercase hover:bg-gold hover:text-gold-foreground transition-all duration-300 inline-flex items-center gap-2 group"
            >
              Continue Shopping
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/"
              className="border border-border bg-background px-6 py-3.5 text-xs font-semibold tracking-widest uppercase hover:border-gold hover:text-gold transition-all duration-300"
            >
              Go Home
            </Link>
          </div>
        </div>
      </section>

      {/* Suggested Sections */}
      <div className="container-luxe py-20 space-y-24">
        {/* Bestsellers */}
        <section className="space-y-8">
          <div className="border-b border-border pb-4 flex justify-between items-end">
            <div>
              <p className="eyebrow">Favorites</p>
              <h2 className="font-display text-2xl md:text-3xl mt-1">Best Sellers</h2>
            </div>
            <Link
              href="/collections"
              className="text-xs uppercase tracking-widest text-muted-foreground hover:text-gold transition-colors font-medium"
            >
              View All
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4 md:gap-x-8">
            {bsLoading ? (
              <SkeletonLoader variant="product-card" count={4} />
            ) : (
              bestsellers.map((p: any) => <ProductCard key={p.id} product={p} />)
            )}
          </div>
        </section>

        {/* New Arrivals */}
        <section className="space-y-8">
          <div className="border-b border-border pb-4 flex justify-between items-end">
            <div>
              <p className="eyebrow">Just finished</p>
              <h2 className="font-display text-2xl md:text-3xl mt-1">New Arrivals</h2>
            </div>
            <Link
              href="/collections"
              className="text-xs uppercase tracking-widest text-muted-foreground hover:text-gold transition-colors font-medium"
            >
              View All
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4 md:gap-x-8">
            {naLoading ? (
              <SkeletonLoader variant="product-card" count={4} />
            ) : (
              newArrivals.map((p: any) => <ProductCard key={p.id} product={p} />)
            )}
          </div>
        </section>

        {/* Trending */}
        <section className="space-y-8">
          <div className="border-b border-border pb-4 flex justify-between items-end">
            <div>
              <p className="eyebrow">Trending Edit</p>
              <h2 className="font-display text-2xl md:text-3xl mt-1">Trending Sarees</h2>
            </div>
            <Link
              href="/collections"
              className="text-xs uppercase tracking-widest text-muted-foreground hover:text-gold transition-colors font-medium"
            >
              View All
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4 md:gap-x-8">
            {trendLoading ? (
              <SkeletonLoader variant="product-card" count={4} />
            ) : (
              trending.map((p: any) => <ProductCard key={p.id} product={p} />)
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
