import { Link } from "@tanstack/react-router";
import { Heart, Search, ShoppingBag, User, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useShop, cartCount } from "@/lib/store";

const NAV = [
  { to: "/shop", label: "Shop", search: { category: "all" as const } },
  { to: "/shop", label: "Sarees", search: { category: "Sarees" as const } },
  { to: "/shop", label: "Lehengas", search: { category: "Lehengas" as const } },
  { to: "/shop", label: "Bridal", search: { category: "Bridal" as const } },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const cart = useShop((s) => s.cart);
  const wishlist = useShop((s) => s.wishlist);
  const openCart = useShop((s) => s.openCart);
  const count = cartCount(cart);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <>
      <div className="bg-ink text-background overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap py-2 text-[0.7rem] tracking-[0.32em] uppercase">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex shrink-0 gap-12 px-6">
              <span>Complimentary shipping across India</span>
              <span className="text-gold">◆</span>
              <span>Hand-finished, made-to-order</span>
              <span className="text-gold">◆</span>
              <span>Concierge on WhatsApp · +91 98 0000 0000</span>
              <span className="text-gold">◆</span>
              <span>New arrivals every Friday</span>
              <span className="text-gold">◆</span>
            </div>
          ))}
        </div>
      </div>

      <header
        className={`sticky top-0 z-40 border-b transition-all ${
          scrolled
            ? "border-border bg-background/85 backdrop-blur-xl"
            : "border-transparent bg-background"
        }`}
      >
        <div className="container-luxe grid grid-cols-[auto_1fr_auto] items-center gap-6 py-4 md:py-5">
          <button
            className="md:hidden -ml-2 p-2"
            aria-label="Menu"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          <nav className="hidden md:flex items-center gap-7 text-sm">
            {NAV.map((n) => (
              <Link
                key={n.label}
                to={n.to}
                search={n.search}
                className="relative text-foreground/80 hover:text-foreground transition-colors after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-gold after:transition-all hover:after:w-full"
              >
                {n.label}
              </Link>
            ))}
            <Link
              to="/shop"
              search={{ category: "all" }}
              className="text-foreground/80 hover:text-foreground"
            >
              Journal
            </Link>
          </nav>

          <Link
            to="/"
            className="justify-self-center text-center"
            aria-label="Maaya home"
          >
            <span className="font-display text-2xl md:text-3xl tracking-[0.2em]">
              MAAYA
            </span>
            <span className="block eyebrow mt-0.5 text-[0.55rem]">
              Couture · Est. 1998
            </span>
          </Link>

          <div className="flex items-center gap-1 md:gap-2 justify-self-end">
            <button className="hidden md:inline-flex p-2 hover:text-gold transition-colors" aria-label="Search">
              <Search className="h-[18px] w-[18px]" />
            </button>
            <Link to="/wishlist" className="relative p-2 hover:text-gold transition-colors" aria-label="Wishlist">
              <Heart className="h-[18px] w-[18px]" />
              {wishlist.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full bg-gold text-[10px] font-medium text-gold-foreground">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <button className="hidden md:inline-flex p-2 hover:text-gold transition-colors" aria-label="Account">
              <User className="h-[18px] w-[18px]" />
            </button>
            <button
              onClick={openCart}
              className="relative p-2 hover:text-gold transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag className="h-[18px] w-[18px]" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full bg-gold text-[10px] font-medium text-gold-foreground">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[82%] max-w-sm bg-background p-6 animate-rise">
            <div className="flex items-center justify-between">
              <span className="font-display text-xl tracking-[0.2em]">MAAYA</span>
              <button onClick={() => setOpen(false)} aria-label="Close" className="p-2">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="mt-10 flex flex-col gap-1">
              {NAV.map((n) => (
                <Link
                  key={n.label}
                  to={n.to}
                  search={n.search}
                  onClick={() => setOpen(false)}
                  className="border-b border-border/60 py-4 font-display text-2xl"
                >
                  {n.label}
                </Link>
              ))}
              <Link to="/wishlist" onClick={() => setOpen(false)} className="border-b border-border/60 py-4 font-display text-2xl">
                Wishlist
              </Link>
            </nav>
            <a
              href="https://wa.me/919800000000"
              className="mt-10 inline-flex items-center gap-2 eyebrow text-gold"
            >
              <span className="gold-divider" /> Concierge on WhatsApp
            </a>
          </div>
        </div>
      )}
    </>
  );
}
