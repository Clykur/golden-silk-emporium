"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Plus, Minus, Ruler, Star } from "lucide-react";
import { toast } from "sonner";
import { useShop } from "@/lib/store";
import { formatINR } from "@/lib/types";
import type { Product } from "@/lib/types";
import { useAuth } from "@/lib/auth-store";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
}

const SIZES = ["Standard (5.5m)", "Short (5m)", "Long (6m)", "Petite (5.2m)"];

export function ProductCard({ product }: ProductCardProps) {
  const { wishlist, toggleWishlist, setQuickView, cart, addToCart, updateQty, removeFromCart } =
    useShop();
  const isAuthenticated = useAuth((s) => s.isAuthenticated());
  const router = useRouter();
  const [selectingSize, setSelectingSize] = useState(false);
  const isWished = wishlist.includes(product.id);
  const displayPrice = product.sale_price || product.price;
  const originalPrice = product.sale_price ? product.price : product.compare_at || null;
  const cartItem = cart.find((c) => c.product.id === product.id);
  const qty = cartItem ? cartItem.qty : 0;

  // Calculate average rating from approved reviews
  const approvedReviews = product.reviews?.filter((r) => r.is_approved !== false) || [];
  const avgRating =
    approvedReviews.length > 0
      ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length
      : 0;

  return (
    <article className="group relative">
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-champagne/30">
        <Link href={`/product/${product.slug}`}>
          <img
            src={product.image || "/media/placeholder-saree.jpg"}
            alt={product.name}
            loading="lazy"
            width={600}
            height={800}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/media/placeholder-saree.jpg";
            }}
          />
        </Link>

        {/* Badge */}
        {(product.badge || product.is_new_arrival || product.is_bestseller) && (
          <div className="absolute top-3 left-3">
            <span className="bg-gold text-gold-foreground px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] font-semibold">
              {product.badge || (product.is_new_arrival ? "New" : "Best Seller")}
            </span>
          </div>
        )}

        {/* Sale badge */}
        {product.sale_price && (
          <div className="absolute top-3 right-10">
            <span className="bg-destructive text-white px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] font-semibold">
              Sale
            </span>
          </div>
        )}

        {/* Out of stock overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
            <span className="border border-border bg-background px-4 py-2 text-xs uppercase tracking-[0.2em]">
              Sold Out
            </span>
          </div>
        )}

        {/* Wishlist */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!isAuthenticated) {
              router.push(
                `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}&message=${encodeURIComponent("Please sign in to continue shopping.")}`,
              );
              return;
            }
            toggleWishlist(product.id);
          }}
          className="absolute top-3 right-3 p-2 transition-transform hover:scale-110"
          aria-label={isWished ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`h-5 w-5 transition-colors ${isWished ? "fill-white text-white" : "text-white"}`}
          />
        </button>

        {/* Quick view / Add to Cart on hover */}
        <div
          className={`absolute bottom-0 inset-x-0 bg-background/95 backdrop-blur-sm border-t border-border transition-all duration-300 ${qty > 0 || selectingSize ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full group-hover:opacity-100 group-hover:translate-y-0"}`}
        >
          {qty > 0 ? (
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-[10px] uppercase tracking-widest font-medium">
                In Bag ({cartItem!.size})
              </span>
              <div className="flex items-center gap-4 bg-background border border-border px-2 py-1">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (qty === 1) removeFromCart(product.id);
                    else updateQty(product.id, cartItem!.size, qty - 1);
                  }}
                  className="p-1 hover:text-gold transition-colors"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="text-xs font-medium w-4 text-center">{qty}</span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    updateQty(product.id, cartItem!.size, qty + 1);
                  }}
                  className="p-1 hover:text-gold transition-colors"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>
          ) : selectingSize ? (
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-widest font-medium">
                  Select Size
                </span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectingSize(false);
                  }}
                  className="text-[10px] text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SIZES.map((s) => (
                  <button
                    key={s}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      addToCart(product, s, 1);
                      setSelectingSize(false);
                      toast.success(`Added ${s} to bag`);
                    }}
                    className="flex-1 min-w-[45%] border border-border py-1.5 text-[9px] uppercase tracking-widest hover:border-foreground hover:bg-foreground hover:text-background transition-colors text-center"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!product.inStock) return;
                setSelectingSize(true);
              }}
              disabled={!product.inStock}
              className="w-full bg-foreground py-3 text-[10px] uppercase tracking-[0.2em] text-background font-medium hover:bg-gold hover:text-gold-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {product.inStock ? "Add to Bag" : "Sold Out"}
            </button>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="mt-4 space-y-1">
        <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
          {product.collection?.name || product.fabric}
        </p>
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-display text-base leading-snug hover:text-gold transition-colors line-clamp-2 min-h-[2rem] flex items-start mb-1">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1 mb-1 h-4">
          <Star
            className={`h-3.5 w-3.5 ${
              avgRating > 0 ? "fill-yellow-400 text-yellow-400" : "text-yellow-400"
            }`}
          />
          <span className="text-[10px] text-muted-foreground font-medium">
            {avgRating > 0 ? `${avgRating.toFixed(1)} (${approvedReviews.length})` : "0.0 (0)"}
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold">{formatINR(displayPrice)}</span>
            {originalPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {formatINR(originalPrice)}
              </span>
            )}
          </div>
          {!product.inStock && (
            <span className="text-[9px] uppercase tracking-widest text-destructive font-semibold">
              Sold Out
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
