"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Heart, Search, ShoppingBag, User, Menu, X, Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useShop, cartCount } from "@/lib/store";
import { useAuth } from "@/lib/auth-store";
import { notificationsApi, productsApi } from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { formatINR } from "@/lib/types";

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const ACCOUNT_HOME = "/account";
  const [activeHash, setActiveHash] = useState("");

  useEffect(() => {
    // Update hash on mount and hashchange
    setActiveHash(window.location.hash);
    const handleHashChange = () => setActiveHash(window.location.hash);
    window.addEventListener("hashchange", handleHashChange);

    // Intersection observer for section-wise active state
    const observer = new IntersectionObserver(
      (entries) => {
        let activeSection = "";

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            activeSection = `#${entry.target.id}`;
          }

          // Clear active state when bestsellers is completely above viewport
          if (entry.target.id === "bestsellers" && entry.boundingClientRect.bottom < 0) {
            activeSection = "";
          }
        });

        setActiveHash(activeSection);
      },
      {
        threshold: 0.3,
      },
    );

    const sections = document.querySelectorAll("section[id]");
    sections.forEach((section) => observer.observe(section));

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      sections.forEach((section) => observer.unobserve(section));
    };
  }, [pathname]);

  const isActive = (to: string) => {
    if (to.includes("#")) {
      const hash = to.substring(to.indexOf("#"));
      // if on homepage and hash matches, or we're strictly matching the to path
      if (pathname === "/") return activeHash === hash;
      return pathname + activeHash === to;
    }
    if (to === "/") return pathname === "/";
    if (to === "/collections")
      return (
        pathname === "/collections" ||
        (pathname === "/collections" && searchParams.get("collection") !== null)
      );
    if (to === "/collections")
      return (
        (pathname === "/collections" && searchParams.get("collection") === null) ||
        pathname.startsWith("/product")
      );
    return pathname === to || pathname.startsWith(to + "/");
  };
  const queryClient = useQueryClient();
  const isHeroPath = pathname === "/" || pathname === "/about";
  const [hasHero, setHasHero] = useState(isHeroPath);
  const [heroVisible, setHeroVisible] = useState(isHeroPath);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const cart = useShop((s) => s.cart);
  const wishlist = useShop((s) => s.wishlist);
  const openCart = useShop((s) => s.openCart);
  const count = cartCount(cart);

  const { user, logout: authLogout } = useAuth();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, to: string) => {
    setOpen(false);
    if (to.startsWith("/#") && pathname === "/") {
      e.preventDefault();
      const id = to.replace("/#", "");
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        window.history.pushState(null, "", to);
        setActiveHash(`#${id}`);
      }
    }
  };

  const leftNavItems = [
    { to: "/#home" as const, label: "Home" },
    { to: "/#new-arrivals" as const, label: "New Arrivals" },
    { to: "/#bestsellers" as const, label: "Best Sellers" },
    { to: "/collections" as const, label: "Collections" },
  ];

  const rightNavItems = user
    ? []
    : [
        { to: "/about" as const, label: "About" },
        { to: "/support" as const, label: "Contact" },
      ];

  const allNavItems = [...leftNavItems, ...rightNavItems];

  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: ["header-search", searchQuery],
    queryFn: () =>
      searchQuery.trim().length > 1
        ? productsApi.list({ search: searchQuery })
        : Promise.resolve([]),
    enabled: searchQuery.trim().length > 1,
  });

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["unread-notifications-count", user?.id],
    queryFn: () => (user ? notificationsApi.unreadCount(user.id) : Promise.resolve(0)),
    enabled: !!user,
    refetchInterval: 4000,
  });

  // Real-time notifications and order status updates subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`public:notifications:user_id=eq.${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ["unread-notifications-count", user.id] });
          queryClient.invalidateQueries({ queryKey: ["my-notifications", user.id] });

          if (payload.eventType === "INSERT") {
            const newNotif = payload.new as any;
            toast.info(newNotif.title || "New update received", {
              description: newNotif.message,
              action: {
                label: "View",
                onClick: () => router.push("/account/notifications"),
              },
            });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient, router]);

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
  }, [pathname]);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 20);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const isHidden = hasHero && heroVisible;
  const isFloating = hasHero ? !heroVisible : scrolled;

  // Hide header completely in admin portal
  if (pathname && /^\/admin(\/.*)?$/.test(pathname)) {
    return null;
  }

  return (
    <>
      <div className="h-[56px] sm:h-[64px] md:h-[72px] lg:h-auto">
        <header
          className={`fixed lg:sticky top-0 left-0 right-0 w-full z-40 transition-all duration-700 ease-in-out translate-y-0 opacity-100 ${
            scrolled
              ? "bg-background/90 backdrop-blur-xl border-b border-border shadow-sm"
              : "bg-background border-b border-transparent"
          }`}
        >
          <div
            className={`flex items-center justify-between container-luxe transition-all duration-700 ${scrolled ? "py-1" : "py-2"} min-w-0`}
          >
            {/* Column 1: Left Menu & Mobile Hamburger */}
            <div className="flex flex-1 items-center gap-6">
              <button
                className="lg:hidden -ml-2 p-2 hover:opacity-70 transition-opacity"
                aria-label="Menu"
                onClick={() => setOpen(true)}
              >
                <Menu className="h-[22px] w-[22px]" strokeWidth={1.2} />
              </button>

              <nav className="hidden lg:flex items-center gap-8 text-[10px] uppercase tracking-[0.2em] font-medium">
                {leftNavItems.map((n) => {
                  const active = isActive(n.to);
                  return (
                    <Link
                      key={n.label}
                      href={n.to}
                      onClick={(e) => handleNavClick(e, n.to)}
                      className={cn(
                        "group relative py-2 transition-colors",
                        active ? "text-foreground" : "text-foreground/60 hover:text-foreground",
                      )}
                    >
                      {n.label}
                      <span
                        className={cn(
                          "absolute bottom-0 left-0 h-[1px] bg-foreground transition-all duration-500 ease-out",
                          active ? "w-full" : "w-0 group-hover:w-full",
                        )}
                      />
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Column 2: Center Brand */}
            <Link
              href="/"
              className="flex-1 flex justify-center items-center select-none"
              aria-label="Drapeva home"
            >
              <span className="text-lg sm:text-2xl md:text-[26px] uppercase tracking-[0.2em] sm:tracking-[0.3em] font-limelight font-light transition-transform duration-700 hover:scale-105">
                Drapeva
              </span>
            </Link>

            {/* Column 3: Right Menu + Icons */}
            <div className="flex flex-1 items-center justify-end gap-6">
              {rightNavItems.length > 0 && (
                <nav className="hidden lg:flex items-center gap-8 text-[10px] uppercase tracking-[0.2em] font-medium mr-2">
                  {rightNavItems.map((n) => {
                    const active = isActive(n.to);
                    return (
                      <Link
                        key={n.label}
                        href={n.to}
                        onClick={(e) => handleNavClick(e, n.to)}
                        className={cn(
                          "group relative py-2 transition-colors",
                          active ? "text-foreground" : "text-foreground/60 hover:text-foreground",
                        )}
                      >
                        {n.label}
                        <span
                          className={cn(
                            "absolute bottom-0 left-0 h-[1px] bg-foreground transition-all duration-500 ease-out",
                            active ? "w-full" : "w-0 group-hover:w-full",
                          )}
                        />
                      </Link>
                    );
                  })}
                </nav>
              )}

              <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
                {/* Search */}
                <button
                  onClick={() => setSearchOpen((prev) => !prev)}
                  className="p-2 hover:opacity-60 transition-opacity"
                  aria-label="Search"
                >
                  <Search className="h-5 w-5" strokeWidth={1.2} />
                </button>

                {/* Wishlist */}
                {user && (
                  <Link
                    href="/account/wishlist"
                    className="relative p-2 hover:opacity-60 transition-opacity"
                    aria-label="Wishlist"
                  >
                    <Heart className="h-5 w-5" strokeWidth={1.2} />
                    {wishlist.length > 0 && (
                      <span className="absolute right-0 top-1 grid h-3.5 w-3.5 place-items-center rounded-full bg-foreground text-[8px] font-bold text-background">
                        {wishlist.length}
                      </span>
                    )}
                  </Link>
                )}

                {/* Cart */}
                <button
                  onClick={openCart}
                  className="relative p-2 hover:opacity-60 transition-opacity"
                  aria-label="Cart"
                >
                  <ShoppingBag className="h-5 w-5" strokeWidth={1.2} />
                  {count > 0 && (
                    <span className="absolute right-0 top-1 grid h-3.5 w-3.5 place-items-center rounded-full bg-foreground text-[8px] font-bold text-background">
                      {count}
                    </span>
                  )}
                </button>

                {/* Notifications */}
                {user && (
                  <Link
                    href="/account/notifications"
                    className="relative p-2 hover:opacity-60 transition-opacity"
                    aria-label="Notifications"
                  >
                    <Bell className="h-5 w-5" strokeWidth={1.2} />
                    {unreadCount > 0 && (
                      <span className="absolute right-0 top-1 grid h-3.5 w-3.5 place-items-center rounded-full bg-foreground text-[8px] font-bold text-background animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                )}

                {user ? (
                  <div className="relative hidden lg:block ml-2">
                    <Link
                      href={ACCOUNT_HOME}
                      className="flex items-center gap-2 h-9 px-4 rounded-full border border-border/40 hover:border-gold/40 hover:bg-champagne/10 transition-all text-[11px] font-semibold uppercase tracking-widest text-foreground/80 hover:text-gold"
                    >
                      <User className="h-3.5 w-3.5" strokeWidth={1.5} />
                      <span className="truncate max-w-[140px]">
                        {user.name || user.email?.split("@")[0]}
                      </span>
                    </Link>
                  </div>
                ) : (
                  /* Login / Register Link Button */
                  <div className="hidden lg:flex items-center gap-3 text-xs ml-2">
                    <Link
                      href="/login"
                      className="relative text-[11px] uppercase tracking-widest font-semibold text-foreground/80 hover:text-gold transition-colors after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-0 after:bg-gold after:transition-all hover:after:w-full"
                    >
                      Login
                    </Link>
                    <span className="text-border text-xs">/</span>
                    <Link
                      href="/register"
                      className="relative text-[11px] uppercase tracking-widest font-semibold text-foreground/80 hover:text-gold transition-colors after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-0 after:bg-gold after:transition-all hover:after:w-full"
                    >
                      Register
                    </Link>
                  </div>
                )}

                {/* Mobile Profile Trigger */}
                {user && (
                  <Link
                    href={ACCOUNT_HOME}
                    className="lg:hidden h-7 w-7 rounded-full bg-gradient-to-br from-gold/20 to-gold/40 text-gold grid place-items-center text-xs font-semibold ring-2 ring-gold/20 hover:scale-105 transition-transform"
                    aria-label="Account Dashboard"
                  >
                    {(user.name || user.email).charAt(0).toUpperCase()}
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Inline Search Drawer (Slides down below header) */}
          {searchOpen && (
            <div className="border-t border-border bg-background w-full animate-rise">
              <div className="container-luxe py-6 max-h-[80vh] overflow-y-auto">
                <div className="flex items-center gap-4 border-b border-border pb-3">
                  <Search className="h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search for sarees, fabrics, collections..."
                    className="flex-1 bg-transparent text-lg focus:outline-none placeholder:text-muted-foreground/60"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="p-1 hover:text-gold transition-colors text-muted-foreground"
                      aria-label="Clear Search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery("");
                    }}
                    className="text-xs uppercase tracking-widest font-semibold hover:text-gold transition-colors"
                  >
                    Close
                  </button>
                </div>

                <div className="mt-6">
                  {searchQuery.trim().length <= 1 ? (
                    <div>
                      <p className="eyebrow text-muted-foreground mb-3">Popular Searches</p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { label: "Silk Sarees", href: "/collections?fabric=Silk" },
                          { label: "Kanjivaram Sarees", href: "/collections?fabric=Kanjivaram" },
                          { label: "Banarasi", href: "/collections?fabric=Banarasi" },
                          { label: "Organza Sarees", href: "/collections?fabric=Organza" },
                          { label: "Cotton Sarees", href: "/collections?fabric=Cotton" },
                          { label: "Bridal Sarees", href: "/collections?category=bridal-sarees" },
                          {
                            label: "Wedding Collection",
                            href: "/collections?collection=vivah-couture",
                          },
                        ].map((item) => (
                          <Link
                            key={item.label}
                            href={item.href}
                            onClick={() => {
                              setSearchOpen(false);
                              setSearchQuery("");
                            }}
                            className="px-4 py-2 border border-border bg-champagne/10 hover:border-gold hover:bg-champagne/20 text-xs transition-colors rounded-full font-medium"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : isSearching ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:grid-cols-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="animate-pulse" role="status">
                          <div className="aspect-[3/4] bg-champagne/30 rounded" />
                          <div className="mt-2 h-3 w-3/4 bg-champagne/40 rounded" />
                          <div className="mt-1 h-3 w-1/4 bg-champagne/30 rounded" />
                        </div>
                      ))}
                    </div>
                  ) : searchResults.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4">
                      No sarees found matching your search.
                    </p>
                  ) : (
                    <div>
                      <p className="eyebrow text-muted-foreground mb-4">
                        Search Results ({searchResults.length})
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-4 max-h-[50vh] overflow-y-auto pr-2">
                        {searchResults.slice(0, 8).map((p: any) => (
                          <Link
                            key={p.id}
                            href={`/product/${p.slug}`}
                            onClick={() => {
                              setSearchOpen(false);
                              setSearchQuery("");
                            }}
                            className="group flex gap-3 border border-border p-2 bg-background hover:border-gold/30 transition-colors"
                          >
                            <div className="aspect-[3/4] w-14 shrink-0 overflow-hidden bg-champagne/10">
                              <img
                                src={p.image}
                                alt={p.name}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            </div>
                            <div className="flex flex-col justify-center min-w-0">
                              <p className="text-xs font-semibold truncate group-hover:text-gold transition-colors">
                                {p.name}
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">{p.fabric}</p>
                              <p className="text-xs font-display text-gold mt-1 font-semibold">
                                {formatINR(p.price)}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                      {searchResults.length > 8 && (
                        <Link
                          href={`/shop?search=${searchQuery}`}
                          onClick={() => {
                            setSearchOpen(false);
                            setSearchQuery("");
                          }}
                          className="inline-block mt-4 text-xs font-semibold uppercase tracking-wider hover:text-gold border-b border-foreground hover:border-gold pb-0.5 transition-colors"
                        >
                          View all results →
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </header>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[85%] max-w-sm bg-background p-5 sm:p-6 animate-rise overflow-y-auto overscroll-contain">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                aria-label="Drapeva home"
                className="flex items-center"
              >
                <span className="text-3xl font-limelight tracking-[0.2em] uppercase">Drapeva</span>
              </Link>
              <button onClick={() => setOpen(false)} aria-label="Close" className="p-2">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="mt-10 flex flex-col gap-1 overflow-y-auto max-h-[60vh] pr-2">
              {allNavItems.map((n) => {
                const active = isActive(n.to);
                return (
                  <Link
                    key={n.label}
                    href={n.to}
                    onClick={(e) => handleNavClick(e, n.to)}
                    className={cn(
                      "border-b border-border/60 py-3 font-display text-xl transition-all duration-300",
                      active
                        ? "text-gold pl-2 border-l-2 border-l-gold font-semibold"
                        : "text-foreground hover:text-gold",
                    )}
                  >
                    {n.label}
                  </Link>
                );
              })}

              {user ? (
                <>
                  <div className="pt-4 pb-2 border-t border-border mt-4">
                    <p className="eyebrow text-gold text-[10px]">Patron Area</p>
                  </div>
                  {user.role === "admin" && (
                    <Link
                      href="/admin/dashboard"
                      onClick={() => setOpen(false)}
                      className={cn(
                        "border-b border-border/60 py-3 font-display text-xl transition-all duration-300",
                        isActive("/admin")
                          ? "text-gold pl-2 border-l-2 border-l-gold font-semibold"
                          : "text-gold hover:text-gold/80",
                      )}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <Link
                    href="/account/profile"
                    onClick={() => setOpen(false)}
                    className={cn(
                      "border-b border-border/60 py-3 font-display text-xl transition-all duration-300",
                      isActive("/account/profile")
                        ? "text-gold pl-2 border-l-2 border-l-gold font-semibold"
                        : "text-foreground hover:text-gold",
                    )}
                  >
                    My Account
                  </Link>
                  <Link
                    href="/account/orders"
                    onClick={() => setOpen(false)}
                    className={cn(
                      "border-b border-border/60 py-3 font-display text-xl transition-all duration-300",
                      isActive("/account/orders")
                        ? "text-gold pl-2 border-l-2 border-l-gold font-semibold"
                        : "text-foreground hover:text-gold",
                    )}
                  >
                    My Orders
                  </Link>
                  <Link
                    href="/account/wishlist"
                    onClick={() => setOpen(false)}
                    className={cn(
                      "border-b border-border/60 py-3 font-display text-xl transition-all duration-300",
                      isActive("/account/wishlist")
                        ? "text-gold pl-2 border-l-2 border-l-gold font-semibold"
                        : "text-foreground hover:text-gold",
                    )}
                  >
                    Wishlist
                  </Link>
                  <Link
                    href="/account/addresses"
                    onClick={() => setOpen(false)}
                    className={cn(
                      "border-b border-border/60 py-3 font-display text-xl transition-all duration-300",
                      isActive("/account/addresses")
                        ? "text-gold pl-2 border-l-2 border-l-gold font-semibold"
                        : "text-foreground hover:text-gold",
                    )}
                  >
                    Saved Addresses
                  </Link>
                  <Link
                    href="/account/recently-viewed"
                    onClick={() => setOpen(false)}
                    className={cn(
                      "border-b border-border/60 py-3 font-display text-xl transition-all duration-300",
                      isActive("/account/recently-viewed")
                        ? "text-gold pl-2 border-l-2 border-l-gold font-semibold"
                        : "text-foreground hover:text-gold",
                    )}
                  >
                    Recently Viewed
                  </Link>
                  <Link
                    href="/account/notifications"
                    onClick={() => setOpen(false)}
                    className={cn(
                      "border-b border-border/60 py-3 font-display text-xl transition-all duration-300",
                      isActive("/account/notifications")
                        ? "text-gold pl-2 border-l-2 border-l-gold font-semibold"
                        : "text-foreground hover:text-gold",
                    )}
                  >
                    Notifications
                  </Link>
                  <Link
                    href="/account/support"
                    onClick={() => setOpen(false)}
                    className={cn(
                      "border-b border-border/60 py-3 font-display text-xl transition-all duration-300",
                      isActive("/account/support")
                        ? "text-gold pl-2 border-l-2 border-l-gold font-semibold"
                        : "text-foreground hover:text-gold",
                    )}
                  >
                    Support
                  </Link>
                  <button
                    onClick={async () => {
                      setOpen(false);
                      await authLogout();
                      toast.success("Signed out successfully");
                      router.push("/");
                    }}
                    className="py-3 font-display text-xl text-left text-destructive mt-2 w-full hover:bg-destructive/5 transition-colors pl-2"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className={cn(
                      "border-b border-border/60 py-3 font-display text-xl transition-all duration-300",
                      isActive("/login")
                        ? "text-gold pl-2 border-l-2 border-l-gold font-semibold"
                        : "text-gold hover:text-gold/80",
                    )}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setOpen(false)}
                    className={cn(
                      "border-b border-border/60 py-3 font-display text-xl transition-all duration-300",
                      isActive("/register")
                        ? "text-gold pl-2 border-l-2 border-l-gold font-semibold"
                        : "text-foreground hover:text-gold",
                    )}
                  >
                    Register
                  </Link>
                </>
              )}
            </nav>
            <a
              href="https://wa.me/919949740776"
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
