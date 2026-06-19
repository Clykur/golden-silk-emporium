import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { EDITORIAL_IMAGES } from "@/lib/media";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Drapeva" },
      {
        name: "description",
        content:
          "Discover Drapeva, your destination for comfortable, elegant, and carefully curated sarees for every occasion.",
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
          alt="Drapeva Saree Collection"
          className="absolute inset-0 h-full w-full object-cover opacity-45"
        />

        <div className="absolute inset-0 bg-background/20" />

        <div className="relative text-center z-10 px-4">
          <p className="eyebrow text-gold">About Drapeva</p>

          <h1 className="mt-3 font-display text-4xl md:text-6xl text-background">
            Comfort in Every Drape
          </h1>

          <span className="gold-divider mt-4 block mx-auto" />
        </div>
      </div>

      <div className="container-luxe py-20 space-y-24">
        {/* Section 1 */}
        <div className="grid gap-12 md:grid-cols-2 items-center">
          <div className="space-y-4">
            <p className="eyebrow text-gold">Who We Are</p>

            <h2 className="font-display text-3xl md:text-4xl">
              Where Comfort Meets Elegance
            </h2>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Drapeva is an online destination for women seeking elegant,
              comfortable, and timeless sarees. We bring together carefully
              selected collections from trusted brands and sellers, making it
              easier to discover styles that suit every occasion.
            </p>

            <p className="text-sm text-muted-foreground leading-relaxed">
              From festive celebrations and weddings to everyday elegance,
              our goal is to offer a seamless shopping experience with
              quality selections, transparent pricing, and dependable service.
            </p>
          </div>

          <div className="bg-champagne/20 border border-border p-6 shadow-soft">
            <img
              src={EDITORIAL_IMAGES.storyHero}
              alt="Drapeva Saree Collection"
              className="w-full aspect-[4/3] object-cover border border-border"
            />
          </div>
        </div>

        {/* Section 2 */}
        <div className="grid gap-12 md:grid-cols-2 items-center">
          <div className="md:order-2 space-y-4">
            <p className="eyebrow text-gold">Our Vision</p>

            <h2 className="font-display text-3xl md:text-4xl">
              Style, Comfort & Confidence
            </h2>

            <p className="text-sm text-muted-foreground leading-relaxed">
              We believe a saree should not only look beautiful but also feel
              comfortable to wear. That's why every collection on Drapeva is
              chosen with attention to quality, fabric, design, and value.
            </p>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Whether you're shopping for a special event or updating your
              wardrobe, our collections are curated to help you find the
              perfect drape with confidence.
            </p>
          </div>

          <div className="md:order-1 bg-champagne/20 border border-border p-6 shadow-soft">
            <img
              src={EDITORIAL_IMAGES.celebDeepika}
              alt="Elegant Saree Collection"
              className="w-full aspect-[4/3] object-cover border border-border"
            />
          </div>
        </div>

        {/* Section 3 */}
        <div className="bg-champagne/30 p-10 md:p-14 text-center max-w-4xl mx-auto border border-border">
          <p className="eyebrow text-gold">Why Choose Drapeva</p>

          <h2 className="mt-4 font-display text-3xl md:text-4xl">
            A Better Way to Shop Sarees Online
          </h2>

          <p className="mt-6 text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            We focus on offering thoughtfully curated collections, a smooth
            shopping experience, secure ordering, and customer-first service.
            Every saree is selected to help you discover styles that blend
            elegance, comfort, and value.
          </p>

          <p className="mt-6 text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            At Drapeva, our mission is simple — helping women find sarees
            they love wearing, for every moment that matters.
          </p>

          <Link
            to="/shop"
            className="mt-8 inline-flex items-center gap-2 text-xs uppercase tracking-wider font-semibold border-b border-foreground pb-0.5"
          >
            Explore Collection
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
