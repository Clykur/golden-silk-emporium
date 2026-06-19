import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Heart,
  ShoppingBag,
  Truck,
  Sparkles,
  Ruler,
  ChevronDown,
  ArrowRight,
  RotateCw,
  Star,
  CreditCard,
} from "lucide-react";
import { formatINR } from "@/lib/types";
import { productsApi, reviewsApi } from "@/lib/api";
import { useShop } from "@/lib/store";
import { ProductCard } from "@/components/product-card";
import { ProductZoom } from "@/components/product-zoom";
import { Product360Viewer } from "@/components/product-360-viewer";
import { useAuth } from "@/lib/auth-store";

export const Route = createFileRoute("/product/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Product — Drapeva` },
      { name: "description", content: "Hand-woven luxury saree from Drapeva" },
    ],
  }),
  component: ProductPage,
  notFoundComponent: () => (
    <div className="container-luxe py-24 text-center">
      <p className="eyebrow">Not found</p>
      <h1 className="mt-3 font-display text-4xl">This piece has retired</h1>
      <Link to="/shop" search={{}} className="mt-6 inline-block border-b border-foreground pb-1 eyebrow">
        Browse the Shop
      </Link>
    </div>
  ),
});

const SIZES = ["Standard (5.5m)", "Short (5m)", "Long (6m)", "Petite (5.2m)"];

function ProductPage() {
  const { id } = Route.useParams();
  const addToCart = useShop((s) => s.addToCart);
  const wishlist = useShop((s) => s.wishlist);
  const toggleWishlist = useShop((s) => s.toggleWishlist);
  const [size, setSize] = useState("Standard (5.5m)");
  const navigate = useNavigate();
  const isAuthenticated = useAuth((s) => s.isAuthenticated());
  const [active, setActive] = useState(0);
  const [openSection, setOpenSection] = useState<string | null>("details");
  const [view360, setView360] = useState(false);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", id],
    queryFn: () => productsApi.getBySlug(id),
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["product-reviews", id],
    queryFn: () => product?.id ? reviewsApi.getForProduct(product.id) : Promise.resolve([]),
    enabled: !!product?.id,
  });

  const { data: related = [] } = useQuery({
    queryKey: ["related-products", id, product?.category_id],
    queryFn: () => product ? productsApi.getRelated(product.id, product.category_id, 4) : Promise.resolve([]),
    enabled: !!product,
  });

  const wished = product ? wishlist.includes(product.id) : false;

  useEffect(() => {
    if (product) {
      const history = JSON.parse(localStorage.getItem("drapeva-recent-viewed") || "[]");
      const filtered = history.filter((p: any) => p.id !== product.id);
      localStorage.setItem("drapeva-recent-viewed", JSON.stringify([product, ...filtered].slice(0, 6)));
    }
  }, [product]);

  if (isLoading) {
    return (
      <div className="container-luxe grid gap-10 py-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
        <div className="animate-pulse space-y-3">
          <div className="aspect-[3/4] bg-champagne/40" />
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-32 bg-champagne/40 rounded" />
          <div className="h-8 w-3/4 bg-champagne/60 rounded" />
          <div className="h-6 w-1/4 bg-champagne/40 rounded" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-luxe py-24 text-center">
        <p className="eyebrow">Not found</p>
        <h1 className="mt-3 font-display text-4xl">This piece has retired</h1>
        <Link to="/shop" search={{}} className="mt-6 inline-block border-b border-foreground pb-1 eyebrow">
          Browse the shop
        </Link>
      </div>
    );
  }

  const displayPrice = product.sale_price || product.price;
  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <div>
      {/* Schema.org */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            name: product.name,
            image: product.gallery,
            description: product.description,
            sku: product.sku || product.id,
            offers: {
              "@type": "Offer",
              priceCurrency: "INR",
              price: displayPrice,
              availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            },
          }),
        }}
      />

      <div className="container-luxe pt-6">
        <nav className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/shop" search={{}} className="hover:text-foreground">Shop</Link>
          {product.category && (
            <>
              <span className="mx-2">/</span>
              <Link to="/shop" search={{ category: product.category.slug }} className="hover:text-foreground">
                {product.category.name}
              </Link>
            </>
          )}
          <span className="mx-2">/</span>
          <span className="text-foreground line-clamp-1">{product.name}</span>
        </nav>
      </div>

      <div className="container-luxe grid gap-10 py-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
        {/* Gallery */}
        <div className="grid gap-3 md:grid-cols-[80px_1fr]">
          <div className="order-2 flex gap-3 md:order-1 md:flex-col">
            {product.gallery.map((img, i) => (
              <button
                key={i}
                onClick={() => { setActive(i); setView360(false); }}
                className={`aspect-[3/4] w-20 overflow-hidden border transition-colors ${active === i && !view360 ? "border-foreground" : "border-transparent"}`}
              >
                <img src={img} alt="" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-saree.jpg"; }} />
              </button>
            ))}
            {product.gallery.length > 1 && (
              <button
                onClick={() => setView360(true)}
                className={`aspect-[3/4] w-20 flex flex-col items-center justify-center border text-[9px] uppercase tracking-wider transition-colors ${view360 ? "border-gold bg-gold/10 text-gold" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                <RotateCw className="h-4 w-4 mb-1" />360°
              </button>
            )}
          </div>
          <div className="order-1 aspect-[3/4] md:order-2">
            {view360 ? (
              <Product360Viewer images={product.gallery} />
            ) : (
              <ProductZoom src={product.gallery[active] || product.image} alt={product.name} />
            )}
          </div>
        </div>

        {/* Info */}
        <div className="lg:sticky lg:top-32 lg:self-start">
          <p className="eyebrow text-gold">{product.collection?.name || product.fabric}</p>
          <h1 className="mt-3 font-display text-3xl leading-tight md:text-5xl">{product.name}</h1>

          {/* Rating */}
          {reviews.length > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-3.5 w-3.5 ${i < Math.round(avgRating) ? "fill-gold text-gold" : "text-border"}`} />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">{avgRating.toFixed(1)} ({reviews.length} reviews)</span>
            </div>
          )}

          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-xl font-semibold">{formatINR(displayPrice)}</span>
            {product.sale_price && (
              <span className="text-sm text-muted-foreground line-through">{formatINR(product.price)}</span>
            )}
            {product.compare_at && !product.sale_price && (
              <span className="text-sm text-muted-foreground line-through">{formatINR(product.compare_at)}</span>
            )}
            <span className="text-xs text-muted-foreground">incl. GST</span>
          </div>

          {!product.inStock && (
            <p className="mt-2 text-sm text-destructive font-medium">Currently out of stock</p>
          )}

          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{product.description}</p>

          {/* Tags */}
          {product.fabric && (
            <div className="mt-4 flex flex-wrap gap-2">
              {product.fabric && <span className="border border-border px-2 py-1 text-[10px] uppercase tracking-wider">{product.fabric}</span>}
              {product.weave && product.weave !== "None" && <span className="border border-border px-2 py-1 text-[10px] uppercase tracking-wider">{product.weave}</span>}
              {product.occasion && <span className="border border-border px-2 py-1 text-[10px] uppercase tracking-wider">{product.occasion}</span>}
              {product.color && <span className="border border-border px-2 py-1 text-[10px] uppercase tracking-wider">{product.color}</span>}
            </div>
          )}

          {/* Size selector */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <p className="eyebrow">Size / Length</p>
              <button className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground">
                <Ruler className="h-3.5 w-3.5" /> Size guide
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`border px-4 py-2 text-sm transition-colors ${size === s ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col gap-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate({
                      to: "/auth/login",
                      search: {
                        redirect: window.location.pathname + window.location.search,
                        message: "Please sign in to continue shopping.",
                      },
                    });
                    return;
                  }
                  if (product.inStock) addToCart(product, size);
                }}
                disabled={!product.inStock}
                className="inline-flex flex-1 items-center justify-center gap-2 bg-foreground py-4 text-xs font-medium tracking-[0.25em] uppercase text-background transition-colors hover:bg-gold hover:text-gold-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="h-4 w-4" /> {product.inStock ? "Add to bag" : "Sold out"}
              </button>

              {product.inStock && (
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate({
                        to: "/auth/login",
                        search: {
                          redirect: window.location.pathname + window.location.search,
                          message: "Please sign in to continue shopping.",
                        },
                      });
                      return;
                    }
                    addToCart(product, size);
                    navigate({ to: "/checkout" });
                  }}
                  className="inline-flex flex-1 items-center justify-center gap-2 bg-gold py-4 text-xs font-medium tracking-[0.25em] uppercase text-gold-foreground transition-colors hover:bg-foreground hover:text-background"
                >
                  <CreditCard className="h-4 w-4" /> Buy Now
                </button>
              )}

              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate({
                      to: "/auth/login",
                      search: {
                        redirect: window.location.pathname + window.location.search,
                        message: "Please sign in to continue shopping.",
                      },
                    });
                    return;
                  }
                  toggleWishlist(product.id);
                }}
                aria-label="Wishlist"
                className="grid place-items-center border border-border px-6 py-4 hover:border-foreground transition-colors"
              >
                <Heart className={`h-4 w-4 ${wished ? "fill-gold text-gold" : ""}`} />
              </button>
            </div>
          </div>

          <a
            href={`https://wa.me/919949740776?text=${encodeURIComponent(`Hi Drapeva, I'd love to know more about the ${product.name}.`)}`}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex w-full items-center justify-center border border-[#25D366] py-3 text-xs uppercase tracking-[0.25em] text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors"
          >
            Enquire on WhatsApp
          </a>

          <div className="mt-8 grid gap-3 border-y border-border py-6 text-xs text-muted-foreground sm:grid-cols-2">
            <p className="inline-flex items-center gap-2"><Truck className="h-4 w-4 text-gold" /> Free shipping in India</p>
            <p className="inline-flex items-center gap-2"><Sparkles className="h-4 w-4 text-gold" /> Hand-finished, made-to-order</p>
          </div>

          {/* Accordion */}
          <div className="mt-8 divide-y divide-border border-y border-border">
            {[
              {
                id: "details",
                title: "Details",
                content: (
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {product.details.map((d: string, i: number) => <li key={i}>— {d}</li>)}
                    {product.details.length === 0 && <li>Hand-woven with the finest craftsmanship.</li>}
                  </ul>
                ),
              },
              {
                id: "shipping",
                title: "Shipping & Returns",
                content: (
                  <p className="text-sm text-muted-foreground">
                    Made-to-order pieces ship in 2–4 weeks. Complimentary shipping across India; international from ₹2,500. Exchanges accepted within 7 days of delivery.
                  </p>
                ),
              },
              {
                id: "care",
                title: "Care",
                content: (
                  <p className="text-sm text-muted-foreground">
                    Dry clean only. Store flat, wrapped in muslin, away from direct sunlight.
                  </p>
                ),
              },
            ].map((s) => (
              <details
                key={s.id}
                open={openSection === s.id}
                onToggle={(e) => (e.currentTarget as HTMLDetailsElement).open && setOpenSection(s.id)}
                className="group py-5"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between">
                  <span className="eyebrow text-foreground">{s.title}</span>
                  <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                </summary>
                <div className="mt-4">{s.content}</div>
              </details>
            ))}
          </div>

          {/* Reviews */}
          {reviews.length > 0 && (
            <div className="mt-8">
              <p className="eyebrow mb-4">Customer Reviews ({reviews.length})</p>
              <div className="space-y-4">
                {reviews.slice(0, 3).map((r: any) => (
                  <div key={r.id} className="border border-border p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-3 w-3 ${i < r.rating ? "fill-gold text-gold" : "text-border"}`} />
                        ))}
                      </div>
                      <span className="text-xs font-medium">{r.reviewer_name || "Anonymous"}</span>
                    </div>
                    {r.comment && <p className="text-xs text-muted-foreground">"{r.comment}"</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky mobile add-to-cart */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{product.name}</p>
            <p className="text-xs text-muted-foreground">{formatINR(displayPrice)} · {size}</p>
          </div>
          <button
            onClick={() => {
              if (!isAuthenticated) {
                navigate({
                  to: "/auth/login",
                  search: {
                    redirect: window.location.pathname + window.location.search,
                    message: "Please sign in to continue shopping.",
                  },
                });
                return;
              }
              if (product.inStock) addToCart(product, size);
            }}
            disabled={!product.inStock}
            className="ml-auto inline-flex items-center gap-2 bg-foreground px-5 py-3 text-xs font-medium uppercase tracking-[0.2em] text-background hover:bg-gold hover:text-gold-foreground transition-colors disabled:opacity-50"
          >
            <ShoppingBag className="h-4 w-4" /> Add
          </button>
        </div>
      </div>

      {/* Related */}
      <section className="container-luxe pb-32 pt-16">
        <div className="flex items-end justify-between border-b border-border pb-6">
          <h2 className="font-display text-3xl">You may also love</h2>
          <Link to="/shop" search={{}} className="eyebrow inline-flex items-center gap-2 hover:text-gold transition-colors">
            All <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4 md:gap-x-8">
          {related.map((p: any) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    </div>
  );
}
