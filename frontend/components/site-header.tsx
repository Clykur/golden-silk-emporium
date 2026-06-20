"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Heart,
  Search,
  ShoppingBag,
  User,
  Menu,
  X,
  Bell,
  LogOut,
  Package,
  MapPin,
  Shield,
  LayoutDashboard,
  HelpCircle,
  ShoppingCart,
  Clock,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useShop, cartCount } from "@/lib/store";
import { useAuth } from "@/lib/auth-store";
import { notificationsApi, productsApi } from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { formatINR } from "@/lib/types";

const PROFILE_MENU = [
  { to: "/account/profile", label: "My Account", icon: User },
  { to: "/account/orders", label: "My Orders", icon: Package },
  { to: "/account/wishlist", label: "Wishlist", icon: Heart },
  { to: "/account/addresses", label: "Saved Addresses", icon: MapPin },
  { to: "/account/recently-viewed", label: "Recently Viewed", icon: Clock },
  { to: "/account/notifications", label: "Notifications", icon: Bell },
  { to: "/account/support", label: "Support", icon: HelpCircle },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const isActive = (to: string) => {
    if (to === "/") {
      return pathname === "/";
    }
    if (to === "/collections") {
      return (
        pathname === "/collections" ||
        (pathname === "/shop" && searchParams.get("collection") !== null)
      );
    }
    if (to === "/shop") {
      const isCollectionFilter = pathname === "/shop" && searchParams.get("collection") !== null;
      return (pathname === "/shop" && !isCollectionFilter) || pathname.startsWith("/product");
    }
    return pathname === to || pathname.startsWith(to + "/");
  };
  const queryClient = useQueryClient();
  const isHeroPath = pathname === "/" || pathname === "/about";
  const [hasHero, setHasHero] = useState(isHeroPath);
  const [heroVisible, setHeroVisible] = useState(isHeroPath);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Ref for click-outside detection on the profile dropdown
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const cart = useShop((s) => s.cart);
  const wishlist = useShop((s) => s.wishlist);
  const openCart = useShop((s) => s.openCart);
  const count = cartCount(cart);

  const { user, logout: authLogout } = useAuth();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const leftNavItems = user
    ? [
        { to: "/dashboard" as const, label: "My Dashboard" },
        { to: "/shop" as const, label: "Shop" },
        { to: "/new-arrivals" as const, label: "New Arrivals" },
        { to: "/trending" as const, label: "Trending" },
      ]
    : [
        { to: "/" as const, label: "Home" },
        { to: "/new-arrivals" as const, label: "New Arrivals" },
        { to: "/bestsellers" as const, label: "Best Sellers" },
        { to: "/collections" as const, label: "Collections" },
      ];

  const rightNavItems = user
    ? []
    : [
        { to: "/about" as const, label: "About Us" },
        { to: "/support" as const, label: "Contact Us" },
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
    refetchInterval: 30000,
  });

  // Close dropdown when navigating to a new page
  useEffect(() => {
    setProfileDropdownOpen(false);
  }, [pathname]);

  // Click-outside and Escape key handler for profile dropdown
  useEffect(() => {
    if (!profileDropdownOpen) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [profileDropdownOpen]);

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

  const handleProfileMenuClick = () => {
    setProfileDropdownOpen(false);
  };

  const handleLogout = async () => {
    setProfileDropdownOpen(false);
    await authLogout();
    toast.success("Signed out successfully");
    router.push("/");
  };

  return (
    <>
      <div className="bg-ink text-background overflow-hidden h-9 flex items-center">
        <div className="flex animate-marquee whitespace-nowrap text-[0.7rem] tracking-[0.32em] uppercase">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex shrink-0 gap-12 px-6">
              <span>Shipping across India</span>
              <span className="text-gold">◆</span>
              <span>Contact us in Instagram &amp; Whatsapp</span>
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
        className={`fixed left-0 right-0 mx-auto z-40 transition-navbar ${
          isFloating
            ? "top-4 w-[92vw] md:w-[88vw] max-w-6xl rounded-2xl md:rounded-full border border-border/80 bg-background/85 backdrop-blur-xl shadow-lg"
            : "top-9 w-full max-w-none border border-transparent border-b-border bg-background"
        } ${
          isHidden ? "opacity-0 -translate-y-full pointer-events-none" : "opacity-100 translate-y-0"
        }`}
      >
        <div
          className={`flex items-center justify-between transition-navbar ${
            isFloating ? "w-full py-3 px-8" : "container-luxe py-4 md:py-5"
          }`}
        >
          {/* Column 1: Left Menu & Mobile Hamburger */}
          <div className="flex items-center gap-4">
            <button className="lg:hidden -ml-2 p-2" aria-label="Menu" onClick={() => setOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>

            <nav className="hidden lg:flex items-center gap-5 text-[11px] uppercase tracking-widest font-semibold">
              {leftNavItems.map((n) => {
                const active = isActive(n.to);
                return (
                  <Link
                    key={n.label}
                    href={n.to}
                    className={cn(
                      "relative transition-colors after:absolute after:left-0 after:-bottom-1 after:h-px after:bg-gold after:transition-all",
                      active
                        ? "text-gold font-bold after:w-full"
                        : "text-foreground/80 hover:text-foreground after:w-0 hover:after:w-full",
                    )}
                  >
                    {n.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Column 2: Center Brand */}
          <Link
            href={user ? "/dashboard" : "/"}
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
            {rightNavItems.length > 0 && (
              <nav className="hidden lg:flex items-center gap-5 text-[11px] uppercase tracking-widest font-semibold mr-2">
                {rightNavItems.map((n) => {
                  const active = isActive(n.to);
                  return (
                    <Link
                      key={n.label}
                      href={n.to}
                      className={cn(
                        "relative transition-colors after:absolute after:left-0 after:-bottom-1 after:h-px after:bg-gold after:transition-all",
                        active
                          ? "text-gold font-bold after:w-full"
                          : "text-foreground/80 hover:text-foreground after:w-0 hover:after:w-full",
                      )}
                    >
                      {n.label}
                    </Link>
                  );
                })}
              </nav>
            )}

            <div className="flex items-center gap-1 md:gap-2">
              {/* Search */}
              <button
                onClick={() => setSearchOpen((prev) => !prev)}
                className="p-2 hover:text-gold transition-colors"
                aria-label="Search"
              >
                <Search className="h-[18px] w-[18px]" />
              </button>

              {/* Wishlist */}
              {user && (
                <Link
                  href="/account/wishlist"
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
              )}

              {/* Cart */}
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

              {/* Notifications */}
              {user && (
                <Link
                  href="/account/notifications"
                  className="relative p-2 hover:text-gold transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="h-[18px] w-[18px]" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full bg-gold text-[10px] font-medium text-gold-foreground animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              )}

              {user ? (
                /* Profile Dropdown Menu — desktop only; mobile uses the hamburger drawer */
                <div ref={profileDropdownRef} className="relative hidden lg:block">
                  <button
                    id="profile-menu-button"
                    onClick={() => setProfileDropdownOpen((prev) => !prev)}
                    className="h-8 w-8 rounded-full bg-gradient-to-br from-gold/20 to-gold/40 text-gold grid place-items-center text-xs font-semibold ring-2 ring-gold/20 hover:scale-105 transition-transform"
                    aria-label="User Profile Menu"
                    aria-haspopup="true"
                    aria-expanded={profileDropdownOpen}
                    aria-controls="profile-dropdown"
                  >
                    {(user.name || user.email).charAt(0).toUpperCase()}
                  </button>

                  {profileDropdownOpen && (
                    <div
                      id="profile-dropdown"
                      role="menu"
                      aria-labelledby="profile-menu-button"
                      className="absolute right-0 mt-2 w-64 bg-background border border-border shadow-lg rounded-md py-2 z-50 animate-rise"
                    >
                      {/* User info header */}
                      <div className="px-4 py-3 border-b border-border">
                        <p className="font-semibold text-sm truncate">
                          {user.name || user.email.split("@")[0]}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        <p className="text-[9px] uppercase tracking-wider text-gold mt-1 capitalize font-medium">
                          {user.role} account
                        </p>
                      </div>

                      {/* Menu items */}
                      <div className="py-1" role="none">
                        {user.role === "admin" && (
                          <Link
                            href="/admin/dashboard"
                            role="menuitem"
                            onClick={handleProfileMenuClick}
                            className={cn(
                              "flex items-center gap-3 px-4 py-2.5 text-xs uppercase tracking-widest font-semibold transition-colors border-b border-border",
                              isActive("/admin")
                                ? "bg-gold/10 text-gold font-bold"
                                : "text-foreground hover:bg-champagne/45 hover:text-gold",
                            )}
                          >
                            <LayoutDashboard className="h-4 w-4 text-gold/80 shrink-0" />
                            Admin Dashboard
                          </Link>
                        )}
                        {PROFILE_MENU.map(({ to, label, icon: Icon }) => {
                          const active = isActive(to);
                          return (
                            <Link
                              key={to}
                              href={to}
                              role="menuitem"
                              onClick={handleProfileMenuClick}
                              className={cn(
                                "flex items-center gap-3 px-4 py-2.5 text-xs uppercase tracking-widest font-semibold transition-colors",
                                active
                                  ? "bg-gold/10 text-gold font-bold"
                                  : "text-foreground hover:bg-champagne/45 hover:text-gold",
                              )}
                            >
                              <Icon className="h-4 w-4 text-gold/80 shrink-0" />
                              {label}
                            </Link>
                          );
                        })}
                      </div>

                      {/* Logout */}
                      <div className="border-t border-border pt-1 mt-1" role="none">
                        <button
                          role="menuitem"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-xs uppercase tracking-widest font-medium text-destructive hover:bg-destructive/5 transition-colors text-left"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
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
                  href="/dashboard"
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
                        { label: "Silk Sarees", href: "/shop?fabric=Silk" },
                        { label: "Kanjivaram Sarees", href: "/shop?fabric=Kanjivaram" },
                        { label: "Banarasi", href: "/shop?fabric=Banarasi" },
                        { label: "Organza Sarees", href: "/shop?fabric=Organza" },
                        { label: "Cotton Sarees", href: "/shop?fabric=Cotton" },
                        { label: "Bridal Sarees", href: "/shop?category=bridal-sarees" },
                        { label: "Wedding Collection", href: "/shop?collection=vivah-couture" },
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
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
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
                    <div className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-4 max-h-[50vh] overflow-y-auto pr-2">
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

      {/* Mobile menu */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[82%] max-w-sm bg-background p-6 animate-rise">
            <div className="flex items-center justify-between">
              <Link
                href={user ? "/dashboard" : "/"}
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
            <nav className="mt-10 flex flex-col gap-1 overflow-y-auto max-h-[60vh] pr-2">
              {allNavItems.map((n) => {
                const active = isActive(n.to);
                return (
                  <Link
                    key={n.label}
                    href={n.to}
                    onClick={() => setOpen(false)}
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
