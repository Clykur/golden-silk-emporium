"use client";

import Link from "next/link";
import { useRouter, usePathname, useSearchParams, useParams } from "next/navigation";
import { useShop } from "@/lib/store";
import { useQuery } from "@tanstack/react-query";
import { productsApi } from "@/lib/api";
import { ProductCard } from "@/components/product-card";
import { Heart, ArrowRight } from "lucide-react";

export default function Wishlist() {
  const wishlistItems = useShop((s) => s.wishlistItems);

  const { data: allFeatured = [], isLoading } = useQuery({
    queryKey: ["featured-for-wishlist"],
    queryFn: () => productsApi.getFeatured(8),
    enabled: wishlistItems.length === 0,
  });

  if (wishlistItems.length === 0) {
    return (
      <div className="container-luxe py-16 space-y-16">
        <div className="text-center py-20 border border-dashed border-border bg-champagne/5 relative overflow-hidden max-w-xl mx-auto space-y-5">
          <Heart className="h-10 w-10 mx-auto text-muted-foreground stroke-1" />
          <h1 className="font-display text-3xl">Your Wishlist is Empty</h1>
          <p className="mt-3 text-muted-foreground text-sm max-w-xs mx-auto">
            Save the pieces that speak to you. Begin compiling your personal couture curation.
          </p>
          <div className="pt-2">
            <Link
              href="/collections"
              className="bg-foreground text-background px-7 py-3.5 text-xs font-semibold tracking-widest uppercase hover:bg-gold hover:text-gold-foreground transition-all duration-300 inline-flex items-center gap-2 group"
            >
              Explore Collection{" "}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {!isLoading && allFeatured.length > 0 && (
          <section className="space-y-8 pt-10">
            <h2 className="font-display text-2xl md:text-3xl border-b border-border pb-4">
              Trending &amp; Recommended
            </h2>
            <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4 md:gap-x-8">
              {allFeatured.map((p: any) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  return (
    <div className="container-luxe py-16">
      <div className="border-b border-border pb-6 mb-10">
        <p className="eyebrow">Saved items</p>
        <h1 className="mt-3 font-display text-4xl">Your Wishlist ({wishlistItems.length})</h1>
      </div>
      <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4">
        {wishlistItems.map((p: any) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
