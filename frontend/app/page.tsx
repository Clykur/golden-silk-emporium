"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Instagram,
  Star,
  Truck,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  ShoppingBag,
  Heart,
  Package,
  Bell,
  Clock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { productsApi, collectionsApi, reviewsApi, notificationsApi, ordersApi } from "@/lib/api";
import { HERO_VIDEO, HERO_POSTER } from "@/lib/media";
import { useAuth } from "@/lib/auth-store";
import { useShop, cartCount } from "@/lib/store";
import { useState, useEffect } from "react";
import { formatINR } from "@/lib/types";

function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] bg-champagne/40" />
      <div className="mt-3 h-3 w-3/4 bg-champagne/60 rounded" />
      <div className="mt-2 h-3 w-1/2 bg-champagne/40 rounded" />
    </div>
  );
}

// ============================================================
// PUBLIC HOME PAGE (For Guests)
// ============================================================
function PublicHome() {
  const { data: bestsellers = [], isLoading: bsLoading } = useQuery({
    queryKey: ["bestsellers-public"],
    queryFn: () => productsApi.getBestsellers(4),
  });

  const { data: newArrivals = [], isLoading: naLoading } = useQuery({
    queryKey: ["new-arrivals-public"],
    queryFn: () => productsApi.getNewArrivals(4),
  });

  const { data: featured = [], isLoading: featLoading } = useQuery({
    queryKey: ["featured-public"],
    queryFn: () => productsApi.getFeatured(6),
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["homepage-reviews-public"],
    queryFn: () => reviewsApi.getRecentApproved(3),
  });

  const testimonials =
    reviews.length > 0
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
                Browse a curated selection of beautiful sarees that combine comfort, quality, and
                elegance. Whether you're dressing for work, celebrations, or special moments,
                Drapeva has something for every style.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  href="/shop"
                  className="group inline-flex items-center gap-3 bg-foreground px-7 py-4 text-xs font-medium tracking-[0.25em] uppercase text-background transition-colors hover:bg-gold hover:text-gold-foreground"
                >
                  EXPLORE COLLECTIONS
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-3 border border-foreground/35 bg-transparent px-7 py-4 text-xs font-medium tracking-[0.25em] uppercase text-foreground hover:border-gold hover:text-gold transition-colors"
                >
                  LOG IN
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
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BESTSELLERS */}
      <section className="container-luxe pb-24 md:pb-32 pt-10">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <p className="eyebrow">Most loved</p>
            <h2 className="mt-3 font-display text-3xl md:text-4xl">Bestsellers</h2>
          </div>
          <Link
            href="/shop"
            className="eyebrow inline-flex items-center gap-2 hover:text-gold transition-colors"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4 md:gap-x-8">
          {bsLoading
            ? Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)
            : bestsellers.map((p: any) => <ProductCard key={p.id} product={p} />)}
        </div>
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
              Discover a thoughtfully curated collection of sarees designed for weddings, festive
              celebrations, office wear, family gatherings, and everyday elegance. At Drapeva, we
              bring together styles that combine comfort, quality, and timeless beauty.
            </p>
            <Link
              href="/shop"
              className="mt-9 inline-flex items-center gap-3 border border-gold px-7 py-4 text-xs tracking-[0.25em] uppercase text-gold hover:bg-gold hover:text-gold-foreground transition-colors"
            >
              Explore Collection
              <ArrowRight className="h-4 w-4" />
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
          <Link
            href="/shop"
            className="eyebrow inline-flex items-center gap-2 hover:text-gold transition-colors"
          >
            See more <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4 md:gap-x-8">
          {naLoading
            ? Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)
            : newArrivals.map((p: any) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-champagne/40 py-24 md:py-32">
        <div className="container-luxe">
          <div className="text-center">
            <p className="eyebrow flex items-center justify-center gap-3">
              <span className="gold-divider" /> Words from our patrons{" "}
              <span className="gold-divider" />
            </p>
            <h2 className="mt-5 font-display text-4xl md:text-5xl">Worn with love</h2>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {testimonials.map((t: any, i: number) => (
              <figure key={i} className="bg-background p-8 shadow-[var(--shadow-card)] hover-lift">
                <div className="flex gap-0.5 text-gold">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-gold" />
                  ))}
                </div>
                <blockquote className="mt-5 font-display text-xl leading-snug">
                  "{t.quote}"
                </blockquote>
                <figcaption className="mt-6 eyebrow text-xs">
                  {t.name} {t.city && <span className="text-muted-foreground">· {t.city}</span>}
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
            <Instagram className="h-3.5 w-3.5" /> @drapeva
          </p>
          <h2 className="mt-4 font-display text-4xl md:text-5xl">As styled by you</h2>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-2 md:grid-cols-6">
          {featLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse aspect-square bg-champagne/40" />
              ))
            : featured.slice(0, 6).map((p: any, i: number) => (
                <a
                  key={i}
                  href="https://instagram.com"
                  className="group relative aspect-square overflow-hidden bg-champagne/40"
                  target="_blank"
                  rel="noreferrer"
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder-saree.jpg";
                    }}
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

// ============================================================
// PERSONALIZED SHOPPING HOMEPAGE (For Logged-in Customers)
// ============================================================
function PersonalizedHome({ user }: { user: any }) {
  const wishlist = useShop((s) => s.wishlist);
  const cart = useShop((s) => s.cart);
  const cCount = cartCount(cart);

  // Queries for personalized lists
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["unread-notifications-count", user?.id],
    queryFn: () => (user ? notificationsApi.unreadCount(user.id) : Promise.resolve(0)),
    enabled: !!user,
  });

  const { data: activeOrders = [] } = useQuery({
    queryKey: ["active-orders-count", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const allOrders = await ordersApi.getUserOrders(user.id);
      return allOrders.filter((o: any) => ["pending", "processing", "shipped"].includes(o.status));
    },
    enabled: !!user,
  });

  const { data: recentOrders = [] } = useQuery({
    queryKey: ["recent-orders-homepage", user?.id],
    queryFn: () => (user ? ordersApi.getUserOrders(user.id) : Promise.resolve([])),
    enabled: !!user,
  });

  const { data: wishlistProducts = [], isLoading: loadingWishlist } = useQuery({
    queryKey: ["homepage-wishlist-details", wishlist.join(",")],
    queryFn: async () => {
      const results = await Promise.all(
        wishlist.map((id) => productsApi.getBySlug(id).catch(() => null)),
      );
      return results.filter(Boolean);
    },
    enabled: wishlist.length > 0,
  });

  // Category and fabric lists
  const { data: bestsellers = [], isLoading: bsLoading } = useQuery({
    queryKey: ["bestsellers-auth"],
    queryFn: () => productsApi.getBestsellers(8),
  });

  const { data: newArrivals = [], isLoading: naLoading } = useQuery({
    queryKey: ["new-arrivals-auth"],
    queryFn: () => productsApi.getNewArrivals(8),
  });

  const { data: weddingSarees = [] } = useQuery({
    queryKey: ["wedding-collection-auth"],
    queryFn: () => productsApi.list({ category: "bridal-sarees" }),
  });

  const { data: silkSarees = [] } = useQuery({
    queryKey: ["silk-collection-auth"],
    queryFn: () => productsApi.list({ fabric: "Silk" }),
  });

  const { data: cottonSarees = [] } = useQuery({
    queryKey: ["cotton-collection-auth"],
    queryFn: () => productsApi.list({ fabric: "Cotton" }),
  });

  const { data: featured = [] } = useQuery({
    queryKey: ["featured-auth"],
    queryFn: () => productsApi.getFeatured(8),
  });

  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const history = JSON.parse(localStorage.getItem("drapeva-recent-viewed") || "[]");
      setRecentlyViewed(history.slice(0, 4));
    }
  }, [user]);

  // Fallbacks for display
  const finalWedding = weddingSarees.length > 0 ? weddingSarees.slice(0, 4) : featured.slice(0, 4);
  const finalSilk = silkSarees.length > 0 ? silkSarees.slice(0, 4) : bestsellers.slice(0, 4);
  const finalCotton = cottonSarees.length > 0 ? cottonSarees.slice(0, 4) : newArrivals.slice(4, 8);
  const recommendations = featured.slice(2, 6);

  return (
    <div className="bg-background min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="border-b border-border bg-champagne/15 py-16 md:py-24 relative overflow-hidden">
        <div className="absolute top-1/2 right-12 -translate-y-1/2 opacity-15 pointer-events-none hidden lg:block">
          <Sparkles className="h-64 w-64 text-gold/30 animate-pulse" />
        </div>
        <div className="container-luxe max-w-5xl text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-4">
            <p className="eyebrow text-gold flex items-center justify-center md:justify-start gap-2">
              <span className="gold-divider" /> Atelier Drapeva
            </p>
            <h1 className="font-display text-4xl md:text-5xl leading-tight">
              Welcome back, <br />
              <span className="text-gold font-serif italic font-normal capitalize">
                {user?.name || user?.email?.split("@")[0]}
              </span>
            </h1>
            <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
              Explore your personal boutique space. We've curated the finest handwoven silks and
              contemporary weaves for you.
            </p>
            <div className="pt-4 flex flex-wrap justify-center md:justify-start gap-3">
              <Link
                href="/shop"
                className="bg-foreground text-background px-6 py-3.5 text-xs font-semibold tracking-widest uppercase hover:bg-gold hover:text-gold-foreground transition-colors inline-flex items-center gap-2 group"
              >
                Continue Shopping
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/account/orders"
                className="border border-border bg-background px-6 py-3.5 text-xs font-semibold tracking-widest uppercase hover:border-gold hover:text-gold transition-colors inline-flex items-center gap-2"
              >
                Track Orders
              </Link>
            </div>
          </div>

          {/* Quick Profile Summary stats */}
          <div className="grid grid-cols-2 gap-4 w-full md:w-auto max-w-md shrink-0">
            <div className="border border-border/80 bg-background p-4 flex flex-col justify-between h-28 hover:border-gold/30 transition-colors">
              <p className="eyebrow text-[9px] text-muted-foreground">Shopping Bag</p>
              <div className="flex items-center justify-between mt-2">
                <span className="font-display text-2xl">{cCount} Items</span>
                <ShoppingBag className="h-4.5 w-4.5 text-gold" />
              </div>
            </div>
            <div className="border border-border/80 bg-background p-4 flex flex-col justify-between h-28 hover:border-gold/30 transition-colors">
              <p className="eyebrow text-[9px] text-muted-foreground">Saved Pieces</p>
              <div className="flex items-center justify-between mt-2">
                <span className="font-display text-2xl">{wishlist.length} Items</span>
                <Heart className="h-4.5 w-4.5 text-rose-500 fill-rose-500" />
              </div>
            </div>
            <div className="border border-border/80 bg-background p-4 flex flex-col justify-between h-28 hover:border-gold/30 transition-colors">
              <p className="eyebrow text-[9px] text-muted-foreground">Active Orders</p>
              <div className="flex items-center justify-between mt-2">
                <span className="font-display text-2xl">{activeOrders.length} Tracked</span>
                <Package className="h-4.5 w-4.5 text-blue-600" />
              </div>
            </div>
            <div className="border border-border/80 bg-background p-4 flex flex-col justify-between h-28 hover:border-gold/30 transition-colors">
              <p className="eyebrow text-[9px] text-muted-foreground">Alerts</p>
              <div className="flex items-center justify-between mt-2">
                <span className="font-display text-2xl">{unreadCount} Unread</span>
                <Bell className="h-4.5 w-4.5 text-amber-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ORDER TRACKING & STATUS */}
      {recentOrders.length > 0 && (
        <section className="container-luxe py-10 border-b border-border">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-6">
              <h2 className="font-display text-lg flex items-center gap-2">
                <Package className="h-4.5 w-4.5 text-gold" /> Order Status &amp; Tracking
              </h2>
              <Link
                href="/account/orders"
                className="text-xs uppercase tracking-wider text-muted-foreground hover:text-gold inline-flex items-center gap-1"
              >
                Order History <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {recentOrders.slice(0, 2).map((order: any) => (
                <div
                  key={order.id}
                  className="border border-border/80 bg-champagne/5 p-5 flex justify-between items-center gap-4 group hover:border-gold/20 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold">
                      Order #{order.id.substring(0, 8).toUpperCase()}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Placed:{" "}
                      {new Date(order.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                      {" · "} {order.items?.length || 0} items
                    </p>
                    {order.tracking_number && (
                      <p className="text-[10px] text-gold mt-1 font-semibold">
                        Tracking: {order.tracking_number}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`inline-block px-2.5 py-0.5 text-[9px] uppercase tracking-wider rounded font-semibold border ${
                        order.status === "delivered"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-150"
                          : order.status === "cancelled"
                            ? "bg-red-50 text-red-700 border-red-150"
                            : "bg-blue-50 text-blue-700 border-blue-150"
                      }`}
                    >
                      {order.status}
                    </span>
                    <p className="text-sm font-semibold text-gold mt-2">{formatINR(order.total)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. WISHLIST PREVIEW */}
      <section className="container-luxe py-12 border-b border-border">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between border-b border-border pb-3 mb-6">
            <h2 className="font-display text-lg flex items-center gap-2">
              <Heart className="h-4.5 w-4.5 text-rose-500 fill-rose-500" /> Wishlist Preview
            </h2>
            <Link
              href="/account/wishlist"
              className="text-xs uppercase tracking-wider text-muted-foreground hover:text-gold inline-flex items-center gap-1"
            >
              Manage Wishlist <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          {wishlist.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-border bg-champagne/5">
              <p className="text-xs text-muted-foreground">Your wishlist is currently empty.</p>
              <Link
                href="/shop"
                className="mt-3 inline-block text-[10px] uppercase tracking-widest font-semibold border-b border-foreground pb-0.5 hover:text-gold hover:border-gold transition-colors"
              >
                Browse &amp; Save Sarees
              </Link>
            </div>
          ) : loadingWishlist ? (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="w-40 shrink-0 animate-pulse aspect-[3/4] bg-champagne/20" />
              ))}
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
              {wishlistProducts.map((p: any) => (
                <Link
                  key={p.id}
                  href={`/product/${p.slug}`}
                  className="w-40 shrink-0 border border-border bg-background p-2 hover:border-gold/20 transition-colors group flex flex-col"
                >
                  <div className="aspect-[3/4] overflow-hidden bg-champagne/10 relative">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <p className="text-[11px] font-semibold truncate mt-2 group-hover:text-gold transition-colors">
                    {p.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{p.fabric}</p>
                  <p className="text-xs font-display text-gold mt-1 font-semibold">
                    {formatINR(p.price)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. RECENTLY VIEWED SAREES */}
      {recentlyViewed.length > 0 && (
        <section className="container-luxe py-12 border-b border-border bg-champagne/5">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-8">
              <h2 className="font-display text-xl flex items-center gap-2">
                <Clock className="h-5 w-5 text-gold" /> Recently Viewed
              </h2>
              <Link
                href="/account/recently-viewed"
                className="text-xs uppercase tracking-wider text-muted-foreground hover:text-gold"
              >
                View History
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
              {recentlyViewed.map((p: any) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. RECOMMENDED FOR YOU */}
      <section className="container-luxe py-16 border-b border-border">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between border-b border-border pb-3 mb-8">
            <h2 className="font-display text-xl flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-gold" /> Recommended For You
            </h2>
            <Link
              href="/shop"
              className="text-xs uppercase tracking-wider text-muted-foreground hover:text-gold"
            >
              Explore Shop
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            {recommendations.map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* 6. TRENDING SAREES */}
      <section className="container-luxe py-16 border-b border-border bg-champagne/5">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between border-b border-border pb-3 mb-8">
            <h2 className="font-display text-xl flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-gold" /> Trending Sarees
            </h2>
            <Link
              href="/trending"
              className="text-xs uppercase tracking-wider text-muted-foreground hover:text-gold"
            >
              See All Trends
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            {bsLoading
              ? Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)
              : bestsellers.slice(0, 4).map((p: any) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* 7. NEW ARRIVALS */}
      <section className="container-luxe py-16 border-b border-border">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between border-b border-border pb-3 mb-8">
            <h2 className="font-display text-xl flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-gold" /> New Arrivals
            </h2>
            <Link
              href="/new-arrivals"
              className="text-xs uppercase tracking-wider text-muted-foreground hover:text-gold"
            >
              Explore Fresh Arrivals
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            {naLoading
              ? Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)
              : newArrivals.slice(0, 4).map((p: any) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* 8. WEDDING COLLECTION */}
      <section className="container-luxe py-16 border-b border-border bg-champagne/5">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between border-b border-border pb-3 mb-8">
            <h2 className="font-display text-xl">Vivah Couture (Wedding Collection)</h2>
            <Link
              href="/shop?collection=vivah-couture"
              className="text-xs uppercase tracking-wider text-muted-foreground hover:text-gold"
            >
              Explore Wedding Lookbook
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            {finalWedding.map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* 9. SILK COLLECTION */}
      <section className="container-luxe py-16 border-b border-border">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between border-b border-border pb-3 mb-8">
            <h2 className="font-display text-xl">The Silk Collection</h2>
            <Link
              href="/shop?fabric=Silk"
              className="text-xs uppercase tracking-wider text-muted-foreground hover:text-gold"
            >
              Shop Silks
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            {finalSilk.map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* 10. COTTON COLLECTION */}
      <section className="container-luxe py-16">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between border-b border-border pb-3 mb-8">
            <h2 className="font-display text-xl">Daily Wear (Cotton Collection)</h2>
            <Link
              href="/shop?fabric=Cotton"
              className="text-xs uppercase tracking-wider text-muted-foreground hover:text-gold"
            >
              Shop Cottons
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            {finalCotton.map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// ============================================================
// MAIN CONTAINER COMPONENT
// ============================================================
export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Customer & Admin routing check: redirect to appropriate dashboard
  useEffect(() => {
    if (!loading && user) {
      if (user.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    }
  }, [user, loading, router]);

  // Loading skeleton state
  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4 bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold" />
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
          Entering atelier...
        </p>
      </div>
    );
  }

  // Render personalized loading for customers, public home for guests
  if (user) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4 bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold" />
        <p className="text-xs uppercase tracking-widest text-gold font-semibold">
          Entering atelier...
        </p>
      </div>
    );
  }

  return <PublicHome />;
}
