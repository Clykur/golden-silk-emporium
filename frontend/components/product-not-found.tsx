"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { productsApi } from "@/lib/api";
import { ProductCard } from "./product-card";
import { SkeletonLoader } from "./skeleton-loader";

export function ProductNotFound() {
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const history = JSON.parse(localStorage.getItem("drapeva-recent-viewed") || "[]");
      setRecentlyViewed(history.slice(0, 4));
    }
  }, []);

  const { data: bestsellers = [], isLoading: bsLoading } = useQuery({
    queryKey: ["product-notfound-bestsellers"],
    queryFn: () => productsApi.getBestsellers(4),
  });

  const { data: newArrivals = [], isLoading: naLoading } = useQuery({
    queryKey: ["product-notfound-newarrivals"],
    queryFn: () => productsApi.getNewArrivals(4),
  });

  return (
    <div className="bg-background min-h-screen">
      {/* 404 Header Area */}
      <section className="container-luxe py-20 border-b border-border bg-champagne/15 relative overflow-hidden">
        {/* Luxury Frame */}
        <div className="absolute inset-4 border border-gold/10 pointer-events-none" />

        <div className="max-w-xl mx-auto text-center space-y-5 relative z-10">
          <p className="eyebrow text-gold font-bold tracking-[0.25em]">CURATED EDIT</p>
          <h1 className="font-display text-4xl md:text-5xl leading-tight text-ink font-semibold tracking-wide">
            Masterpiece Unavailable
          </h1>
          <span className="gold-divider mx-auto block" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            This curated design may have been acquired, retired, or temporarily moved. Let's find
            you another beautiful weave.
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
              Return Home
            </Link>
          </div>
        </div>
      </section>

      {/* Recommended sections */}
      <div className="container-luxe py-20 space-y-20">
        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <section className="space-y-8 animate-rise">
            <div className="border-b border-border pb-4 flex justify-between items-end">
              <div>
                <p className="eyebrow">Your journey</p>
                <h2 className="font-display text-2xl md:text-3xl mt-1">Recently Viewed</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4 md:gap-x-8">
              {recentlyViewed.map((p: any) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* Bestsellers */}
        <section className="space-y-8">
          <div className="border-b border-border pb-4 flex justify-between items-end">
            <div>
              <p className="eyebrow">Highly coveted</p>
              <h2 className="font-display text-2xl md:text-3xl mt-1">Bestsellers</h2>
            </div>
            <Link
              href="/collections"
              className="text-xs uppercase tracking-widest text-muted-foreground hover:text-gold transition-colors"
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
              <p className="eyebrow">Fresh weaves</p>
              <h2 className="font-display text-2xl md:text-3xl mt-1">New Arrivals</h2>
            </div>
            <Link
              href="/collections"
              className="text-xs uppercase tracking-widest text-muted-foreground hover:text-gold transition-colors"
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
      </div>
    </div>
  );
}
