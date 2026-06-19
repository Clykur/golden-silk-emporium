import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { SlidersHorizontal, X } from "lucide-react";
import { PRODUCTS } from "@/lib/products";
import { ProductCard } from "@/components/product-card";

const searchSchema = z.object({
  category: z.string().optional(),
  fabric: z.string().optional(),
  weave: z.string().optional(),
  collection: z.string().optional(),
  occasion: z.string().optional(),
});

export const Route = createFileRoute("/shop")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "The Saree Catalog — Maaya Couture" },
      {
        name: "description",
        content:
          "Shop heirloom Indian sarees: Kanjivaram, Banarasi, Organza, Linen, and Designer weaves from the Maaya atelier.",
      },
    ],
  }),
  component: Shop,
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

const WEAVES = [
  "Kanjivaram",
  "Banarasi",
  "Jamdani",
  "Patola",
  "Chanderi",
  "Chikankari",
  "Ikat",
  "Paithani",
];

const OCCASIONS = ["Bridal", "Festive", "Reception", "Casual", "Formal"];

const COLORS = [
  "Red",
  "Green",
  "Blue",
  "Yellow",
  "Pink",
  "White",
  "Gold",
  "Violet",
  "Orange",
  "Wine",
  "Teal",
  "Peach",
];

const PRICE_BANDS: { label: string; min?: number; max?: number }[] = [
  { label: "Under ₹30,000", max: 30000 },
  { label: "₹30,000 – ₹60,000", min: 30000, max: 60000 },
  { label: "₹60,000 – ₹1,00,000", min: 60000, max: 100000 },
  { label: "Above ₹1,00,000", min: 100000 },
];

type Sort = "featured" | "price-asc" | "price-desc" | "new";

function Shop() {
  const { category, fabric, weave, collection, occasion } = Route.useSearch();

  const [selectedFabrics, setSelectedFabrics] = useState<string[]>(fabric ? [fabric] : []);
  const [selectedWeaves, setSelectedWeaves] = useState<string[]>(weave ? [weave] : []);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>(occasion ? [occasion] : []);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceBandIndex, setPriceBandIndex] = useState<number | null>(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState<Sort>("featured");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = [...PRODUCTS];

    // Filter by route URL params
    if (category && category !== "all") {
      list = list.filter(
        (p) => p.category.toLowerCase().replace(/\s+/g, "-") === category.toLowerCase(),
      );
    }
    if (collection) {
      list = list.filter(
        (p) => p.collection.toLowerCase().replace(/\s+/g, "-") === collection.toLowerCase(),
      );
    }

    // Filter by sidebar state OR URL param (whichever is active)
    const activeFabrics = selectedFabrics.length ? selectedFabrics : fabric ? [fabric] : [];
    if (activeFabrics.length) {
      list = list.filter((p) =>
        activeFabrics.some((f) => p.fabric.toLowerCase() === f.toLowerCase()),
      );
    }

    const activeWeaves = selectedWeaves.length ? selectedWeaves : weave ? [weave] : [];
    if (activeWeaves.length) {
      list = list.filter((p) =>
        activeWeaves.some((w) => p.weave.toLowerCase() === w.toLowerCase()),
      );
    }

    const activeOccasions = selectedOccasions.length
      ? selectedOccasions
      : occasion
        ? [occasion]
        : [];
    if (activeOccasions.length) {
      list = list.filter((p) =>
        activeOccasions.some((o) => p.occasion.toLowerCase() === o.toLowerCase()),
      );
    }

    if (selectedColors.length) {
      list = list.filter((p) =>
        selectedColors.some((c) => p.color.toLowerCase().includes(c.toLowerCase())),
      );
    }

    if (inStockOnly) {
      list = list.filter((p) => p.inStock);
    }

    if (priceBandIndex !== null) {
      const band = PRICE_BANDS[priceBandIndex];
      list = list.filter(
        (p) => (!band.min || p.price >= band.min) && (!band.max || p.price < band.max),
      );
    }

    // Sort
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    if (sort === "new") {
      list.sort((a, b) => (b.badge === "New" ? 1 : 0) - (a.badge === "New" ? 1 : 0));
    }

    return list;
  }, [
    category,
    fabric,
    weave,
    collection,
    occasion,
    selectedFabrics,
    selectedWeaves,
    selectedOccasions,
    selectedColors,
    priceBandIndex,
    inStockOnly,
    sort,
  ]);

  const toggle = (arr: string[], v: string, set: (a: string[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const clearAll = () => {
    setSelectedFabrics([]);
    setSelectedWeaves([]);
    setSelectedOccasions([]);
    setSelectedColors([]);
    setPriceBandIndex(null);
    setInStockOnly(false);
  };

  const heading = collection
    ? collection.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "All Couture Sarees";

  return (
    <div>
      <div className="border-b border-border bg-champagne/30">
        <div className="container-luxe py-14 md:py-20 text-center">
          <p className="eyebrow">The Atelier</p>
          <h1 className="mt-3 font-display text-4xl md:text-6xl">{heading}</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
            Each masterwork is hand-finished in our South Mumbai studio and shipped, with concierge
            care, across the world.
          </p>
          <nav className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs uppercase tracking-[0.2em]">
            <Link
              to="/shop"
              search={{}}
              className={`pb-1 border-b transition-colors ${
                !collection
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              All Weaves
            </Link>
            <Link
              to="/shop"
              search={{ collection: "heritage-weaves" }}
              className={`pb-1 border-b transition-colors ${
                collection === "heritage-weaves"
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Heritage Weaves
            </Link>
            <Link
              to="/shop"
              search={{ collection: "vivah-couture" }}
              className={`pb-1 border-b transition-colors ${
                collection === "vivah-couture"
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Vivah Couture (Bridal)
            </Link>
            <Link
              to="/shop"
              search={{ collection: "soiree" }}
              className={`pb-1 border-b transition-colors ${
                collection === "soiree"
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Soirée (Festive)
            </Link>
            <Link
              to="/shop"
              search={{ collection: "modern-minimalist" }}
              className={`pb-1 border-b transition-colors ${
                collection === "modern-minimalist"
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Modern Minimalist
            </Link>
          </nav>
        </div>
      </div>

      <div className="container-luxe py-12">
        <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
          {/* Filter sidebar */}
          <aside
            className={`${
              open ? "fixed inset-0 z-50 overflow-y-auto bg-background p-6" : "hidden"
            } lg:static lg:block lg:p-0`}
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

            <FilterGroup title="Weave Type">
              {WEAVES.map((w) => (
                <Check
                  key={w}
                  label={w}
                  checked={selectedWeaves.includes(w)}
                  onChange={() => toggle(selectedWeaves, w, setSelectedWeaves)}
                />
              ))}
            </FilterGroup>

            <FilterGroup title="Color">
              {COLORS.map((c) => (
                <Check
                  key={c}
                  label={c}
                  checked={selectedColors.includes(c)}
                  onChange={() => toggle(selectedColors, c, setSelectedColors)}
                />
              ))}
            </FilterGroup>

            <FilterGroup title="Occasion">
              {OCCASIONS.map((o) => (
                <Check
                  key={o}
                  label={o}
                  checked={selectedOccasions.includes(o)}
                  onChange={() => toggle(selectedOccasions, o, setSelectedOccasions)}
                />
              ))}
            </FilterGroup>

            <FilterGroup title="Price Range">
              {PRICE_BANDS.map((b, i) => (
                <Check
                  key={b.label}
                  label={b.label}
                  checked={priceBandIndex === i}
                  onChange={() => setPriceBandIndex(priceBandIndex === i ? null : i)}
                />
              ))}
            </FilterGroup>

            <FilterGroup title="Availability">
              <Check
                label="In Stock Only"
                checked={inStockOnly}
                onChange={() => setInStockOnly(!inStockOnly)}
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
              <p className="text-sm text-muted-foreground">{filtered.length} masterworks found</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setOpen(true)}
                  className="inline-flex items-center gap-2 border border-border px-4 py-2 text-xs uppercase tracking-[0.2em] lg:hidden font-medium"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" /> Filter
                </button>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as Sort)}
                  className="border border-border bg-background px-3 py-2 text-xs uppercase tracking-[0.2em] focus:outline-none focus:border-foreground cursor-pointer font-medium"
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
                <p className="font-display text-2xl">No sarees match your current filters</p>
                <button
                  onClick={clearAll}
                  className="mt-4 border-b border-foreground pb-1 eyebrow text-xs"
                >
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
        className={`grid h-4 w-4 shrink-0 place-items-center border transition-colors ${
          checked ? "border-foreground bg-foreground" : "border-border"
        }`}
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
