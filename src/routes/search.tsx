import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Search } from "lucide-react";
import { PRODUCTS } from "@/lib/products";
import { ProductCard } from "@/components/product-card";

const searchSchema = z.object({
  q: z.string().catch(""),
});

export const Route = createFileRoute("/search")({
  validateSearch: searchSchema,
  head: (ctx: any) => ({
    meta: [
      { title: `Search Results for "${ctx.search?.q || ""}" — Maaya Couture` },
      { name: "description", content: `Browse search results matching keyword query.` },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    if (!q) {
      setResults([]);
      return;
    }
    // Client-side search matching products
    const query = q.toLowerCase();
    const filtered = PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.fabric.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query),
    );
    setResults(filtered);
  }, [q]);

  return (
    <div>
      <div className="border-b border-border bg-champagne/30">
        <div className="container-luxe py-14 md:py-20 text-center">
          <p className="eyebrow flex items-center justify-center gap-2">
            <Search className="h-4 w-4 text-gold" /> Atelier Query
          </p>
          <h1 className="mt-3 font-display text-4xl md:text-5xl">
            {q ? `Search: "${q}"` : "Search Catalog"}
          </h1>
          <span className="gold-divider mt-4 block mx-auto" />
        </div>
      </div>

      <div className="container-luxe py-16">
        {!q ? (
          <div className="text-center py-20">
            <p className="text-sm text-muted-foreground font-display">
              Enter keywords in the header query to search our fabrics.
            </p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-display text-xl text-muted-foreground">
              We found no matches for your search.
            </p>
            <Link
              to="/shop"
              search={{ category: "all" }}
              className="mt-4 inline-block border-b border-foreground pb-0.5 eyebrow"
            >
              Browse all items
            </Link>
          </div>
        ) : (
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-8">
              {results.length} results matching search terms
            </p>
            <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4 md:gap-x-8">
              {results.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
