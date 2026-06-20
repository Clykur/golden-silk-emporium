"use client";

import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { productsApi } from "@/lib/api";
import { ProductCard } from "@/components/product-card";
import { Pagination } from "@/components/pagination";
import { ArrowRight } from "lucide-react";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

function BestsellersContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1") || 1;

  const { data: list = [], isLoading } = useQuery({
    queryKey: ["bestsellers"],
    queryFn: () => productsApi.getBestsellers(100), // Load more to support pagination
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(list.length / itemsPerPage);
  const currentPage = Math.min(page, totalPages || 1);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = list.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(pageNumber));
    router.push(`${pathname}?${params.toString()}`);
  };

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
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-champagne/40" />
              </div>
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-display text-2xl">No bestsellers found</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Mark products as "Bestseller" in the admin panel.
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-flex items-center gap-2 border-b border-foreground pb-1 eyebrow text-xs"
            >
              Browse all sarees <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4">
              {paginatedProducts.map((p: any) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              className="mt-12"
            />
          </>
        )}
      </div>
    </div>
  );
}

export default function Bestsellers() {
  return (
    <Suspense
      fallback={<div className="container-luxe py-24 text-center">Loading bestsellers...</div>}
    >
      <BestsellersContent />
    </Suspense>
  );
}
