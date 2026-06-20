"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth-store";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Package,
  MapPin,
  Heart,
  Bell,
  User,
  Shield,
  HelpCircle,
  RotateCcw,
  LogOut,
  Menu,
  X,
  ChevronRight,
  CreditCard,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/account/orders", label: "My Orders", icon: Package },
  { to: "/account/wishlist", label: "Wishlist", icon: Heart },
  { to: "/account/addresses", label: "Saved Addresses", icon: MapPin },
  { to: "/account/returns", label: "Returns & Refunds", icon: RotateCcw },
  { to: "/account/notifications", label: "Notifications", icon: Bell },
  { to: "/account/support", label: "Support Tickets", icon: HelpCircle },
  { to: "/account/profile", label: "Profile", icon: User },
  { to: "/account/security", label: "Security", icon: Shield },
];

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const { user, loading, logout } = useAuth();

  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // Only redirect once loading is complete AND we've confirmed no user
    if (!loading && !user) {
      toast.error("Please sign in to access your account");
      router.push(
        `/login?redirect=${encodeURIComponent(pathname)}&message=${encodeURIComponent("Please sign in to access your account")}`,
      );
    }
  }, [loading, user, pathname, router]);

  // Show spinner while auth is loading OR while we still have a persisted user
  // being confirmed by the auth listener
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out successfully");
    router.push("/");
  };

  const initials = (user.name || user.email).charAt(0).toUpperCase();

  return (
    <div className="container-luxe py-8 md:py-12">
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        {/* Mobile header bar */}
        <div className="flex items-center justify-between lg:hidden border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-gold/10 grid place-items-center text-gold font-display text-base">
              {initials}
            </div>
            <div>
              <p className="font-medium text-sm">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="border border-border p-2 text-muted-foreground hover:text-foreground"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Sidebar */}
        <aside
          className={`${
            mobileOpen ? "block" : "hidden"
          } lg:block border-b border-border pb-6 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-8`}
        >
          {/* Desktop user info */}
          <div className="hidden lg:flex items-center gap-3 pb-6 border-b border-border">
            <div className="h-11 w-11 rounded-full bg-gradient-to-br from-gold/20 to-gold/40 grid place-items-center text-gold font-display text-lg ring-2 ring-gold/20">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>

          <nav className="mt-4 lg:mt-6 space-y-0.5">
            {NAV_ITEMS.map(({ to, label, icon: Icon, exact }) => {
              const isActive = exact
                ? pathname === to
                : pathname === to || pathname.startsWith(to + "/");
              return (
                <Link
                  key={to}
                  href={to}
                  onClick={() => setMobileOpen(false)}
                  className={`group flex items-center justify-between rounded px-3 py-2.5 text-xs uppercase tracking-widest font-medium transition-all ${
                    isActive
                      ? "bg-champagne text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-champagne/40"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </span>
                  {isActive && <ChevronRight className="h-3 w-3 opacity-40" />}
                </Link>
              );
            })}

            <div className="pt-2 mt-2 border-t border-border">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 rounded px-3 py-2.5 text-xs uppercase tracking-widest font-medium text-destructive hover:bg-destructive/5 transition-all text-left"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <main className="min-w-0 space-y-8">
          {title && (
            <div>
              <p className="eyebrow text-gold">{subtitle || "My Account"}</p>
              <h1 className="mt-1 font-display text-3xl md:text-4xl">{title}</h1>
              <span className="gold-divider mt-4 block" />
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
