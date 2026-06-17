import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { SlidersHorizontal, X } from "lucide-react";
import { PRODUCTS } from "@/lib/products";
import { ProductCard } from "@/components/product-card";

const searchSchema = z.object({
  category: z.enum(["all", "Sarees", "Lehengas", "Suits", "Bridal"]).catch("all"),
});

export const Route = createFileRoute("/shop")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Shop — Maaya Couture" },
      { name: "description", content: "Shop handwoven sarees, lehengas, anarkalis and bridal couture from the Maaya atelier." },
    ],
  }),
  component: Shop,
});

const FABRICS = ["Silk", "Banarasi", "Georgette", "Velvet"] as const;
const OCCASIONS = ["Bridal", "Festive", "Reception", "Everyday"] as const;
const PRICE_BANDS = [
  { label: "Under ₹30,000", max: 30000 },
  { label: "₹30,000 – ₹50,000", min: 30000, max: 50000 },
  { label: "₹50,000 – ₹75,000", min: 50000, max: 75000 },
  { label: "Above ₹75,000", min: 75000 },
] as const;

type Sort = "featured" | "price-asc" | "price-desc" | "new";

function Shop() {
  const { category } = Route.useSearch();
  const [fabrics, setFabrics] = useState<string[]>([]);
  const [occasions, setOccasions] = useState<string[]>([]);
  const [price, setPrice] = useState<number | null>(null);
  const [sort, setSort] = useState<Sort>("featured");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = [...PRODUCTS];
    if (category !== "all") {
      if (category === "Bridal") list = list.filter((p) => p.occasion === "Bridal");
      else list = list.filter((p) => p.category === category);
    }
    if (fabrics.length) list = list.filter((p) => fabrics.includes(p.fabric));
    if (occasions.length) list = list.filter((p) => occasions.includes(p.occasion));
    if (price !== null) {
      const band = PRICE_BANDS[price];
      list = list.filter((p) => (!band.min || p.price >= band.min) && (!band.max || p.price < band.max));
    }
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    if (sort === "new") list.sort((a, b) => (b.badge === "New" ? 1 : 0) - (a.badge === "New" ? 1 : 0));
    return list;
  }, [category, fabrics, occasions, price, sort]);

  const toggle = (arr: string[], v: string, set: (a: string[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const clearAll = () => { setFabrics([]); setOccasions([]); setPrice(null); };

  const heading = category === "all" ? "All Couture" : category;

  return (
    <div>
      <div className="border-b border-border bg-champagne/30">
        <div className="container-luxe py-14 md:py-20 text-center">
          <p className="eyebrow">The Edit</p>
          <h1 className="mt-3 font-display text-4xl md:text-6xl">{heading}</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
            Each piece is hand-finished in our Mumbai atelier and shipped, with care, anywhere in the world.
          </p>
          <nav className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs uppercase tracking-[0.2em]">
            {(["all", "Sarees", "Lehengas", "Suits", "Bridal"] as const).map((c) => (
              <Link
                key={c}
                to="/shop"
                search={{ category: c }}
                className={`pb-1 border-b transition-colors ${
                  c === category
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {c === "all" ? "All" : c}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="container-luxe py-12">
        <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
          {/* Filter sidebar */}
          <aside
            className={`${open ? "fixed inset-0 z-50 overflow-y-auto bg-background p-6" : "hidden"} lg:static lg:block lg:p-0`}
          >
            <div className="flex items-center justify-between lg:hidden">
              <p className="font-display text-xl">Filter</p>
              <button onClick={() => setOpen(false)} aria-label="Close" className="p-2">
                <X className="h-5 w-5" />
              </button>
            </div>

            <FilterGroup title="Fabric">
              {FABRICS.map((f) => (
                <Check key={f} label={f} checked={fabrics.includes(f)} onChange={() => toggle(fabrics, f, setFabrics)} />
              ))}
            </FilterGroup>
            <FilterGroup title="Occasion">
              {OCCASIONS.map((o) => (
                <Check key={o} label={o} checked={occasions.includes(o)} onChange={() => toggle(occasions, o, setOccasions)} />
              ))}
            </FilterGroup>
            <FilterGroup title="Price">
              {PRICE_BANDS.map((b, i) => (
                <Check key={b.label} label={b.label} checked={price === i} onChange={() => setPrice(price === i ? null : i)} />
              ))}
            </FilterGroup>
            <div className="mt-8 flex gap-3 lg:flex-col">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 bg-foreground py-3 text-xs uppercase tracking-[0.2em] text-background lg:hidden"
              >
                Show {filtered.length} pieces
              </button>
              <button
                onClick={clearAll}
                className="flex-1 border border-border py-3 text-xs uppercase tracking-[0.2em] hover:border-foreground"
              >
                Clear all
              </button>
            </div>
          </aside>

          <div>
            <div className="mb-8 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{filtered.length} pieces</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setOpen(true)}
                  className="inline-flex items-center gap-2 border border-border px-4 py-2 text-xs uppercase tracking-[0.2em] lg:hidden"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" /> Filter
                </button>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as Sort)}
                  className="border border-border bg-background px-3 py-2 text-xs uppercase tracking-[0.2em] focus:outline-none focus:border-foreground"
                >
                  <option value="featured">Featured</option>
                  <option value="new">Newest</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="grid place-items-center py-24 text-center">
                <p className="font-display text-2xl">Nothing matches just yet</p>
                <button onClick={clearAll} className="mt-4 border-b border-foreground pb-1 eyebrow">
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 md:gap-x-8">
                {filtered.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-border py-6 first:pt-0 lg:first:pt-0">
      <p className="eyebrow mb-4">{title}</p>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm">
      <span
        onClick={onChange}
        className={`grid h-4 w-4 shrink-0 place-items-center border transition-colors ${
          checked ? "border-foreground bg-foreground" : "border-border"
        }`}
      >
        {checked && <span className="h-1.5 w-1.5 bg-background" />}
      </span>
      <span className={`select-none ${checked ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
        {label}
      </span>
    </label>
  );
}
