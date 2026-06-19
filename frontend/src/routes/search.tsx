import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { productsApi } from "@/lib/api";
import { ProductCard } from "@/components/product-card";
import { Search, X } from "lucide-react";
import { z } from "zod";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/search")({
  validateSearch: z.object({ q: z.string().optional() }),
  head: ({ search }) => ({
    meta: [
      { title: `${search.q ? `"${search.q}" — ` : ""}Search — Drapeva` },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const [query, setQuery] = useState(q || "");

  const { data: results = [], isLoading } = useQuery({
    queryKey: ["search", query],
    queryFn: () => query.trim().length >= 2 ? productsApi.list({ search: query.trim() }) : Promise.resolve([]),
    enabled: query.trim().length >= 2,
  });

  const navigate = Route.useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ search: { q: query } });
  };

  return (
    <div className="container-luxe py-16">
      <div className="max-w-2xl mx-auto mb-12 text-center">
        <p className="eyebrow">Search the Atelier</p>
        <h1 className="mt-3 font-display text-4xl md:text-5xl">Find your saree</h1>
        <form onSubmit={handleSearch} className="mt-8 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by fabric, name, or occasion..."
            className="w-full border border-border bg-background pl-11 pr-12 py-4 text-base focus:outline-none focus:border-foreground"
            autoFocus
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2">
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </form>
      </div>

      {query.trim().length >= 2 && (
        <div>
          <p className="text-sm text-muted-foreground mb-8">
            {isLoading ? "Searching..." : `${results.length} results for "${query}"`}
          </p>
          {results.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4">
              {results.map((p: any) => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : !isLoading ? (
            <div className="py-16 text-center">
              <p className="font-display text-2xl">No results found</p>
              <p className="mt-2 text-sm text-muted-foreground">Try a different search term.</p>
              <Link to="/shop" search={{}} className="mt-6 inline-block border-b border-foreground pb-1 eyebrow text-xs">
                Browse all sarees
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => <div key={i} className="animate-pulse"><div className="aspect-[3/4] bg-champagne/40" /></div>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
