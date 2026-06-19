import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Instagram, Star, Truck, Sparkles, ShieldCheck, ChevronDown } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { productsApi, collectionsApi, reviewsApi, homepageApi } from "@/lib/api";
import { HERO_VIDEO, HERO_POSTER } from "@/lib/media";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Drapeva — Heirloom Indian Silk Sarees" },
      {
        name: "description",
        content:
          "An atelier of heirloom Indian sarees — handwoven Kanjivarams, Banarasis, and designer chiffons, made-to-order for the modern patron.",
      },
      { property: "og:title", content: "Drapeva — Heirloom Indian Silk Sarees" },
      {
        property: "og:description",
        content: "Handwoven sarees, made-to-order in India with authentic craftsmanship.",
      },
    ],
  }),
  component: Home,
});

function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] bg-champagne/40" />
      <div className="mt-3 h-3 w-3/4 bg-champagne/60 rounded" />
      <div className="mt-2 h-3 w-1/2 bg-champagne/40 rounded" />
    </div>
  );
}

function Home() {
  const { data: bestsellers = [], isLoading: bsLoading } = useQuery({
    queryKey: ["bestsellers"],
    queryFn: () => productsApi.getBestsellers(4),
  });

  const { data: newArrivals = [], isLoading: naLoading } = useQuery({
    queryKey: ["new-arrivals"],
    queryFn: () => productsApi.getNewArrivals(4),
  });

  const { data: collections = [], isLoading: colLoading } = useQuery({
    queryKey: ["collections"],
    queryFn: collectionsApi.list,
  });

  const { data: featured = [], isLoading: featLoading } = useQuery({
    queryKey: ["featured"],
    queryFn: () => productsApi.getFeatured(6),
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["homepage-reviews"],
    queryFn: () => reviewsApi.getRecentApproved(3),
  });

  const { data: banners = [] } = useQuery({
    queryKey: ["homepage-banners"],
    queryFn: homepageApi.getBanners,
  });

  // Static fallback testimonials if no reviews yet
  const testimonials = reviews.length > 0
    ? reviews.map((r: any) => ({
      name: r.reviewer_name || r.profile?.name || "Customer",
      city: "",
      quote: r.comment || "",
      rating: r.rating,
    }))
    : [
      {
        name: "Ananya M.",
        city: "Hyderabad",
        quote:
          "The saree was exactly as shown on the website. The fabric felt comfortable, the quality was excellent, and delivery was quick.",
        rating: 4,
      },
      {
        name: "Priya S.",
        city: "Bengaluru",
        quote:
          "Beautiful collection and an easy shopping experience. I found the perfect saree for a family celebration and received many compliments.",
        rating: 4,
      },
      {
        name: "Ishita R.",
        city: "Kochi",
        quote:
          "Great quality, elegant designs, and smooth delivery. The saree was comfortable to wear throughout the event.",
        rating: 5,
      },
    ];

  return (
    <div>
      {/* HERO */}
      <section data-hero-section className="relative isolate overflow-hidden">
        <div className="relative h-[88svh] min-h-[640px] w-full overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover animate-fade-in"
            poster={HERO_POSTER}
          >
            <source src={HERO_VIDEO} type="video/mp4" />
            <img
              src={HERO_POSTER}
              alt="Premium Luxury Sarees"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </video>
          <div className="absolute inset-0 bg-ink/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/55 via-background/10 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent" />

          <div className="container-luxe relative z-10 flex h-full flex-col justify-end pb-20 md:justify-center md:pb-0">
            <div className="max-w-xl animate-rise">
              <p className="eyebrow flex items-center gap-3">
                <span className="gold-divider" /> Since 2026
              </p>
              <h1 className="mt-5 font-display text-5xl leading-[1.05] md:text-7xl">
                Comfort in Every
                <br />
                <span className="shimmer-text">Drape</span>.
              </h1>
              <p className="mt-6 max-w-4xl text-base leading-relaxed text-foreground/80">
                Browse a curated selection of beautiful sarees that combine comfort, quality, and elegance. Whether you're dressing for work, celebrations, or special moments, Drapeva has something for every style.</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  to="/shop"
                  search={{}}
                  className="group inline-flex items-center gap-3 bg-foreground px-7 py-4 text-xs font-medium tracking-[0.25em] uppercase text-background transition-colors hover:bg-gold hover:text-gold-foreground"
                >
                  SHOP NOW
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:block">
            <div className="flex flex-col items-center gap-2">
              <p className="eyebrow text-foreground/70">Scroll</p>
              <ChevronDown className="h-5 w-5 animate-bounce text-gold" />
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-y border-border bg-champagne/30">
        <div className="container-luxe grid gap-8 py-8 md:grid-cols-3">
          {[
            {
              icon: Truck,
              t: "Fast Delivery Across India",
              s: "Orders are processed quickly and delivered across India with tracking updates sent directly to your email and phone.",
            },
            {
              icon: ShieldCheck,
              t: "Secure Shopping Experience",
              s: "Shop with confidence through secure checkout, protected customer information, and reliable order management.",
            },
            {
              icon: Star,
              t: "Carefully Curated Collections",
              s: "Explore handpicked sarees selected for their comfort, quality, design, and value to suit every occasion.",
            },
          ].map(({ icon: Icon, t, s }) => (
            <div key={t} className="flex items-start gap-4">
              <Icon className="mt-1 h-6 w-6 shrink-0 text-gold" />

              <div>
                <h3 className="text-base font-semibold">{t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {s}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BESTSELLERS — Dynamic from Supabase */}
      <section className="container-luxe pb-24 md:pb-32 pt-10">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <p className="eyebrow">Most loved</p>
            <h2 className="mt-3 font-display text-3xl md:text-4xl">Bestsellers</h2>
          </div>
          <Link to="/shop" search={{}} className="eyebrow inline-flex items-center gap-2 hover:text-gold transition-colors">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4 md:gap-x-8">
          {bsLoading
            ? Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)
            : bestsellers.map((p: any) => <ProductCard key={p.id} product={p} />)}
        </div>
        {!bsLoading && bestsellers.length === 0 && (
          <p className="text-center text-muted-foreground py-12 text-sm">
            Mark products as "Bestseller" in the admin to feature them here.
          </p>
        )}
      </section>

      {/* EDITORIAL BANNER */}
      <section className="relative isolate overflow-hidden bg-ink text-background">
        {featured[0]?.image && (
          <img
            src={featured[0].image}
            alt="Elegant Saree Collection"
            className="absolute inset-0 h-full w-full object-cover opacity-40"
            loading="lazy"
          />
        )}

        <div className="container-luxe relative grid items-center gap-10 py-24 md:grid-cols-2 md:py-36">
          <div>
            <p className="eyebrow text-gold">Curated Collection</p>

            <h2 className="mt-5 font-display text-4xl leading-tight md:text-6xl">
              Sarees for Every Occasion
            </h2>

            <p className="mt-6 max-w-xl text-sm leading-relaxed text-background/75">
              Discover a thoughtfully curated collection of sarees designed for
              weddings, festive celebrations, office wear, family gatherings, and
              everyday elegance. At Drapeva, we bring together styles that combine
              comfort, quality, and timeless beauty, helping you find the perfect
              saree for every moment that matters.
            </p>

            <Link
              to="/shop"
              className="mt-9 inline-flex items-center gap-3 border border-gold px-7 py-4 text-xs tracking-[0.25em] uppercase text-gold hover:bg-gold hover:text-gold-foreground transition-colors"
            >
              Explore Collection
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS — Dynamic from Supabase */}
      <section className="container-luxe py-24 md:py-32">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <p className="eyebrow">Just in</p>
            <h2 className="mt-3 font-display text-3xl md:text-4xl">New arrivals</h2>
          </div>
          <Link to="/shop" search={{}} className="eyebrow inline-flex items-center gap-2 hover:text-gold transition-colors">
            See more <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4 md:gap-x-8">
          {naLoading
            ? Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)
            : newArrivals.map((p: any) => <ProductCard key={p.id} product={p} />)}
        </div>
        {!naLoading && newArrivals.length === 0 && (
          <p className="text-center text-muted-foreground py-12 text-sm">
            Mark products as "New Arrival" in the admin to feature them here.
          </p>
        )}
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-champagne/40 py-24 md:py-32">
        <div className="container-luxe">
          <div className="text-center">
            <p className="eyebrow flex items-center justify-center gap-3">
              <span className="gold-divider" /> Words from our patrons <span className="gold-divider" />
            </p>
            <h2 className="mt-5 font-display text-4xl md:text-5xl">Worn with love</h2>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {testimonials.map((t: any, i: number) => (
              <figure
                key={i}
                className="bg-background p-8 shadow-[var(--shadow-card)] hover-lift"
              >
                <div className="flex gap-0.5 text-gold">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-gold" />
                  ))}
                </div>
                <blockquote className="mt-5 font-display text-xl leading-snug">
                  "{t.quote}"
                </blockquote>
                <figcaption className="mt-6 eyebrow">
                  {t.name} {t.city && <span className="text-muted-foreground">· {t.city}</span>}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* INSTAGRAM / STYLED BY YOU — Dynamic from featured products */}
      <section className="container-luxe py-24 md:py-32">
        <div className="flex flex-col items-center text-center">
          <p className="eyebrow flex items-center gap-3">
            <Instagram className="h-3.5 w-3.5" /> @drapeva
          </p>
          <h2 className="mt-4 font-display text-4xl md:text-5xl">As styled by you</h2>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-2 md:grid-cols-6">
          {featLoading
            ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="animate-pulse aspect-square bg-champagne/40" />)
            : featured.slice(0, 6).map((p: any, i: number) => (
              <a
                key={i}
                href="https://instagram.com"
                className="group relative aspect-square overflow-hidden bg-champagne/40"
              >
                <img
                  src={p.image}
                  alt={p.name}
                  loading="lazy"
                  width={900}
                  height={900}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-saree.jpg"; }}
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
