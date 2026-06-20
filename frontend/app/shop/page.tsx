"use client";

import Link from "next/link";
import { useRouter, usePathname, useSearchParams, useParams } from "next/navigation";
import { useMemo, useState, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { SlidersHorizontal, X } from "lucide-react";
import { productsApi } from "@/lib/api";
import { ProductCard } from "@/components/product-card";
import { Pagination } from "@/components/pagination";
import type { Product } from "@/lib/types";

const searchSchema = z.object({
  category: z.string().optional(),
  fabric: z.string().optional(),
  collection: z.string().optional(),
  occasion: z.string().optional(),
  search: z.string().optional(),
});

const FABRICS = [
  "Silk",
  "Kanjivaram",
  "Banarasi",
  "Organza",
  "Chiffon",
  "Linen",
  "Cotton",
  "Designer",
  "Handloom",
  "Contemporary",
];
const PRICE_BANDS: { label: string; min?: number; max?: number }[] = [
  "Under ₹2,000",
  "₹2,000 – ₹3,500",
  "₹3,500 – ₹5,000",
  "Above ₹5,000",
].map((l, i) => {
  const bands = [
    { label: "Under ₹2,000", max: 2000 },
    { label: "₹2,000 – ₹3,500", min: 2000, max: 3500 },
    { label: "₹3,500 – ₹5,000", min: 3500, max: 5000 },
    { label: "Above ₹5,000", min: 5000 },
  ];
  return bands[i];
});
type Sort = "featured" | "price-asc" | "price-desc" | "newest";

function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] bg-champagne/40" />
      <div className="mt-3 h-3 w-3/4 bg-champagne/60 rounded" />
      <div className="mt-2 h-3 w-1/2 bg-champagne/40 rounded" />
      <div className="mt-2 h-3 w-1/3 bg-champagne/30 rounded" />
    </div>
  );
}

export const dynamic = "force-dynamic";

function ShopContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || undefined;
  const fabric = searchParams.get("fabric") || undefined;
  const collection = searchParams.get("collection") || undefined;
  const occasion = searchParams.get("occasion") || undefined;
  const searchParam = searchParams.get("search") || undefined;
  const page = parseInt(searchParams.get("page") || "1") || 1;

  const [selectedFabrics, setSelectedFabrics] = useState<string[]>(fabric ? [fabric] : []);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>(occasion ? [occasion] : []);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceBandIndex, setPriceBandIndex] = useState<number | null>(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState<Sort>("featured");
  const [open, setOpen] = useState(false);

  // Fetch all products matching high-level URL filters from Supabase
  const { data: allProducts = [], isLoading } = useQuery({
    queryKey: ["shop-products", category, collection, occasion, fabric, searchParam],
    queryFn: () =>
      productsApi.list({
        category,
        collection,
        fabric: selectedFabrics.length === 1 ? selectedFabrics[0] : fabric,
        occasion: selectedOccasions.length === 1 ? selectedOccasions[0] : occasion,
        search: searchParam,
        sort,
      }),
  });

  // Client-side filtering for multi-select options
  const filtered = useMemo(() => {
    let list = [...allProducts];

    if (selectedFabrics.length) {
      list = list.filter((p) =>
        selectedFabrics.some((f) => (p.fabric || "").toLowerCase() === f.toLowerCase()),
      );
    }
    if (selectedOccasions.length) {
      list = list.filter((p) =>
        selectedOccasions.some((o) => (p.occasion || "").toLowerCase() === o.toLowerCase()),
      );
    }
    if (selectedColors.length) {
      list = list.filter((p) =>
        selectedColors.some((c) => (p.color || "").toLowerCase().includes(c.toLowerCase())),
      );
    }
    if (inStockOnly) {
      list = list.filter((p) => p.stock_quantity > 0);
    }
    if (priceBandIndex !== null) {
      const band = PRICE_BANDS[priceBandIndex];
      list = list.filter(
        (p) => (!band.min || p.price >= band.min) && (!band.max || p.price < band.max),
      );
    }
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    if (sort === "newest")
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return list;
  }, [
    allProducts,
    selectedFabrics,
    selectedOccasions,
    selectedColors,
    priceBandIndex,
    inStockOnly,
    sort,
  ]);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentPage = Math.min(page, totalPages || 1);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filtered.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(pageNumber));
    router.push(`${pathname}?${params.toString()}`);
  };

  const toggle = (arr: string[], v: string, set: (a: string[]) => void) => {
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
    // Reset page to 1 on filter change
    const params = new URLSearchParams(window.location.search);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearAll = () => {
    setSelectedFabrics([]);
    setSelectedOccasions([]);
    setSelectedColors([]);
    setPriceBandIndex(null);
    setInStockOnly(false);
    const params = new URLSearchParams(window.location.search);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div>
      <div className="border-b border-border bg-champagne/30">
        <div className="container-luxe py-8 md:py-8 text-center">
          <p className="eyebrow">Comfort in Every Drape</p>
          <h1 className="mt-3 font-display text-4xl md:text-6xl">DRAPEVA</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
            Every saree is carefully selected for its quality, comfort, and elegance, then delivered
            across India with reliable shipping and dedicated customer support.
          </p>
        </div>
      </div>

      <div className="container-luxe py-12">
        <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
          {/* Filter sidebar */}
          <aside
            className={`${open ? "fixed inset-0 z-50 overflow-y-auto bg-background p-6" : "hidden"} lg:static lg:block lg:p-0`}
          >
            <div className="flex items-center justify-between lg:hidden mb-6">
              <p className="font-display text-xl">Filters</p>
              <button onClick={() => setOpen(false)} aria-label="Close" className="p-2">
                <X className="h-5 w-5" />
              </button>
            </div>

            <FilterGroup title="Fabric">
              {FABRICS.map((f) => (
                <Check
                  key={f}
                  label={f}
                  checked={selectedFabrics.includes(f)}
                  onChange={() => toggle(selectedFabrics, f, setSelectedFabrics)}
                />
              ))}
            </FilterGroup>

            <FilterGroup title="Price Range">
              {PRICE_BANDS.map((b, i) => (
                <Check
                  key={b.label}
                  label={b.label}
                  checked={priceBandIndex === i}
                  onChange={() => {
                    setPriceBandIndex(priceBandIndex === i ? null : i);
                    const params = new URLSearchParams(window.location.search);
                    params.delete("page");
                    router.push(`${pathname}?${params.toString()}`);
                  }}
                />
              ))}
            </FilterGroup>
            <FilterGroup title="Availability">
              <Check
                label="In Stock Only"
                checked={inStockOnly}
                onChange={() => {
                  setInStockOnly(!inStockOnly);
                  const params = new URLSearchParams(window.location.search);
                  params.delete("page");
                  router.push(`${pathname}?${params.toString()}`);
                }}
              />
            </FilterGroup>

            <div className="mt-8 flex gap-3 lg:flex-col">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 bg-foreground py-3 text-xs uppercase tracking-[0.2em] text-background lg:hidden font-medium"
              >
                Show {filtered.length} pieces
              </button>
              <button
                onClick={clearAll}
                className="flex-1 border border-border py-3 text-xs uppercase tracking-[0.2em] hover:border-foreground font-medium transition-colors"
              >
                Clear all
              </button>
            </div>
          </aside>

          <div>
            <div className="mb-8 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {isLoading ? "Loading..." : `${filtered.length} masterworks found`}
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setOpen(true)}
                  className="inline-flex items-center gap-2 border border-border px-4 py-2 text-xs uppercase tracking-[0.2em] lg:hidden font-medium"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" /> Filter
                </button>
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value as Sort);
                    const params = new URLSearchParams(window.location.search);
                    params.delete("page");
                    router.push(`${pathname}?${params.toString()}`);
                  }}
                  className="border border-border bg-background px-3 py-2 text-xs uppercase tracking-[0.2em] focus:outline-none focus:border-foreground cursor-pointer font-medium"
                >
                  <option value="featured">Featured</option>
                  <option value="newest">Newest</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 md:gap-x-8">
                {Array.from({ length: 9 }).map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="grid place-items-center py-24 text-center">
                <p className="font-display text-2xl">No sarees match your current filters</p>
                <button
                  onClick={clearAll}
                  className="mt-4 border-b border-foreground pb-1 eyebrow text-xs"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 md:gap-x-8">
                  {paginatedProducts.map((p: Product) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Shop() {
  return (
    <Suspense fallback={<div className="container-luxe py-24 text-center">Loading shop...</div>}>
      <ShopContent />
    </Suspense>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-border py-6 first:pt-0 lg:first:pt-0">
      <p className="eyebrow mb-4">{title}</p>
      <div className="space-y-3 max-h-48 overflow-y-auto pr-2">{children}</div>
    </div>
  );
}

function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm select-none">
      <span
        onClick={onChange}
        className={`grid h-4 w-4 shrink-0 place-items-center border transition-colors ${checked ? "border-foreground bg-foreground" : "border-border"}`}
      >
        {checked && <span className="h-1.5 w-1.5 bg-background" />}
      </span>
      <span
        className={
          checked ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
        }
      >
        {label}
      </span>
    </label>
  );
}
