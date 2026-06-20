"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useShop } from "@/lib/store";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { productsApi } from "@/lib/api";
import { ProductCard } from "@/components/product-card";
import { SkeletonLoader } from "@/components/skeleton-loader";

export default function CartPage() {
  const router = useRouter();
  const openCart = useShop((s) => s.openCart);
  const cart = useShop((s) => s.cart);

  useEffect(() => {
    if (cart.length > 0) {
      openCart();
      router.replace("/checkout");
    }
  }, [cart, openCart, router]);

  const { data: recommended = [], isLoading } = useQuery({
    queryKey: ["cart-empty-recommended"],
    queryFn: () => productsApi.getFeatured(4),
    enabled: cart.length === 0,
  });

  if (cart.length > 0) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </div>
    );
  }

  // Standalone Empty Cart Page
  return (
    <div className="bg-background min-h-screen">
      <section className="container-luxe py-20 text-center border-b border-border bg-champagne/15 relative overflow-hidden">
        <div className="absolute inset-4 border border-gold/10 pointer-events-none" />
        <div className="max-w-xl mx-auto space-y-5 relative z-10 animate-rise">
          <div className="h-16 w-16 mx-auto rounded bg-gold/10 grid place-items-center text-gold border border-gold/20">
            <ShoppingBag className="h-7 w-7" />
          </div>
          <p className="eyebrow text-gold font-bold tracking-[0.25em]">Shopping Bag</p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-ink leading-tight">
            Your Bag is Empty
          </h1>
          <span className="gold-divider mx-auto block" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            You haven't added any pieces to your collection yet. Let's find you a handwoven
            masterpiece.
          </p>
          <div className="pt-6">
            <Link
              href="/shop"
              className="bg-foreground text-background px-8 py-4 text-xs font-semibold tracking-widest uppercase hover:bg-gold hover:text-gold-foreground transition-all duration-300 inline-flex items-center gap-2 group"
            >
              Start Shopping
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Suggested Masterpieces */}
      <section className="container-luxe py-20 space-y-8">
        <div className="border-b border-border pb-4 flex justify-between items-end">
          <div>
            <p className="eyebrow">Highly recommended</p>
            <h2 className="font-display text-2xl md:text-3xl mt-1">Recommended for You</h2>
          </div>
          <Link
            href="/shop"
            className="text-xs uppercase tracking-widest text-muted-foreground hover:text-gold transition-colors font-medium"
          >
            Explore All
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4">
            <SkeletonLoader variant="product-card" count={4} />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4 md:gap-x-8">
            {recommended.map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
