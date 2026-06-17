import { Link } from "@tanstack/react-router";
import { Heart, Eye } from "lucide-react";
import { useShop } from "@/lib/store";
import { formatINR, type Product } from "@/lib/products";

export function ProductCard({ product, priority }: { product: Product; priority?: boolean }) {
  const wishlist = useShop((s) => s.wishlist);
  const toggleWishlist = useShop((s) => s.toggleWishlist);
  const setQuickView = useShop((s) => s.setQuickView);
  const wished = wishlist.includes(product.id);

  return (
    <article className="group">
      <Link
        to="/product/$id"
        params={{ id: product.id }}
        className="relative block overflow-hidden bg-champagne/40"
      >
        <div className="aspect-[3/4] overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            loading={priority ? "eager" : "lazy"}
            width={900}
            height={1200}
            className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.05]"
          />
        </div>

        {product.badge && (
          <span className="absolute left-4 top-4 bg-background/90 px-2.5 py-1 eyebrow text-[0.6rem] text-foreground backdrop-blur">
            {product.badge}
          </span>
        )}

        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          aria-label="Add to wishlist"
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-background/90 backdrop-blur transition-colors hover:bg-background"
        >
          <Heart
            className={`h-4 w-4 transition-all ${
              wished ? "fill-gold text-gold" : "text-foreground"
            }`}
          />
        </button>

        <button
          onClick={(e) => {
            e.preventDefault();
            setQuickView(product);
          }}
          className="absolute inset-x-3 bottom-3 inline-flex items-center justify-center gap-2 bg-foreground py-3 text-xs font-medium tracking-[0.2em] uppercase text-background opacity-0 translate-y-3 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100"
        >
          <Eye className="h-3.5 w-3.5" /> Quick view
        </button>
      </Link>

      <div className="pt-5">
        <p className="eyebrow text-[0.6rem]">{product.collection}</p>
        <Link
          to="/product/$id"
          params={{ id: product.id }}
          className="mt-1.5 block font-display text-lg leading-tight hover:text-gold transition-colors"
        >
          {product.name}
        </Link>
        <div className="mt-1.5 flex items-baseline gap-2 text-sm">
          <span>{formatINR(product.price)}</span>
          {product.compareAt && (
            <span className="text-xs text-muted-foreground line-through">
              {formatINR(product.compareAt)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
