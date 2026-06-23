"use client";

import { X, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useShop } from "@/lib/store";
import { formatINR } from "@/lib/products";
import { useAuth } from "@/lib/auth-store";

export function QuickView() {
  const quickView = useShop((s) => s.quickView);
  const setQuickView = useShop((s) => s.setQuickView);
  const addToCart = useShop((s) => s.addToCart);
  const wishlist = useShop((s) => s.wishlist);
  const toggleWishlist = useShop((s) => s.toggleWishlist);
  const isAuthenticated = useAuth((s) => s.isAuthenticated());
  const router = useRouter();

  useEffect(() => {
    document.body.style.overflow = quickView ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [quickView]);

  if (!quickView) return null;
  const wished = wishlist.includes(quickView.id);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div className="absolute inset-0 bg-ink/50 animate-rise" onClick={() => setQuickView(null)} />
      <div className="relative grid w-full max-w-4xl grid-cols-1 overflow-hidden bg-background shadow-2xl animate-rise md:grid-cols-2 max-h-[92vh]">
        <button
          onClick={() => setQuickView(null)}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-background/90 backdrop-blur hover:bg-background"
        >
          <X className="h-4 w-4" />
        </button>
        <img
          src={quickView.image}
          alt={quickView.name}
          className="h-72 w-full object-cover md:h-full"
        />
        <div className="flex flex-col overflow-y-auto p-7 md:p-10">
          <p className="eyebrow">{quickView?.collection_id}</p>
          <h3 className="mt-2 font-display text-2xl md:text-3xl">{quickView.name}</h3>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-lg">{formatINR(quickView.price)}</span>
            {quickView.compareAt && (
              <span className="text-sm text-muted-foreground line-through">
                {formatINR(quickView.compareAt)}
              </span>
            )}
          </div>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            {quickView.description}
          </p>

          <div className="mt-auto pt-8 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  setQuickView(null);
                  router.push(
                    `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}&message=${encodeURIComponent("Please sign in to continue shopping.")}`,
                  );
                  return;
                }
                addToCart(quickView, "Free Size");
                setQuickView(null);
              }}
              className="flex-1 bg-foreground py-4 text-xs font-medium tracking-[0.25em] uppercase text-background hover:bg-gold hover:text-gold-foreground transition-colors"
            >
              Add to bag
            </button>
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  setQuickView(null);
                  router.push(
                    `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}&message=${encodeURIComponent("Please sign in to continue shopping.")}`,
                  );
                  return;
                }
                toggleWishlist(quickView);
              }}
              aria-label="Wishlist"
              className="grid place-items-center border border-border px-5 py-4 hover:border-foreground transition-colors"
            >
              <Heart className={`h-4 w-4 ${wished ? "fill-gold text-gold" : ""}`} />
            </button>
          </div>

          <Link
            href={`/product/${quickView.slug}`}
            onClick={() => setQuickView(null)}
            className="mt-4 text-center text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
          >
            View full details →
          </Link>
        </div>
      </div>
    </div>
  );
}
