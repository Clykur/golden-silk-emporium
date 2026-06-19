import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, ShoppingBag, X } from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import { wishlistApi, cartApi } from "@/lib/api";
import { formatINR, normalizeProduct } from "@/lib/types";
import { useShop } from "@/lib/store";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

export const Route = createFileRoute("/dashboard/wishlist")({
  head: () => ({
    meta: [
      { title: "Wishlist — Drapeva" },
      { name: "description", content: "Your saved pieces and favourites." },
    ],
  }),
  component: Wishlist,
});

function Wishlist() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { addToCart } = useShop();

  const { data: wishlist = [], isLoading } = useQuery({
    queryKey: ["my-wishlist", user?.id],
    queryFn: () => user ? wishlistApi.get(user.id) : Promise.resolve([]),
    enabled: !!user,
  });

  const removeMut = useMutation({
    mutationFn: (productId: string) => wishlistApi.remove(user!.id, productId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-wishlist"] });
      toast.success("Removed from wishlist");
    },
  });

  const handleAddToCart = (item: any) => {
    const product = normalizeProduct({
      ...item.product,
      images: item.product?.images || [],
      category: null,
      collection: null,
    });
    const defaultSize = product.sizes?.[0] || "Free Size";
    addToCart(product, defaultSize);
    toast.success(`${product.name} added to bag`);
  };

  return (
    <DashboardLayout title="My Wishlist" subtitle="Saved Pieces">
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-border animate-pulse h-72 bg-champagne/10" />
          ))}
        </div>
      ) : wishlist.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-border">
          <Heart className="h-10 w-10 mx-auto text-muted-foreground stroke-1 mb-4" />
          <p className="font-display text-xl">Your wishlist is empty</p>
          <p className="text-sm text-muted-foreground mt-2">
            Save your favourite pieces to revisit later.
          </p>
          <Link
            to="/shop"
            search={{ category: "all" }}
            className="mt-6 inline-block bg-foreground text-background px-6 py-3 text-xs uppercase tracking-widest"
          >
            Explore Collections
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {wishlist.map((item: any) => {
            const product = item.product;
            const image = product?.images?.[0]?.url || product?.images?.find((i: any) => i.is_featured)?.url;
            return (
              <div key={item.id} className="group border border-border bg-background hover:border-gold/30 transition-colors relative">
                {/* Remove button */}
                <button
                  onClick={() => removeMut.mutate(product.id)}
                  className="absolute top-3 right-3 z-10 h-7 w-7 rounded-full bg-background/80 backdrop-blur grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity border border-border hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>

                {/* Image */}
                <Link to="/product/$id" params={{ id: product.id }}>
                  <div className="aspect-[3/4] overflow-hidden bg-champagne/10">
                    {image ? (
                      <img src={image} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                        <Heart className="h-8 w-8 stroke-1" />
                      </div>
                    )}
                  </div>
                </Link>

                {/* Info */}
                <div className="p-4">
                  <Link to="/product/$id" params={{ id: product.id }}>
                    <p className="font-medium text-sm leading-snug hover:text-gold transition-colors line-clamp-2">
                      {product.name}
                    </p>
                  </Link>
                  <p className="text-gold font-display text-lg mt-1">{formatINR(product.price)}</p>
                  {product.stock_quantity === 0 && (
                    <p className="text-[10px] uppercase tracking-wider text-red-500 mt-1">Out of Stock</p>
                  )}

                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={product.stock_quantity === 0}
                    className="mt-3 w-full bg-foreground text-background py-2.5 text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-gold hover:text-gold-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    {product.stock_quantity === 0 ? "Out of Stock" : "Add to Bag"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
