import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { PRODUCTS } from "@/lib/products";
import { useShop } from "@/lib/store";
import { ProductCard } from "@/components/product-card";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Wishlist — Maaya Couture" },
      { name: "description", content: "Pieces you've saved from the Maaya atelier." },
    ],
  }),
  component: Wishlist,
});

function Wishlist() {
  const wishlist = useShop((s) => s.wishlist);
  const items = PRODUCTS.filter((p) => wishlist.includes(p.id));

  return (
    <div className="container-luxe py-16">
      <div className="text-center">
        <p className="eyebrow">Saved</p>
        <h1 className="mt-3 font-display text-4xl md:text-5xl">Your wishlist</h1>
      </div>

      {items.length === 0 ? (
        <div className="mx-auto mt-20 max-w-md text-center">
          <Heart className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-6 font-display text-2xl">Nothing saved just yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Tap the heart on any piece to keep it close.
          </p>
          <Link
            to="/shop"
            search={{ category: "all" }}
            className="mt-8 inline-block border-b border-foreground pb-1 eyebrow"
          >
            Discover couture
          </Link>
        </div>
      ) : (
        <div className="mt-14 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4 md:gap-x-8">
          {items.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
