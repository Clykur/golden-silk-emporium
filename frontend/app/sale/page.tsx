"use client";

import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { productsApi } from "@/lib/api";
import { ProductCard } from "@/components/product-card";
import { Pagination } from "@/components/pagination";
import { ArrowRight, Tag } from "lucide-react";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

function SaleSareesContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1") || 1;

  const { data: list = [], isLoading } = useQuery({
    queryKey: ["sale-page-products"],
    queryFn: () => productsApi.list({ isSale: true }),
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
        <div className="container-luxe py-14 md:py-20 text-center relative overflow-hidden">
          <div className="absolute top-1/2 right-10 -translate-y-1/2 opacity-10 pointer-events-none hidden md:block">
            <Tag className="h-24 w-24 text-gold rotate-90" />
          </div>
          <p className="eyebrow">Exclusive Offers</p>
          <h1 className="mt-3 font-display text-4xl md:text-6xl">Sarees on Sale</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
            Premium handwoven drapes available at special seasonal pricing.
          </p>
        </div>
      </div>
      <div className="container-luxe py-16">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse" role="status">
                <div className="aspect-[3/4] bg-champagne/40" />
                <div className="mt-3 h-3 w-3/4 bg-champagne/60 rounded" />
                <div className="mt-2 h-3 w-1/2 bg-champagne/40 rounded" />
              </div>
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-display text-2xl">No sarees currently on sale</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Please check back soon for our next seasonal curation.
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

export default function SaleSarees() {
  return (
    <Suspense
      fallback={<div className="container-luxe py-24 text-center">Loading sale items...</div>}
    >
      <SaleSareesContent />
    </Suspense>
  );
}
