import { createFileRoute, Link } from "@tanstack/react-router";
import { useShop } from "@/lib/store";
import { useQuery } from "@tanstack/react-query";
import { productsApi } from "@/lib/api";
import { ProductCard } from "@/components/product-card";
import { Heart, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [{ title: "Wishlist — Drapeva" }],
  }),
  component: Wishlist,
});

function Wishlist() {
  const wishlist = useShop((s) => s.wishlist);

  const { data: allFeatured = [], isLoading } = useQuery({
    queryKey: ["featured-for-wishlist"],
    queryFn: () => productsApi.getFeatured(8),
    enabled: wishlist.length === 0,
  });

  if (wishlist.length === 0) {
    return (
      <div className="container-luxe py-16">
        <div className="text-center py-16 border border-dashed border-border">
          <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-5" />
          <h1 className="font-display text-3xl">Your wishlist is empty</h1>
          <p className="mt-3 text-muted-foreground text-sm">Save the pieces that speak to you.</p>
          <Link to="/shop" search={{}} className="mt-8 inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 text-xs uppercase tracking-widest hover:bg-gold hover:text-gold-foreground transition-colors">
            Browse the shop <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {!isLoading && allFeatured.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display text-3xl mb-8">You may love</h2>
            <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4">
              {allFeatured.map((p: any) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    );
  }

  const { data: products = [], isLoading: loadingProds } = useQuery({
    queryKey: ["wishlist-products", wishlist.join(",")],
    queryFn: async () => {
      const results = await Promise.all(wishlist.map((id) => productsApi.getBySlug(id).catch(() => null)));
      return results.filter(Boolean);
    },
    enabled: wishlist.length > 0,
  });

  return (
    <div className="container-luxe py-16">
      <div className="border-b border-border pb-6 mb-10">
        <p className="eyebrow">Saved items</p>
        <h1 className="mt-3 font-display text-4xl">Your Wishlist ({wishlist.length})</h1>
      </div>
      {loadingProds ? (
        <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4">
          {Array.from({ length: wishlist.length }).map((_, i) => <div key={i} className="animate-pulse"><div className="aspect-[3/4] bg-champagne/40" /></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4">
          {products.map((p: any) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
