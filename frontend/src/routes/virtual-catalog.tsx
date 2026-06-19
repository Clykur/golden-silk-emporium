import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ChevronRight, BookOpen, ArrowRight } from "lucide-react";
import { EDITORIAL_IMAGES } from "@/lib/media";

export const Route = createFileRoute("/virtual-catalog")({
  head: () => ({
    meta: [
      { title: "Virtual Catalog — Maaya Couture" },
      {
        name: "description",
        content: "Flip through our digital catalog and explore master designs.",
      },
    ],
  }),
  component: VirtualCatalog,
});

const PAGES = [
  {
    title: "Vivah Couture Cover",
    tagline: "The Bridal Atelier",
    desc: "A celebration of hand-embroidered velvet and gold zardozi motifs.",
    image: EDITORIAL_IMAGES.catalogPage1,
    productId: "noor-crimson",
  },
  {
    title: "Heritage Weaves Cover",
    tagline: "Banarasi & Kanjivaram Rarities",
    desc: "Pure mulberry silk handloom textiles woven in ancient Varanasi lanes.",
    image: EDITORIAL_IMAGES.catalogPage2,
    productId: "meera-emerald",
  },
  {
    title: "Soirée Couture Cover",
    tagline: "Celebration Fluidity",
    desc: "Shimmering crystal-cut borders and flowing pastels for evening receptions.",
    image: EDITORIAL_IMAGES.catalogPage3,
    productId: "ivaana-ivory",
  },
  {
    title: "Varanasi Heritage Weaves",
    tagline: "The Real Gold tested Zari Saree",
    desc: "Blush Banarasi silk woven in 24k tested zari designed with master looms.",
    image: EDITORIAL_IMAGES.catalogPage4,
    productId: "saira-blush",
  },
];

function VirtualCatalog() {
  const [currentPage, setCurrentPage] = useState(0);

  const nextPage = () => {
    if (currentPage < PAGES.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const current = PAGES[currentPage];

  return (
    <div>
      <div className="border-b border-border bg-champagne/30">
        <div className="container-luxe py-14 md:py-20 text-center">
          <p className="eyebrow flex items-center justify-center gap-2">
            <BookOpen className="h-4 w-4 text-gold" /> Atelier Journal
          </p>
          <h1 className="mt-3 font-display text-4xl md:text-6xl">Virtual Catalog</h1>
          <span className="gold-divider mt-4 block mx-auto" />
          <p className="mx-auto mt-5 max-w-xl text-sm text-muted-foreground leading-relaxed">
            Flip through the seasonal atelier pages to read artisan stories and explore
            ready-to-measure commissions.
          </p>
        </div>
      </div>

      <div className="container-luxe py-16 flex flex-col items-center">
        <div className="relative w-full max-w-4xl border border-border bg-background shadow-soft grid md:grid-cols-2">
          {/* Left / Page Image */}
          <div className="aspect-[3/4] overflow-hidden bg-champagne/10 border-b md:border-b-0 md:border-r border-border">
            <img
              src={current.image}
              alt=""
              className="w-full h-full object-cover transition-all duration-700 animate-rise"
            />
          </div>

          {/* Right / Page Details */}
          <div className="p-8 md:p-12 flex flex-col justify-between h-full min-h-[400px]">
            <div className="space-y-4">
              <p className="text-[10px] uppercase tracking-[0.25em] text-gold">{current.tagline}</p>
              <h2 className="font-display text-3xl md:text-4xl mt-3">{current.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed pt-2">{current.desc}</p>
            </div>

            <div className="pt-6">
              <Link
                to="/product/$id"
                params={{ id: current.productId }}
                className="group inline-flex items-center gap-3 bg-foreground px-6 py-4 text-[10px] font-bold tracking-[0.25em] uppercase text-background transition-colors hover:bg-gold hover:text-gold-foreground"
              >
                Inquire details{" "}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="mt-8 border-t border-border pt-6 flex justify-between items-center text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              <span>
                Plate {currentPage + 1} of {PAGES.length}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 0}
                  className="p-2 border border-border disabled:opacity-30 hover:border-foreground transition-colors"
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={nextPage}
                  disabled={currentPage === PAGES.length - 1}
                  className="p-2 border border-border disabled:opacity-30 hover:border-foreground transition-colors"
                  aria-label="Next Page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
