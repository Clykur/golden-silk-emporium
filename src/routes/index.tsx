import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Instagram, Star, Truck, Sparkles, ShieldCheck } from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import bannerImg from "@/assets/collection-banner.jpg";
import { PRODUCTS, COLLECTIONS } from "@/lib/products";
import { ProductCard } from "@/components/product-card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Maaya Couture — Heirloom Indian Sarees, Lehengas & Bridal" },
      { name: "description", content: "An atelier of heirloom Indian couture — handwoven sarees, lehengas and bridal pieces, made-to-order for the modern bride." },
      { property: "og:title", content: "Maaya Couture — Heirloom Indian Couture" },
      { property: "og:description", content: "Handwoven sarees, lehengas and bridal couture, made-to-order in India." },
    ],
  }),
  component: Home,
});

const TESTIMONIALS = [
  { name: "Ananya M.", city: "Mumbai", quote: "My Maaya lehenga felt like an heirloom from the very first try. The craftsmanship is unmatched.", rating: 5 },
  { name: "Priya S.", city: "London", quote: "The concierge helped me design my reception saree from across the world. It arrived perfect.", rating: 5 },
  { name: "Ishita R.", city: "Delhi", quote: "Soft, regal, and unmistakably mine. I will be wearing this for decades.", rating: 5 },
];

function Home() {
  const bestsellers = PRODUCTS.filter((p) => p.badge === "Bestseller" || p.compareAt).slice(0, 4);
  const newArrivals = PRODUCTS.filter((p) => p.badge === "New").concat(PRODUCTS).slice(0, 4);

  return (
    <div>
      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <div className="relative h-[88svh] min-h-[640px] w-full overflow-hidden">
          <img
            src={heroImg}
            alt="Model in champagne silk saree"
            className="absolute inset-0 h-full w-full object-cover animate-ken-burns"
            width={1920}
            height={1100}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/55 via-background/10 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent" />

          <div className="container-luxe relative z-10 flex h-full flex-col justify-end pb-20 md:justify-center md:pb-0">
            <div className="max-w-xl animate-rise">
              <p className="eyebrow flex items-center gap-3">
                <span className="gold-divider" /> The Vivah Edit · AW26
              </p>
              <h1 className="mt-5 font-display text-5xl leading-[1.05] md:text-7xl">
                Heirlooms,<br />
                <em className="italic shimmer-text">re-imagined</em>.
              </h1>
              <p className="mt-6 max-w-md text-base leading-relaxed text-foreground/80">
                Handwoven sarees, sculpted lehengas, and quietly opulent bridal
                pieces — crafted in our Mumbai atelier and shipped, with care,
                across the world.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  to="/shop"
                  search={{ category: "all" }}
                  className="group inline-flex items-center gap-3 bg-foreground px-7 py-4 text-xs font-medium tracking-[0.25em] uppercase text-background transition-colors hover:bg-gold hover:text-gold-foreground"
                >
                  Shop the edit
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/shop"
                  search={{ category: "Bridal" }}
                  className="inline-flex items-center gap-3 border border-foreground/60 px-7 py-4 text-xs font-medium tracking-[0.25em] uppercase hover:border-foreground hover:bg-foreground hover:text-background transition-colors"
                >
                  Book a bridal consult
                </Link>
              </div>
            </div>
          </div>

          <div className="absolute bottom-6 right-6 hidden md:block">
            <p className="eyebrow text-foreground/70">Scroll</p>
            <div className="mt-3 h-12 w-px bg-foreground/40" />
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-y border-border bg-champagne/30">
        <div className="container-luxe grid grid-cols-2 gap-6 py-8 md:grid-cols-4">
          {[
            { icon: Sparkles, t: "Hand-finished", s: "by master artisans" },
            { icon: Truck, t: "Complimentary shipping", s: "across India" },
            { icon: ShieldCheck, t: "Made-to-measure", s: "in 3–6 weeks" },
            { icon: Star, t: "4.9 / 5 rating", s: "from 12,000+ brides" },
          ].map(({ icon: Icon, t, s }) => (
            <div key={t} className="flex items-center gap-3">
              <Icon className="h-5 w-5 shrink-0 text-gold" />
              <div className="min-w-0">
                <p className="text-sm font-medium">{t}</p>
                <p className="text-xs text-muted-foreground">{s}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* COLLECTIONS */}
      <section className="container-luxe py-24 md:py-32">
        <div className="flex flex-col items-center text-center">
          <p className="eyebrow flex items-center gap-3">
            <span className="gold-divider" /> The Collections <span className="gold-divider" />
          </p>
          <h2 className="mt-5 font-display text-4xl md:text-5xl">An atelier of stories</h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Three worlds, woven by hand. Each collection is a love letter to
            an Indian craft, reinterpreted for now.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {COLLECTIONS.map((c, i) => (
            <Link
              key={c.slug}
              to="/shop"
              search={{ category: "all" }}
              className={`group relative block overflow-hidden ${i === 1 ? "md:translate-y-8" : ""}`}
            >
              <div className="aspect-[3/4] overflow-hidden bg-champagne/40">
                <img
                  src={c.image}
                  alt={c.name}
                  loading="lazy"
                  width={900}
                  height={1200}
                  className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110"
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 via-ink/40 to-transparent p-7 text-background">
                <p className="eyebrow text-background/70">{c.tagline}</p>
                <h3 className="mt-2 font-display text-3xl">{c.name}</h3>
                <span className="mt-3 inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-gold">
                  Explore <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* BESTSELLERS */}
      <section className="container-luxe pb-24 md:pb-32">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <p className="eyebrow">Most loved</p>
            <h2 className="mt-3 font-display text-3xl md:text-4xl">Bestsellers</h2>
          </div>
          <Link
            to="/shop"
            search={{ category: "all" }}
            className="eyebrow inline-flex items-center gap-2 hover:text-gold transition-colors"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4 md:gap-x-8">
          {bestsellers.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* EDITORIAL BANNER */}
      <section className="relative isolate overflow-hidden bg-ink text-background">
        <img
          src={bannerImg}
          alt="Folded silk sarees"
          className="absolute inset-0 h-full w-full object-cover opacity-40"
          loading="lazy"
        />
        <div className="container-luxe relative grid items-center gap-10 py-24 md:grid-cols-2 md:py-36">
          <div>
            <p className="eyebrow text-gold">The Bridal Atelier</p>
            <h2 className="mt-5 font-display text-4xl leading-tight md:text-6xl">
              For the bride who whispers, not shouts.
            </h2>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-background/75">
              A private, by-appointment experience with our couturiers — in
              Mumbai, or on a video call from anywhere in the world. Sketches,
              fabrics, fittings, and finally, your forever piece.
            </p>
            <Link
              to="/shop"
              search={{ category: "Bridal" }}
              className="mt-9 inline-flex items-center gap-3 border border-gold px-7 py-4 text-xs tracking-[0.25em] uppercase text-gold hover:bg-gold hover:text-gold-foreground transition-colors"
            >
              Book an appointment <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="container-luxe py-24 md:py-32">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <p className="eyebrow">Just in</p>
            <h2 className="mt-3 font-display text-3xl md:text-4xl">New arrivals</h2>
          </div>
          <Link to="/shop" search={{ category: "all" }} className="eyebrow inline-flex items-center gap-2 hover:text-gold transition-colors">
            See more <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4 md:gap-x-8">
          {newArrivals.map((p) => (
            <ProductCard key={p.id + "-new"} product={p} />
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-champagne/40 py-24 md:py-32">
        <div className="container-luxe">
          <div className="text-center">
            <p className="eyebrow flex items-center justify-center gap-3">
              <span className="gold-divider" /> Words from our brides <span className="gold-divider" />
            </p>
            <h2 className="mt-5 font-display text-4xl md:text-5xl">Worn with love</h2>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure key={t.name} className="bg-background p-8 shadow-[var(--shadow-card)] hover-lift">
                <div className="flex gap-0.5 text-gold">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-gold" />
                  ))}
                </div>
                <blockquote className="mt-5 font-display text-xl leading-snug">
                  "{t.quote}"
                </blockquote>
                <figcaption className="mt-6 eyebrow">
                  {t.name} <span className="text-muted-foreground">· {t.city}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* INSTAGRAM */}
      <section className="container-luxe py-24 md:py-32">
        <div className="flex flex-col items-center text-center">
          <p className="eyebrow flex items-center gap-3">
            <Instagram className="h-3.5 w-3.5" /> @maaya.couture
          </p>
          <h2 className="mt-4 font-display text-4xl md:text-5xl">As styled by you</h2>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-2 md:grid-cols-6">
          {PRODUCTS.slice(0, 6).map((p, i) => (
            <a
              key={i}
              href="https://instagram.com"
              className="group relative aspect-square overflow-hidden bg-champagne/40"
            >
              <img
                src={p.image}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 grid place-items-center bg-ink/0 opacity-0 transition-all group-hover:bg-ink/30 group-hover:opacity-100">
                <Instagram className="h-6 w-6 text-background" />
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
