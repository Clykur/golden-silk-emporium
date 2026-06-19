import { Link, useLocation } from "@tanstack/react-router";
import { Heart, Search, ShoppingBag, User, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useShop, cartCount } from "@/lib/store";

const LEFT_NAV = [
  { to: "/" as const, label: "Home", search: {} },
  { to: "/shop" as const, label: "Shop", search: {} },
  { to: "/new-arrivals" as const, label: "New Arrivals", search: {} },
  { to: "/bestsellers" as const, label: "Best Sellers", search: {} },
];

const RIGHT_NAV = [
  { to: "/about" as const, label: "About Us", search: {} },
  { to: "/support" as const, label: "Contact", search: {} },
];

const ALL_NAV = [...LEFT_NAV, ...RIGHT_NAV];

export function SiteHeader() {
  const location = useLocation();
  const isHeroPath = location.pathname === "/" || location.pathname === "/about";
  const [hasHero, setHasHero] = useState(isHeroPath);
  const [heroVisible, setHeroVisible] = useState(isHeroPath);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const cart = useShop((s) => s.cart);
  const wishlist = useShop((s) => s.wishlist);
  const openCart = useShop((s) => s.openCart);
  const count = cartCount(cart);

  useEffect(() => {
    let observer: IntersectionObserver | null = null;

    const checkHero = () => {
      const heroEl = document.querySelector("[data-hero-section]");
      if (heroEl) {
        setHasHero(true);
        observer = new IntersectionObserver(
          ([entry]) => {
            setHeroVisible(entry.isIntersecting);
          },
          { threshold: 0 },
        );
        observer.observe(heroEl);
      } else {
        setHasHero(false);
        setHeroVisible(false);
      }
    };

    checkHero();
    const timeoutId = window.setTimeout(checkHero, 100);

    const mutationObserver = new MutationObserver(checkHero);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.clearTimeout(timeoutId);
      mutationObserver.disconnect();
      if (observer) {
        observer.disconnect();
      }
    };
  }, [location.pathname]);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 20);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const isHidden = hasHero && heroVisible;
  const isFloating = hasHero ? !heroVisible : scrolled;

  return (
    <>
      <div className="bg-ink text-background overflow-hidden h-9 flex items-center">
        <div className="flex animate-marquee whitespace-nowrap text-[0.7rem] tracking-[0.32em] uppercase">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex shrink-0 gap-12 px-6">
              <span>Shipping across India</span>
              <span className="text-gold">◆</span>
              <span>Contact us in Instagram & Whatsapp</span>
              <span className="text-gold">◆</span>
              <span>New arrivals every Week</span>
              <span className="text-gold">◆</span>
            </div>
          ))}
        </div>
      </div>

      {/* Spacer to push content down when the header is fixed and we don't have a hero section */}
      {!hasHero && <div className="h-[72px] md:h-[88px]" />}

      <header
        className={`fixed left-0 right-0 mx-auto z-40 transition-navbar ${isFloating
          ? "top-4 w-[92vw] md:w-[88vw] max-w-6xl rounded-2xl md:rounded-full border border-border/80 bg-background/85 backdrop-blur-xl shadow-lg"
          : "top-9 w-full max-w-none border border-transparent border-b-border bg-background"
          } ${isHidden ? "opacity-0 -translate-y-full pointer-events-none" : "opacity-100 translate-y-0"
          }`}
      >
        <div
          className={`flex items-center justify-between transition-navbar ${isFloating
            ? "w-full py-3 px-8"
            : "container-luxe py-4 md:py-5"
            }`}
        >
          {/* Column 1: Left Menu & Mobile Hamburger */}
          <div className="flex items-center gap-4">
            <button className="lg:hidden -ml-2 p-2" aria-label="Menu" onClick={() => setOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>

            <nav className="hidden lg:flex items-center gap-5 text-[11px] uppercase tracking-widest font-semibold">
              {LEFT_NAV.map((n) => (
                <Link
                  key={n.label}
                  to={n.to}
                  search={n.search}
                  className="relative text-foreground/80 hover:text-foreground transition-colors after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-gold after:transition-all hover:after:w-full"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 2: Center Brand */}
          <Link
            to="/"
            className="justify-self-center flex flex-col items-center select-none"
            aria-label="Drapeva home"
          >
            <span
              className="text-3xl md:text-4xl uppercase tracking-[0.22em]"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Drapeva
            </span>
          </Link>

          {/* Column 3: Right Menu + Icons */}
          <div className="flex items-center gap-4 justify-self-end">
            <nav className="hidden lg:flex items-center gap-5 text-[11px] uppercase tracking-widest font-semibold mr-2">
              {RIGHT_NAV.map((n) => (
                <Link
                  key={n.label}
                  to={n.to}
                  search={n.search}
                  className="relative text-foreground/80 hover:text-foreground transition-colors after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-gold after:transition-all hover:after:w-full"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-1 md:gap-2">
              <button
                className="hidden md:inline-flex p-2 hover:text-gold transition-colors"
                aria-label="Search"
              >
                <Search className="h-[18px] w-[18px]" />
              </button>
              <Link
                to="/wishlist"
                className="relative p-2 hover:text-gold transition-colors"
                aria-label="Wishlist"
              >
                <Heart className="h-[18px] w-[18px]" />
                {wishlist.length > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full bg-gold text-[10px] font-medium text-gold-foreground">
                    {wishlist.length}
                  </span>
                )}
              </Link>
              <button
                className="hidden md:inline-flex p-2 hover:text-gold transition-colors"
                aria-label="Account"
              >
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
        </div>
      </header>

      {/* Mobile menu */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[82%] max-w-sm bg-background p-6 animate-rise">
            <div className="flex items-center justify-between">
              <Link
                to="/"
                onClick={() => setOpen(false)}
                aria-label="Drapeva home"
                className="flex items-center"
              >
                <span
                  className="text-3xl font-serif tracking-[0.2em] uppercase"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  Drapeva
                </span>
              </Link>
              <button onClick={() => setOpen(false)} aria-label="Close" className="p-2">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="mt-10 flex flex-col gap-1">
              {ALL_NAV.map((n) => (
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
              <Link
                to="/wishlist"
                onClick={() => setOpen(false)}
                className="border-b border-border/60 py-4 font-display text-2xl"
              >
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
