import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Heart,
  ShoppingBag,
  Truck,
  Sparkles,
  Ruler,
  ChevronDown,
  ArrowRight,
  RotateCw,
  Image as ImageIcon,
} from "lucide-react";
import { PRODUCTS, formatINR } from "@/lib/products";
import { useShop } from "@/lib/store";
import { ProductCard } from "@/components/product-card";
import { ProductZoom } from "@/components/product-zoom";
import { Product360Viewer } from "@/components/product-360-viewer";

export const Route = createFileRoute("/product/$id")({
  loader: ({ params }) => {
    const product = PRODUCTS.find((p) => p.id === params.id);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.product.name ?? "Product"} — Maaya Couture` },
      { name: "description", content: loaderData?.product.description ?? "" },
      { property: "og:title", content: loaderData?.product.name ?? "" },
      { property: "og:description", content: loaderData?.product.description ?? "" },
      { property: "og:image", content: loaderData?.product.image ?? "" },
    ],
  }),
  component: ProductPage,
  notFoundComponent: () => (
    <div className="container-luxe py-24 text-center">
      <p className="eyebrow">Not found</p>
      <h1 className="mt-3 font-display text-4xl">This piece has retired</h1>
      <Link
        to="/shop"
        search={{ category: "all" }}
        className="mt-6 inline-block border-b border-foreground pb-1 eyebrow"
      >
        Browse the atelier
      </Link>
    </div>
  ),
});

const SIZES = ["XS", "S", "M", "L", "XL"];

function ProductPage() {
  const { product } = Route.useLoaderData();
  const addToCart = useShop((s) => s.addToCart);
  const wishlist = useShop((s) => s.wishlist);
  const toggleWishlist = useShop((s) => s.toggleWishlist);
  const [size, setSize] = useState("M");
  const [active, setActive] = useState(0);
  const [openSection, setOpenSection] = useState<string | null>("details");
  const [view360, setView360] = useState(false);
  const wished = wishlist.includes(product.id);

  // Sync to recently viewed
  useEffect(() => {
    if (product) {
      const history = JSON.parse(localStorage.getItem("maaya-recent-viewed") || "[]");
      const filtered = history.filter((p: any) => p.id !== product.id);
      localStorage.setItem(
        "maaya-recent-viewed",
        JSON.stringify([product, ...filtered].slice(0, 6)),
      );
    }
  }, [product]);

  const related = PRODUCTS.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div>
      {/* Structured SEO data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            name: product.name,
            image: product.gallery,
            description: product.description,
            sku: product.id.toUpperCase(),
            offers: {
              "@type": "Offer",
              url: `http://localhost:3000/product/${product.id}`,
              priceCurrency: "INR",
              price: product.price,
              availability: "https://schema.org/InStock",
              itemCondition: "https://schema.org/NewCondition",
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "http://localhost:3000",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Shop",
                item: "http://localhost:3000/shop",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: product.name,
                item: `http://localhost:3000/product/${product.id}`,
              },
            ],
          }),
        }}
      />

      <div className="container-luxe pt-6">
        <nav className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link to="/shop" search={{ category: "all" }} className="hover:text-foreground">
            Shop
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>
      </div>

      <div className="container-luxe grid gap-10 py-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
        {/* Gallery */}
        <div className="grid gap-3 md:grid-cols-[80px_1fr]">
          <div className="order-2 flex gap-3 md:order-1 md:flex-col">
            {product.gallery.map((img: string, i: number) => (
              <button
                key={i}
                onClick={() => {
                  setActive(i);
                  setView360(false);
                }}
                className={`aspect-[3/4] w-20 overflow-hidden border transition-colors ${
                  active === i && !view360 ? "border-foreground" : "border-transparent"
                }`}
              >
                <img src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}

            {/* 360 Toggle in gallery */}
            <button
              onClick={() => setView360(true)}
              className={`aspect-[3/4] w-20 flex flex-col items-center justify-center border text-[9px] uppercase tracking-wider transition-colors ${
                view360
                  ? "border-gold bg-gold/10 text-gold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <RotateCw className="h-4 w-4 mb-1" />
              360°
            </button>
          </div>
          <div className="order-1 aspect-[3/4] md:order-2">
            {view360 ? (
              <Product360Viewer images={product.gallery} />
            ) : (
              <ProductZoom src={product.gallery[active]} alt={product.name} />
            )}
          </div>
        </div>

        {/* Info */}
        <div className="lg:sticky lg:top-32 lg:self-start">
          <p className="eyebrow text-gold">{product.collection}</p>
          <h1 className="mt-3 font-display text-3xl leading-tight md:text-5xl">{product.name}</h1>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-xl">{formatINR(product.price)}</span>
            {product.compareAt && (
              <span className="text-sm text-muted-foreground line-through">
                {formatINR(product.compareAt)}
              </span>
            )}
            <span className="text-xs text-muted-foreground">incl. taxes</span>
          </div>

          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <div className="mt-8">
            <div className="flex items-center justify-between">
              <p className="eyebrow">Size</p>
              <button className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground">
                <Ruler className="h-3.5 w-3.5" /> Size guide
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`h-11 min-w-11 border px-4 text-sm transition-colors ${
                    size === s
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:border-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => addToCart(product, size)}
              className="inline-flex flex-1 items-center justify-center gap-2 bg-foreground py-4 text-xs font-medium tracking-[0.25em] uppercase text-background transition-colors hover:bg-gold hover:text-gold-foreground"
            >
              <ShoppingBag className="h-4 w-4" /> Add to bag
            </button>
            <button
              onClick={() => toggleWishlist(product.id)}
              aria-label="Wishlist"
              className="grid place-items-center border border-border px-6 py-4 hover:border-foreground transition-colors"
            >
              <Heart className={`h-4 w-4 ${wished ? "fill-gold text-gold" : ""}`} />
            </button>
          </div>

          <a
            href={`https://wa.me/919800000000?text=${encodeURIComponent(`Hi Maaya, I'd love to know more about the ${product.name}.`)}`}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex w-full items-center justify-center border border-[#25D366] py-3 text-xs uppercase tracking-[0.25em] text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors"
          >
            Enquire on WhatsApp
          </a>

          <div className="mt-8 grid gap-3 border-y border-border py-6 text-xs text-muted-foreground sm:grid-cols-2">
            <p className="inline-flex items-center gap-2">
              <Truck className="h-4 w-4 text-gold" /> Free shipping in India
            </p>
            <p className="inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-gold" /> Hand-finished, made-to-order
            </p>
          </div>

          {/* Accordion */}
          <div className="mt-8 divide-y divide-border border-y border-border">
            {[
              {
                id: "details",
                title: "Details",
                content: (
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {product.details.map((d: string) => (
                      <li key={d}>— {d}</li>
                    ))}
                  </ul>
                ),
              },
              {
                id: "shipping",
                title: "Shipping & Returns",
                content: (
                  <p className="text-sm text-muted-foreground">
                    Made-to-order pieces ship in 3–6 weeks. Complimentary shipping across India;
                    international from ₹2,500. Exchanges accepted within 7 days of delivery on
                    ready-to-wear pieces.
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
                onToggle={(e) =>
                  (e.currentTarget as HTMLDetailsElement).open && setOpenSection(s.id)
                }
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
        </div>
      </div>

      {/* Sticky mobile add-to-cart */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{product.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatINR(product.price)} · Size {size}
            </p>
          </div>
          <button
            onClick={() => addToCart(product, size)}
            className="ml-auto inline-flex items-center gap-2 bg-foreground px-5 py-3 text-xs font-medium uppercase tracking-[0.2em] text-background"
          >
            <ShoppingBag className="h-4 w-4" /> Add
          </button>
        </div>
      </div>

      {/* Related */}
      <section className="container-luxe pb-24 pt-10">
        <div className="flex items-end justify-between border-b border-border pb-6">
          <h2 className="font-display text-3xl">You may also love</h2>
          <Link
            to="/shop"
            search={{ category: "all" }}
            className="eyebrow inline-flex items-center gap-2 hover:text-gold"
          >
            All <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4 md:gap-x-8">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
