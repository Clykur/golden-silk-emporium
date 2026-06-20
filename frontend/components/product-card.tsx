"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { useShop } from "@/lib/store";
import { formatINR } from "@/lib/types";
import type { Product } from "@/lib/types";
import { useAuth } from "@/lib/auth-store";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { wishlist, toggleWishlist, setQuickView } = useShop();
  const isAuthenticated = useAuth((s) => s.isAuthenticated());
  const router = useRouter();
  const isWished = wishlist.includes(product.id);
  const displayPrice = product.sale_price || product.price;
  const originalPrice = product.sale_price ? product.price : product.compare_at || null;

  return (
    <article className="group relative">
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-champagne/30">
        <Link href={`/product/${product.slug}`}>
          <img
            src={product.image || "/placeholder-saree.jpg"}
            alt={product.name}
            loading="lazy"
            width={600}
            height={800}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder-saree.jpg";
            }}
          />
        </Link>

        {/* Badge */}
        {(product.badge || product.is_new_arrival || product.is_bestseller) && (
          <div className="absolute top-3 left-3">
            <span className="bg-gold text-gold-foreground px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] font-semibold">
              {product.badge || (product.is_new_arrival ? "New" : "Bestseller")}
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
          className="absolute top-3 right-3 p-2 bg-background/80 hover:bg-background transition-colors"
          aria-label={isWished ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`h-4 w-4 transition-colors ${isWished ? "fill-gold text-gold" : "text-foreground"}`}
          />
        </button>

        {/* Quick view on hover */}
        <button
          onClick={() => setQuickView(product)}
          className="absolute bottom-0 inset-x-0 bg-foreground py-3 text-[10px] uppercase tracking-[0.2em] text-background opacity-0 group-hover:opacity-100 transition-opacity font-medium"
        >
          Quick View
        </button>
      </div>

      {/* Info */}
      <div className="mt-4 space-y-1">
        <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
          {product.collection?.name || product.fabric}
        </p>
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-display text-base leading-snug hover:text-gold transition-colors line-clamp-2 min-h-[2.75rem] flex items-start">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold">{formatINR(displayPrice)}</span>
          {originalPrice && (
            <span className="text-xs text-muted-foreground line-through">
              {formatINR(originalPrice)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
