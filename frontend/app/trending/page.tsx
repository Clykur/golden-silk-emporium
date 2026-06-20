"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { productsApi } from "@/lib/api";
import { ProductCard } from "@/components/product-card";
import { ArrowRight, Sparkles } from "lucide-react";

export default function TrendingSarees() {
  const { data: list = [], isLoading } = useQuery({
    queryKey: ["trending-page-products"],
    queryFn: async () => {
      // Get products that are featured or bestsellers
      const [featured, bestsellers] = await Promise.all([
        productsApi.list({ isFeatured: true }),
        productsApi.list({ isBestseller: true }),
      ]);

      // Combine and deduplicate
      const combined = [...featured, ...bestsellers];
      const seen = new Set();
      return combined
        .filter((p) => {
          if (seen.has(p.id)) return false;
          seen.add(p.id);
          return true;
        })
        .slice(0, 24);
    },
  });

  return (
    <div>
      <div className="border-b border-border bg-champagne/30">
        <div className="container-luxe py-14 md:py-20 text-center relative overflow-hidden">
          <div className="absolute top-1/2 left-10 -translate-y-1/2 opacity-10 pointer-events-none hidden md:block">
            <Sparkles className="h-24 w-24 text-gold" />
          </div>
          <p className="eyebrow">Most Coveted</p>
          <h1 className="mt-3 font-display text-4xl md:text-6xl">Trending Sarees</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
            The season's most loved styles, trending now among our patrons.
          </p>
        </div>
      </div>
      <div className="container-luxe py-16">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse" role="status">
                <div className="aspect-[3/4] bg-champagne/40" />
                <div className="mt-3 h-3 w-3/4 bg-champagne/60 rounded" />
                <div className="mt-2 h-3 w-1/2 bg-champagne/40 rounded" />
              </div>
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-display text-2xl">No trending sarees found</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Check back soon for curated trends.
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-flex items-center gap-2 border-b border-foreground pb-1 eyebrow text-xs"
            >
              Browse all sarees <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4">
            {list.map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
