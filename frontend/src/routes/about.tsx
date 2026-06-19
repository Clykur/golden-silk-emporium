import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { EDITORIAL_IMAGES } from "@/lib/media";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Our Story — Maaya Couture" },
      {
        name: "description",
        content:
          "Learn about the heritage of Maaya Couture: handwoven silk sarees, master weavers, and artisanal zardozi work.",
      },
    ],
  }),
  component: AboutUs,
});

function AboutUs() {
  return (
    <div>
      {/* Hero */}
      <div
        data-hero-section
        className="relative h-[50svh] min-h-[350px] w-full bg-ink text-background flex items-center justify-center"
      >
        <img
          src={EDITORIAL_IMAGES.storyHero}
          alt="Model in Banarasi Silk Saree"
          className="absolute inset-0 h-full w-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-background/20" />
        <div className="relative text-center z-10 px-4">
          <p className="eyebrow text-gold">The Atelier</p>
          <h1 className="mt-3 font-display text-4xl md:text-6xl text-background">
            The Brand Story
          </h1>
          <span className="gold-divider mt-4 block mx-auto" />
        </div>
      </div>

      <div className="container-luxe py-20 space-y-24">
        {/* Section 1: History */}
        <div className="grid gap-12 md:grid-cols-2 items-center">
          <div className="space-y-4">
            <p className="eyebrow text-gold">Origins</p>
            <h2 className="font-display text-3xl md:text-4xl">Heirlooms from Mumbai</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Established in 1998, Maaya Couture began as a small boutique atelier in South Mumbai,
              dedicated to restoring antique zardozi borders and royal silk sarees. Today, we
              collaborate with over 250 master weavers across Banaras, Kanchipuram, and West Bengal
              to craft modern heirloom sarees.
            </p>
          </div>
          <div className="bg-champagne/20 border border-border p-6 shadow-soft">
            <img
              src={EDITORIAL_IMAGES.storyCraft}
              alt="Silk weaving border detail"
              className="w-full aspect-[4/3] object-cover border border-border"
            />
          </div>
        </div>

        {/* Section 2: Craftsmanship */}
        <div className="grid gap-12 md:grid-cols-2 items-center">
          <div className="md:order-2 space-y-4">
            <p className="eyebrow text-gold">The Loom</p>
            <h2 className="font-display text-3xl md:text-4xl">Craftsmanship & Weaving</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every saree is a calculation in patience. A single Katan silk weave takes up to three
              master weavers working in unison on a traditional handloom. Our zardozi borders are
              finished in our South Mumbai studio by fifth-generation artisans, using hand-twisted
              metallic threads and real fresh-water seed pearls.
            </p>
          </div>
          <div className="md:order-1 bg-champagne/20 border border-border p-6 shadow-soft">
            <img
              src={EDITORIAL_IMAGES.storyLoom}
              alt="Colorful silk threads on loom"
              className="w-full aspect-[4/3] object-cover border border-border"
            />
          </div>
        </div>

        {/* Section 3: Artisan Stories Quote */}
        <div className="bg-champagne/30 p-10 md:p-14 text-center max-w-3xl mx-auto border border-border">
          <p className="eyebrow text-gold">Master Weaver Speak</p>
          <blockquote className="mt-6 font-display text-xl md:text-2xl leading-relaxed italic">
            "When we throw the shuttle on the loom, we are not just matching threads. We are
            carrying forward the memory of our grandfather's grandfather. Maaya respects our craft
            by bringing our handwoven sarees directly to patrons across the globe."
          </blockquote>
          <p className="mt-6 eyebrow font-semibold text-xs">
            — Ramesh Kumar, Varanasi Loom Coordinator
          </p>
          <Link
            to="/shop"
            search={{ collection: "heritage-weaves" }}
            className="mt-8 inline-flex items-center gap-2 text-xs uppercase tracking-wider font-semibold border-b border-foreground pb-0.5"
          >
            Explore Weaves <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
