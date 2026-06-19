import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { productsApi } from "@/lib/api";
import { ProductCard } from "@/components/product-card";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/bestsellers")({
  head: () => ({
    meta: [
      { title: "Bestsellers — Drapeva" },
      { name: "description", content: "Our most-loved sarees, chosen by thousands of discerning patrons." },
    ],
  }),
  component: Bestsellers,
});

function Bestsellers() {
  const { data: list = [], isLoading } = useQuery({
    queryKey: ["bestsellers"],
    queryFn: () => productsApi.getBestsellers(24),
  });

  return (
    <div>
      <div className="border-b border-border bg-champagne/30">
        <div className="container-luxe py-14 md:py-20 text-center">
          <p className="eyebrow">Most Loved</p>
          <h1 className="mt-3 font-display text-4xl md:text-6xl">Bestsellers</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
            The sarees our patrons return to, again and again.
          </p>
        </div>
      </div>
      <div className="container-luxe py-16">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse"><div className="aspect-[3/4] bg-champagne/40" /></div>
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-display text-2xl">No bestsellers found</p>
            <p className="mt-2 text-sm text-muted-foreground">Mark products as "Bestseller" in the admin panel.</p>
            <Link to="/shop" search={{}} className="mt-6 inline-flex items-center gap-2 border-b border-foreground pb-1 eyebrow text-xs">
              Browse all sarees <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4">
            {list.map((p: any) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
