import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { COLLECTION_IMAGES } from "@/lib/media";

export const Route = createFileRoute("/collections/")({
  head: () => ({
    meta: [
      { title: "Atelier Collections — Maaya Couture" },
      {
        name: "description",
        content: "Explore our curated edits of Banarasi, Kanjivaram, and designer silk sarees.",
      },
    ],
  }),
  component: CollectionsIndex,
});

const COLLECTION_EDITS = [
  {
    slug: "heritage-weaves",
    name: "Heritage Weaves",
    tagline: "Handloom masterworks",
    desc: "A tribute to Katan silk, real gold zari, and heirloom weaves direct from Varanasi and Kanchipuram master weavers.",
    image: COLLECTION_IMAGES.heritageWeaves,
  },
  {
    slug: "vivah-couture",
    name: "Vivah Couture",
    tagline: "The bridal trousseau",
    desc: "Intricately detailed bridal silk sarees hand-finished with gold thread zardozi and real pearls for the luxury bride.",
    image: COLLECTION_IMAGES.vivahCouture,
  },
  {
    slug: "soiree",
    name: "Soirée",
    tagline: "For the celebration",
    desc: "Fluid chiffons, designer organzas and shimmering crystal cut borders for modern evening receptions and festive ceremonies.",
    image: COLLECTION_IMAGES.soiree,
  },
  {
    slug: "modern-minimalist",
    name: "Modern Minimalist",
    tagline: "Contemporary drapes",
    desc: "Contemporary hand-block linens and breathable mulmul cottons designed for everyday elegance and effortless grace.",
    image: COLLECTION_IMAGES.modernMinimalist,
  },
];

function CollectionsIndex() {
  return (
    <div>
      <div className="border-b border-border bg-champagne/30">
        <div className="container-luxe py-14 md:py-20 text-center">
          <p className="eyebrow">The Atelier</p>
          <h1 className="mt-3 font-display text-4xl md:text-6xl">Seasonal Edits</h1>
          <span className="gold-divider mt-4 block mx-auto" />
          <p className="mx-auto mt-5 max-w-xl text-sm text-muted-foreground leading-relaxed">
            Discover curations designed in our Mumbai studio, capturing centuries-old artisan
            traditions for the modern silhouette.
          </p>
        </div>
      </div>

      <div className="container-luxe py-16 space-y-16">
        {COLLECTION_EDITS.map((col, index) => (
          <div key={col.slug} className={`grid gap-8 items-center md:grid-cols-2`}>
            <div
              className={`overflow-hidden bg-champagne/40 ${index % 2 === 1 ? "md:order-2" : ""}`}
            >
              <img
                src={col.image}
                alt={col.name}
                loading="lazy"
                className="w-full aspect-[4/3] object-cover transition-transform duration-1000 hover:scale-105"
              />
            </div>
            <div className={`space-y-4 md:px-8 ${index % 2 === 1 ? "md:order-1" : ""}`}>
              <p className="eyebrow text-gold">{col.tagline}</p>
              <h2 className="font-display text-3xl md:text-4xl">{col.name}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{col.desc}</p>
              <Link
                to="/shop"
                search={{ collection: col.slug }}
                className="inline-flex items-center gap-3 border border-foreground/60 px-6 py-3.5 text-xs font-semibold tracking-widest uppercase hover:border-foreground hover:bg-foreground hover:text-background transition-all"
              >
                Browse the edit <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
