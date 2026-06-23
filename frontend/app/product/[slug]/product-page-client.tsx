"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Heart,
  ShoppingBag,
  Truck,
  Sparkles,
  Ruler,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  RotateCw,
  Star,
  CreditCard,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { formatINR } from "@/lib/types";
import type { Product, Review } from "@/lib/types";
import { productsApi, reviewsApi } from "@/lib/api";
import { useShop } from "@/lib/store";
import { ProductCard } from "@/components/product-card";
import { ProductZoom } from "@/components/product-zoom";
import { Product360Viewer } from "@/components/product-360-viewer";
import { useAuth } from "@/lib/auth-store";
import { toast } from "sonner";

interface ProductPageClientProps {
  initialProduct: Product;
  slug: string;
}

export default function ProductPageClient({ initialProduct, slug }: ProductPageClientProps) {
  const addToCart = useShop((s) => s.addToCart);
  const wishlist = useShop((s) => s.wishlist);
  const toggleWishlist = useShop((s) => s.toggleWishlist);
  const size = "Free Size";
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuth((s) => s.isAuthenticated());
  const [active, setActive] = useState(0);
  const [openSection, setOpenSection] = useState<string | null>("details");
  const [view360, setView360] = useState(false);

  const { user } = useAuth();
  const qc = useQueryClient();
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitLoading, setReviewSubmitLoading] = useState(false);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !product) return;
    if (!reviewComment.trim()) return toast.error("Please enter a comment");
    setReviewSubmitLoading(true);

    try {
      await reviewsApi.submit({
        product_id: product.id,
        rating: reviewRating,
        title: reviewTitle.trim() || undefined,
        comment: reviewComment.trim(),
        user_id: user.id,
        reviewer_name: user.name || user.email.split("@")[0],
        reviewer_email: user.email,
      });
      toast.success("Review submitted! It will appear once approved.");
      setReviewRating(5);
      setReviewTitle("");
      setReviewComment("");
      qc.invalidateQueries({ queryKey: ["product-reviews", slug] });
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review");
    } finally {
      setReviewSubmitLoading(false);
    }
  };

  const { data: product } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => productsApi.getBySlug(slug),
    initialData: initialProduct,
  });

  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ["product-reviews", slug],
    queryFn: () => (product?.id ? reviewsApi.getForProduct(product.id) : Promise.resolve([])),
    enabled: !!product?.id,
  });

  const { data: related = [] } = useQuery({
    queryKey: ["related-products", slug, product?.category_id],
    queryFn: () =>
      product ? productsApi.getRelated(product.id, product.category_id, 4) : Promise.resolve([]),
    enabled: !!product,
  });

  const wished = product ? wishlist.includes(product.id) : false;

  useEffect(() => {
    if (product) {
      const history = JSON.parse(localStorage.getItem("drapeva-recent-viewed") || "[]");
      const filtered = history.filter((p: any) => p.id !== product.id);
      localStorage.setItem(
        "drapeva-recent-viewed",
        JSON.stringify([product, ...filtered].slice(0, 6)),
      );
    }
  }, [product]);

  if (!product) return null;

  const displayPrice = product.sale_price || product.price;
  const avgRating =
    reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  // Dynamically generate gallery images from the first image to ensure same saree is shown in different crops/zooms
  const baseImage = product.gallery[0] || product.image || "/media/placeholder-saree.jpg";
  const cleanBase = baseImage.split("?")[0];
  const dynamicGallery = [
    `${cleanBase}?auto=format&fit=crop&w=800&q=80`,
    `${cleanBase}?auto=format&fit=crop&w=800&q=80&zoom=1.4`,
    `${cleanBase}?auto=format&fit=crop&w=800&q=80&fp-y=0.25`,
    `${cleanBase}?auto=format&fit=crop&w=800&q=80&fp-y=0.75`,
  ];

  const handleLoginRedirect = () => {
    router.push(
      `/login?redirect=${encodeURIComponent(pathname)}&message=${encodeURIComponent("Please sign in to continue shopping.")}`,
    );
  };

  return (
    <div className="pb-24 lg:pb-0">
      {/* Schema.org */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            name: product.name,
            image: dynamicGallery,
            description: product.description,
            sku: product.sku || product.id,
            offers: {
              "@type": "Offer",
              priceCurrency: "INR",
              price: displayPrice,
              availability: product.inStock
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            },
          }),
        }}
      />

      <div className="container-luxe pt-2">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back
        </button>
      </div>

      <div className="container-luxe grid gap-10 pb-12 pt-2 lg:grid-cols-[1.4fr_1fr] lg:gap-20 lg:items-start">
        {/* Gallery */}
        <div className="grid gap-4 md:grid-cols-[80px_1fr] lg:sticky lg:top-24 h-fit">
          {/* Thumbnails */}
          <div className="order-2 flex flex-row gap-3 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 md:order-1 md:flex-col scrollbar-none snap-x snap-mandatory">
            {dynamicGallery.map((img, i) => (
              <button
                key={i}
                onClick={() => {
                  setActive(i);
                  setView360(false);
                }}
                className={`aspect-[3/4] w-16 md:w-24 shrink-0 overflow-hidden border transition-all duration-300 snap-start ${
                  active === i && !view360
                    ? "border-gold ring-1 ring-gold"
                    : "border-border/60 hover:border-foreground/50"
                }`}
              >
                <img
                  src={img}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/media/placeholder-saree.jpg";
                  }}
                />
              </button>
            ))}
            {dynamicGallery.length > 1 && (
              <button
                onClick={() => setView360(true)}
                className={`aspect-[3/4] w-16 md:w-24 shrink-0 flex flex-col items-center justify-center border text-[9px] uppercase tracking-wider transition-all duration-300 snap-start ${
                  view360
                    ? "border-gold bg-gold/10 text-gold"
                    : "border-border/60 text-muted-foreground hover:text-foreground hover:border-foreground/50"
                }`}
              >
                <RotateCw className="h-4 w-4 mb-1" />
                360°
              </button>
            )}
          </div>
          {/* Main Viewer */}
          <div className="order-1 aspect-[3/4] md:order-2 w-full">
            {view360 ? (
              <Product360Viewer images={dynamicGallery} />
            ) : (
              <ProductZoom src={dynamicGallery[active] || product.image} alt={product.name} />
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col space-y-4">
          <div className="space-y-4 border-b border-border/40 pb-4">
            <p className="eyebrow text-gold font-bold tracking-[0.25em] text-[0.65rem]">
              {product.collection?.name || product.fabric}
            </p>
            <h1 className="font-display text-3xl leading-[1.15] md:text-4xl text-ink font-semibold tracking-wide">
              {product.name}
            </h1>
          </div>

          {/* Rating */}
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 border-b border-border/40 pb-2">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${
                      i < Math.round(avgRating) ? "fill-yellow-400 text-yellow-400" : "text-border"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                {avgRating.toFixed(1)} ({reviews.length} reviews)
              </span>
            </div>
          )}

          <div className="flex flex-col space-y-5">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-display text-ink tracking-wide font-medium">
                {formatINR(displayPrice)}
              </span>
              {product.sale_price && (
                <span className="text-sm text-muted-foreground line-through font-medium">
                  {formatINR(product.price)}
                </span>
              )}
              {product.compare_at && !product.sale_price && (
                <span className="text-sm text-muted-foreground line-through font-medium">
                  {formatINR(product.compare_at)}
                </span>
              )}
              <span className="text-xs text-muted-foreground font-medium">incl. GST</span>
            </div>

            {!product.inStock && (
              <p className="mt-3 text-xs text-destructive font-semibold uppercase tracking-wider">
                Currently out of stock
              </p>
            )}

            <p className="text-sm leading-[1.8] text-muted-foreground/90 font-medium max-w-[95%]">
              {product.description}
            </p>

            {/* Tags */}
            {product.fabric && (
              <div className="flex flex-wrap gap-2 pt-2">
                {product.fabric && (
                  <span className="border border-border/80 px-2.5 py-1 text-[9px] uppercase tracking-widest text-muted-foreground font-semibold">
                    {product.fabric}
                  </span>
                )}
                {product.weave && product.weave !== "None" && (
                  <span className="border border-border/80 px-2.5 py-1 text-[9px] uppercase tracking-widest text-muted-foreground font-semibold">
                    {product.weave}
                  </span>
                )}
                {product.occasion && (
                  <span className="border border-border/80 px-2.5 py-1 text-[9px] uppercase tracking-widest text-muted-foreground font-semibold">
                    {product.occasion}
                  </span>
                )}
                {product.color && (
                  <span className="border border-border/80 px-2.5 py-1 text-[9px] uppercase tracking-widest text-muted-foreground font-semibold">
                    {product.color}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Size selector */}
          <div className="pt-2">
            <div className="flex items-center justify-between">
              <p className="eyebrow text-foreground/80 font-bold">Size / Length</p>
              <button className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors">
                <Ruler className="h-3.5 w-3.5 text-gold" /> Size guide
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2.5">
              <button className="border border-foreground bg-foreground text-background font-semibold px-5 py-2.5 text-xs uppercase tracking-wider transition-all duration-300">
                Free Size
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4">
            <div className="flex gap-3 h-[3.5rem]">
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    handleLoginRedirect();
                    return;
                  }
                  toggleWishlist(product);
                }}
                aria-label="Wishlist"
                className="w-14 shrink-0 grid place-items-center border border-border bg-background hover:border-foreground transition-all duration-300 group"
              >
                <Heart
                  className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${wished ? "fill-gold text-gold" : "text-muted-foreground group-hover:text-foreground"}`}
                />
              </button>
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    handleLoginRedirect();
                    return;
                  }
                  if (product.inStock) {
                    addToCart(product, size);
                    toast.success("Added to bag");
                  }
                }}
                disabled={!product.inStock}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-foreground text-background text-xs font-semibold tracking-[0.2em] uppercase transition-all duration-300 hover:bg-gold hover:text-gold-foreground disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="h-4 w-4" /> {product.inStock ? "Add to bag" : "Sold out"}
              </button>

              {product.inStock && (
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      handleLoginRedirect();
                      return;
                    }
                    addToCart(product, size);
                    router.push("/checkout");
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-gold text-gold-foreground text-xs font-semibold tracking-[0.2em] uppercase transition-all duration-300 hover:bg-foreground hover:text-background"
                >
                  <CreditCard className="h-4 w-4" /> Buy Now
                </button>
              )}
            </div>
          </div>

          <a
            href={`https://wa.me/919949740776?text=${encodeURIComponent(
              `Hello *Drapeva*,

I'm interested in the following saree:

*Saree Name:* *${product.name}*

*Product ID:* *${product.product_code}*

Could you please share more details?`,
            )}`}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex w-full items-center justify-center border border-[#25D366]/40 py-3.5 text-xs uppercase tracking-[0.25em] text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all duration-300 font-semibold"
          >
            Enquire on WhatsApp
          </a>

          <div className="mt-8 grid gap-4 border-y border-border/60 py-6 text-xs text-muted-foreground sm:grid-cols-2">
            <p className="inline-flex items-center gap-2.5 font-medium">
              <Truck className="h-4.5 w-4.5 text-gold shrink-0" /> Free shipping in India
            </p>
            <p className="inline-flex items-center gap-2.5 font-medium">
              <Sparkles className="h-4.5 w-4.5 text-gold shrink-0" /> Hand-finished, made-to-order
            </p>
          </div>

          {/* Accordion */}
          <div className="mt-8 divide-y divide-border border-y border-border">
            {[
              {
                id: "details",
                title: "Details",
                content: (
                  <ul className="space-y-2.5 text-xs text-muted-foreground font-medium">
                    {product.details.map((d: string, i: number) => (
                      <li key={i} className="flex items-start gap-1">
                        <span className="text-gold shrink-0">◆</span>
                        <span>{d}</span>
                      </li>
                    ))}
                    {product.details.length === 0 && (
                      <li className="flex items-start gap-1">
                        <span className="text-gold shrink-0">◆</span>
                        <span>Hand-woven with the finest craftsmanship.</span>
                      </li>
                    )}
                  </ul>
                ),
              },
              {
                id: "shipping",
                title: "Shipping & Returns",
                content: (
                  <p className="text-xs leading-relaxed text-muted-foreground font-medium">
                    Made-to-order pieces ship in 2–4 weeks. Complimentary shipping across India;
                    international from ₹2,500. Exchanges accepted within 7 days of delivery.
                  </p>
                ),
              },
              {
                id: "care",
                title: "Care",
                content: (
                  <p className="text-xs leading-relaxed text-muted-foreground font-medium">
                    Dry clean only. Store flat, wrapped in muslin, away from direct sunlight.
                  </p>
                ),
              },
            ].map((s) => (
              <details
                key={s.id}
                open={openSection === s.id}
                onToggle={(e) =>
                  (e.currentTarget as HTMLDetailsElement).open && setOpenSection(s.id)
                }
                className="group py-5"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between py-1.5 hover:text-gold transition-colors">
                  <span className="eyebrow text-foreground/90 font-bold tracking-widest text-[10px]">
                    {s.title}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180 duration-300" />
                </summary>
                <div className="mt-4 animate-rise">{s.content}</div>
              </details>
            ))}
          </div>

          {/* Reviews & Submission Form */}
          <div className="mt-8 border-t border-border/60 pt-8">
            <h3 className="font-display text-xl mb-6">patron reviews</h3>

            {reviews.length > 0 ? (
              <div className="space-y-4 mb-8">
                {reviews.slice(0, 5).map((r: any) => (
                  <div
                    key={r.id}
                    className="border border-border/80 p-5 bg-champagne/10 backdrop-blur-sm shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-all hover:border-gold/20 duration-300"
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${i < r.rating ? "fill-yellow-400 text-yellow-400" : "text-border"}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-semibold text-ink">
                        {r.reviewer_name || "Patron"}
                      </span>
                      <span className="text-[10px] text-muted-foreground ml-auto font-medium">
                        {new Date(r.created_at).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                    {r.title && <p className="text-xs font-bold mb-1 text-foreground">{r.title}</p>}
                    {r.comment && (
                      <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                        "{r.comment}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground mb-8 font-medium">
                No reviews yet for this masterpiece. Be the first to share your experience.
              </p>
            )}

            {/* Review Submission Form */}
            <div className="border border-border p-6 bg-champagne/15 backdrop-blur-sm shadow-[0_4px_24px_rgba(0,0,0,0.01)]">
              <h4 className="font-display text-base mb-4">Write a Review</h4>
              {user ? (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <span className="eyebrow text-[10px] font-bold mb-2 block">Rating *</span>
                    <div className="flex gap-1.5">
                      {Array.from({ length: 5 }).map((_, i) => {
                        const starVal = i + 1;
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setReviewRating(starVal)}
                            className="p-1 hover:scale-110 transition-transform duration-250"
                          >
                            <Star
                              className={`h-5 w-5 ${
                                starVal <= reviewRating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground/30"
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <label className="block">
                    <span className="eyebrow text-[10px] font-bold mb-1.5 block">
                      Review Title (optional)
                    </span>
                    <input
                      type="text"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      className="w-full border border-border bg-background px-3.5 py-2.5 text-xs focus:outline-none focus:border-foreground"
                      placeholder="e.g. Absolutely Stunning Saree!"
                    />
                  </label>

                  <label className="block">
                    <span className="eyebrow text-[10px] font-bold mb-1.5 block">
                      Review Comments *
                    </span>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      required
                      rows={3}
                      className="w-full border border-border bg-background px-3.5 py-2.5 text-xs focus:outline-none focus:border-foreground"
                      placeholder="Share your experience of the drape, fabric quality, and print..."
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={reviewSubmitLoading}
                    className="bg-foreground text-background px-6 py-3 text-[10px] uppercase tracking-widest font-semibold hover:bg-gold hover:text-gold-foreground transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
                  >
                    {reviewSubmitLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                    Submit Review
                  </button>
                </form>
              ) : (
                <div className="text-center py-4">
                  <p className="text-xs text-muted-foreground mb-4 font-medium">
                    Please sign in to submit a rating and review.
                  </p>
                  <button
                    onClick={handleLoginRedirect}
                    className="border border-foreground px-5 py-2.5 text-[10px] uppercase tracking-widest hover:bg-foreground hover:text-background transition-all duration-300 font-semibold"
                  >
                    Sign In to Review
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky mobile add-to-cart */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-5 py-4.5 backdrop-blur-md lg:hidden shadow-[0_-8px_30px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (!isAuthenticated) {
                handleLoginRedirect();
                return;
              }
              toggleWishlist(product);
            }}
            aria-label="Wishlist"
            className="w-12 h-12 shrink-0 grid place-items-center border border-border bg-background rounded-none hover:border-foreground transition-colors"
          >
            <Heart
              className={`h-4.5 w-4.5 ${wished ? "fill-gold text-gold" : "text-muted-foreground"}`}
            />
          </button>

          <button
            onClick={() => {
              if (!isAuthenticated) {
                handleLoginRedirect();
                return;
              }
              if (product.inStock) {
                addToCart(product, size);
                toast.success("Added to bag");
              }
            }}
            disabled={!product.inStock}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-foreground text-background h-12 text-xs font-semibold tracking-[0.2em] uppercase transition-colors hover:bg-gold hover:text-gold-foreground disabled:opacity-50"
          >
            <ShoppingBag className="h-4 w-4" /> {product.inStock ? "Add to bag" : "Sold out"}
          </button>

          {product.inStock && (
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  handleLoginRedirect();
                  return;
                }
                addToCart(product, size);
                router.push("/checkout");
              }}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-gold text-gold-foreground h-12 text-xs font-semibold tracking-[0.2em] uppercase transition-colors hover:bg-foreground hover:text-background"
            >
              <CreditCard className="h-4 w-4" /> Buy
            </button>
          )}
        </div>
      </div>

      {/* Related */}
      <section className="container-luxe pb-32 pt-16">
        <div className="flex items-end justify-between border-b border-border pb-6">
          <h2 className="font-display text-3xl">You may also love</h2>
          <Link
            href="/collections"
            className="eyebrow inline-flex items-center gap-2 hover:text-gold transition-colors font-bold"
          >
            All <ArrowRight className="h-3.5 w-3.5 text-gold" />
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4 md:gap-x-8">
          {related.map((p: any) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
