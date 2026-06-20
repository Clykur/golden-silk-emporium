"use client";

import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { productsApi, categoriesApi } from "@/lib/api";
import { ProductCard } from "@/components/product-card";
import { Pagination } from "@/components/pagination";
import { SkeletonLoader } from "@/components/skeleton-loader";
import { Search, X, Folder, HelpCircle, ArrowRight } from "lucide-react";
import { useState, useEffect, Suspense } from "react";

export const dynamic = "force-dynamic";

const SUGGESTED_SEARCHES = [
  "Banarasi",
  "Kanjivaram",
  "Silk",
  "Cotton",
  "Celebrity Looks",
  "Vivah Couture",
];

function SearchContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const [query, setQuery] = useState(q || "");
  const page = parseInt(searchParams.get("page") || "1") || 1;

  const { data: results = [], isLoading } = useQuery({
    queryKey: ["search", q],
    queryFn: () =>
      q.trim().length >= 2 ? productsApi.list({ search: q.trim() }) : Promise.resolve([]),
    enabled: q.trim().length >= 2,
  });

  const { data: categories = [], isLoading: catLoading } = useQuery({
    queryKey: ["search-categories"],
    queryFn: () => categoriesApi.list(),
  });

  const { data: trending = [], isLoading: trendLoading } = useQuery({
    queryKey: ["search-trending"],
    queryFn: () => productsApi.getBestsellers(4),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleSuggestClick = (term: string) => {
    setQuery(term);
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  const itemsPerPage = 8;
  const totalPages = Math.ceil(results.length / itemsPerPage);
  const currentPage = Math.min(page, totalPages || 1);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedResults = results.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(pageNumber));
    router.push(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    setQuery(q);
  }, [q]);

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
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </form>

        {/* Quick Suggestions Strip */}
        <div className="mt-4 flex flex-wrap justify-center gap-2 items-center text-xs">
          <span className="text-muted-foreground">Suggested:</span>
          {SUGGESTED_SEARCHES.map((term) => (
            <button
              key={term}
              onClick={() => handleSuggestClick(term)}
              className="text-gold hover:text-foreground transition-colors font-medium cursor-pointer"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {q.trim().length >= 2 ? (
        <div>
          <p className="text-sm text-muted-foreground mb-8">
            {isLoading ? "Searching..." : `${results.length} results for "${q}"`}
          </p>
          {results.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4">
                {paginatedResults.map((p: any) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  className="mt-12"
                />
              )}
            </>
          ) : !isLoading ? (
            /* Search No Results Fallback Layout */
            <div className="space-y-16 py-10">
              <div className="text-center py-16 border border-dashed border-border bg-champagne/5 max-w-xl mx-auto space-y-4">
                <HelpCircle className="h-10 w-10 mx-auto text-muted-foreground stroke-1" />
                <h3 className="font-display text-2xl">No products found</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  We couldn't find any masterpieces matching "
                  <span className="font-semibold text-foreground">{q}</span>". Try using broader
                  search terms or browse collections below.
                </p>
                <div className="pt-2">
                  <Link
                    href="/shop"
                    className="inline-block bg-foreground text-background px-6 py-2.5 text-xs font-semibold tracking-widest uppercase hover:bg-gold hover:text-gold-foreground transition-all duration-300"
                  >
                    Browse All Sarees
                  </Link>
                </div>
              </div>

              {/* Popular Categories */}
              {categories.length > 0 && (
                <section className="space-y-6">
                  <h3 className="font-display text-xl border-b border-border pb-3">
                    Popular Categories
                  </h3>
                  <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    {categories.map((cat: any) => (
                      <Link
                        key={cat.id}
                        href={`/shop?category=${cat.slug}`}
                        className="group flex items-center gap-4 border border-border p-4 hover:border-gold hover:bg-gold/5 transition-all"
                      >
                        <div className="h-8 w-8 rounded bg-gold/15 grid place-items-center text-gold group-hover:bg-gold/25 transition-colors">
                          <Folder className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider truncate">
                          {cat.name}
                        </span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground ml-auto group-hover:text-gold group-hover:translate-x-0.5 transition-all" />
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Trending Products */}
              {trending.length > 0 && (
                <section className="space-y-6">
                  <h3 className="font-display text-xl border-b border-border pb-3">
                    Trending Sarees
                  </h3>
                  <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4 md:gap-x-8">
                    {trending.map((p: any) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4">
              <SkeletonLoader variant="product-card" count={4} />
            </div>
          )}
        </div>
      ) : (
        /* Default landing suggestions when no query entered yet */
        <div className="space-y-12 pt-6">
          {/* Trending Products */}
          {trending.length > 0 && (
            <section className="space-y-6">
              <h3 className="font-display text-xl border-b border-border pb-3">Trending Sarees</h3>
              <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4 md:gap-x-8">
                {trendLoading ? (
                  <SkeletonLoader variant="product-card" count={4} />
                ) : (
                  trending.map((p: any) => <ProductCard key={p.id} product={p} />)
                )}
              </div>
            </section>
          )}

          {/* Categories */}
          {categories.length > 0 && (
            <section className="space-y-6">
              <h3 className="font-display text-xl border-b border-border pb-3">
                Popular Categories
              </h3>
              <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                {categories.map((cat: any) => (
                  <Link
                    key={cat.id}
                    href={`/shop?category=${cat.slug}`}
                    className="group flex items-center gap-4 border border-border p-4 hover:border-gold hover:bg-gold/5 transition-all"
                  >
                    <div className="h-8 w-8 rounded bg-gold/15 grid place-items-center text-gold group-hover:bg-gold/25 transition-colors">
                      <Folder className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider truncate">
                      {cat.name}
                    </span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground ml-auto group-hover:text-gold group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container-luxe py-16 text-center">Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
}
