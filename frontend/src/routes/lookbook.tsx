import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, X, ArrowRight } from "lucide-react";
import { formatINR } from "@/lib/products";

export const Route = createFileRoute("/lookbook")({
  head: () => ({
    meta: [
      { title: "Interactive Lookbook — Maaya Couture" },
      {
        name: "description",
        content: "Explore our interactive lookbook styling heritage handwoven sarees.",
      },
    ],
  }),
  component: EditorialLookbook,
});

type Hotspot = {
  id: string;
  top: string;
  left: string;
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
  };
};

const HOTSPOTS: Hotspot[] = [
  {
    id: "h1",
    top: "42%",
    left: "55%",
    product: {
      id: "saree-1-varanasi-heritage",
      name: "Varanasi Heritage Zardozi Saree",
      price: 84500,
      image: "https://images.unsplash.com/photo-1610189012906-4c0aa9b9781e?auto=format&fit=crop&w=600&q=80",
    },
  },
  {
    id: "h2",
    top: "35%",
    left: "38%",
    product: {
      id: "saree-6-mayur",
      name: "Mayur Handwoven Kanjivaram Saree",
      price: 56800,
      image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80",
    },
  },
];

function EditorialLookbook() {
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);

  return (
    <div>
      <div className="border-b border-border bg-champagne/30">
        <div className="container-luxe py-14 md:py-20 text-center">
          <p className="eyebrow">Interactive</p>
          <h1 className="mt-3 font-display text-4xl md:text-6xl">Editorial Lookbook</h1>
          <span className="gold-divider mt-4 block mx-auto" />
          <p className="mx-auto mt-5 max-w-xl text-sm text-muted-foreground leading-relaxed">
            Click on the atelier markers (+) on the styled model look below to shop the
            hand-finished sarees.
          </p>
        </div>
      </div>

      <div className="container-luxe py-16 flex justify-center">
        <div className="relative w-full max-w-2xl aspect-[3/4] bg-champagne/20 border border-border shadow-soft overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1641699862936-be9f49b1c38d?auto=format&fit=crop&w=1200&q=80"
            alt="Atelier photoshoot edit"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-ink/10" />

          {/* Hotspot Markers */}
          {HOTSPOTS.map((hotspot) => (
            <button
              key={hotspot.id}
              onClick={() => setActiveHotspot(hotspot)}
              style={{ top: hotspot.top, left: hotspot.left }}
              className="absolute z-20 grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-gold text-gold-foreground border-2 border-background animate-pulse transition-transform hover:scale-110 cursor-pointer"
              aria-label={`View ${hotspot.product.name}`}
            >
              <Plus className="h-4 w-4" />
            </button>
          ))}

          {/* Active Hotspot Info Card */}
          {activeHotspot && (
            <div className="absolute bottom-6 left-6 right-6 z-30 bg-background/95 border border-border p-4 shadow-soft backdrop-blur-md flex items-center gap-4 animate-rise">
              <img
                src={activeHotspot.product.image}
                alt=""
                className="h-20 w-15 object-cover border border-border"
              />
              <div className="flex-1 min-w-0">
                <p className="font-display text-base leading-tight truncate">
                  {activeHotspot.product.name}
                </p>
                <p className="text-sm font-semibold mt-1 text-gold">
                  {formatINR(activeHotspot.product.price)}
                </p>
                <Link
                  to="/product/$id"
                  params={{ id: activeHotspot.product.id }}
                  className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground mt-2 border-b border-muted-foreground"
                >
                  View Details <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <button
                onClick={() => setActiveHotspot(null)}
                className="p-1 hover:text-gold transition-colors cursor-pointer"
                aria-label="Close details"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
