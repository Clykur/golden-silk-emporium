"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Package,
  Heart,
  ShoppingBag,
  Bell,
  ArrowRight,
  MapPin,
  User,
  Sparkles,
  TrendingUp,
  Clock,
  Star,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import { useShop, cartCount } from "@/lib/store";
import { ordersApi, wishlistApi, notificationsApi, productsApi } from "@/lib/api";
import { formatINR } from "@/lib/types";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ProductCard } from "@/components/product-card";

const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  returned: "bg-orange-50 text-orange-700 border-orange-200",
};

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  href,
}: {
  label: string;
  value: string | number;
  icon: any;
  color: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group border border-border bg-background p-5 hover:border-gold/40 hover:shadow-[0_8px_30px_-12px_oklch(0.74_0.078_78/0.3)] transition-all duration-300"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="eyebrow text-[9px] text-muted-foreground">{label}</p>
          <p className="font-display text-2xl mt-2 group-hover:text-gold transition-colors">
            {value}
          </p>
        </div>
        <div className={`p-2 rounded-full bg-champagne/40 ${color} mt-1`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </Link>
  );
}

function QuickAction({
  href,
  icon: Icon,
  label,
  desc,
}: {
  href: string;
  icon: any;
  label: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 border border-border p-4 hover:border-gold/40 hover:bg-champagne/10 transition-all"
    >
      <div className="h-10 w-10 rounded-full bg-gold/10 grid place-items-center text-gold shrink-0 group-hover:bg-gold/20 transition-colors">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">{desc}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-gold group-hover:translate-x-1 transition-all ml-auto shrink-0" />
    </Link>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const cart = useShop((s) => s.cart);
  const wishlist = useShop((s) => s.wishlist);
  const cCount = cartCount(cart);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const history = JSON.parse(localStorage.getItem("drapeva-recent-viewed") || "[]");
      setRecentlyViewed(history.slice(0, 4));
    }
  }, []);

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["dashboard-orders", user?.id],
    queryFn: () => (user ? ordersApi.getUserOrders(user.id) : Promise.resolve([])),
    enabled: !!user,
  });

  const { data: wishlistItems = [] } = useQuery({
    queryKey: ["dashboard-wishlist", user?.id],
    queryFn: () => (user ? wishlistApi.get(user.id) : Promise.resolve([])),
    enabled: !!user,
  });

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["unread-notifications-count", user?.id],
    queryFn: () => (user ? notificationsApi.unreadCount(user.id) : Promise.resolve(0)),
    enabled: !!user,
  });

  const { data: recommended = [], isLoading: recLoading } = useQuery({
    queryKey: ["dashboard-recommended"],
    queryFn: () => productsApi.getFeatured(4),
  });

  const totalSpent = orders
    .filter((o: any) => o.status !== "cancelled")
    .reduce((sum: number, o: any) => sum + (o.total || 0), 0);

  const activeOrders = orders.filter((o: any) =>
    ["pending", "processing", "shipped"].includes(o.status),
  );

  const recentOrders = orders.slice(0, 3);

  // Account completion checklist
  const completionItems = [
    { label: "Email verified", done: !!user?.email },
    { label: "Profile name set", done: !!(user?.name && user.name.trim().length > 0) },
    { label: "Phone number added", done: !!(user as any)?.phone },
    { label: "Delivery address saved", done: (wishlistItems as any[]).length > 0 },
    { label: "First order placed", done: orders.length > 0 },
  ];
  const completionPct = Math.round(
    (completionItems.filter((i) => i.done).length / completionItems.length) * 100,
  );

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      })
    : "Recently";

  return (
    <DashboardLayout title="My Dashboard" subtitle="Welcome back">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden border border-border bg-gradient-to-br from-champagne/60 via-background to-gold/5 p-6 md:p-8">
        <div className="relative z-10">
          <p className="eyebrow text-gold flex items-center gap-2">
            <Sparkles className="h-3 w-3" />
            Patron Atelier
          </p>
          <h2 className="mt-2 font-display text-2xl md:text-3xl">
            Namaste, {user?.name || user?.email?.split("@")[0] || "Valued Patron"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Member since {memberSince} · {user?.role === "admin" ? "Administrator" : "Customer"}{" "}
            Account
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-foreground text-background px-5 py-2.5 text-xs font-medium tracking-[0.2em] uppercase transition-colors hover:bg-gold hover:text-gold-foreground"
            >
              Shop Now <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/account/orders"
              className="inline-flex items-center gap-2 border border-foreground px-5 py-2.5 text-xs font-medium tracking-[0.2em] uppercase transition-colors hover:border-gold hover:text-gold"
            >
              Track Orders
            </Link>
          </div>
        </div>
        {/* Decorative */}
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-gold/5 to-transparent pointer-events-none" />
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Orders"
          value={orders.length}
          icon={Package}
          color="text-gold"
          href="/account/orders"
        />
        <StatCard
          label="Total Spent"
          value={formatINR(totalSpent)}
          icon={TrendingUp}
          color="text-emerald-600"
          href="/account/orders"
        />
        <StatCard
          label="Active Orders"
          value={activeOrders.length}
          icon={Clock}
          color="text-indigo-600"
          href="/account/orders"
        />
        <StatCard
          label="Wishlist Items"
          value={wishlist.length}
          icon={Heart}
          color="text-rose-500"
          href="/account/wishlist"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="font-display text-xl mb-4">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAction
            href="/shop"
            icon={ShoppingBag}
            label="Shop Now"
            desc="Browse our curated saree collections"
          />
          <QuickAction
            href="/account/orders"
            icon={Package}
            label="Track Orders"
            desc={
              activeOrders.length > 0
                ? `${activeOrders.length} order(s) in progress`
                : "View order history"
            }
          />
          <QuickAction
            href="/account/profile"
            icon={User}
            label="Edit Profile"
            desc="Update your personal information"
          />
          <QuickAction
            href="/account/wishlist"
            icon={Heart}
            label="View Wishlist"
            desc={`${wishlist.length} saved item(s)`}
          />
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
          <h2 className="font-display text-xl">Recent Orders</h2>
          <Link
            href="/account/orders"
            className="text-xs uppercase tracking-wider text-muted-foreground hover:text-gold transition-colors flex items-center gap-1"
          >
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {ordersLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse border border-border p-4">
                <div className="h-4 w-1/3 bg-champagne/60 rounded mb-2" />
                <div className="h-3 w-1/2 bg-champagne/40 rounded" />
              </div>
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-border">
            <ShoppingBag className="h-10 w-10 mx-auto text-muted-foreground stroke-1 mb-4" />
            <p className="text-sm text-muted-foreground font-display">No orders placed yet.</p>
            <Link
              href="/shop"
              className="mt-4 inline-block bg-foreground text-background px-6 py-3 text-xs uppercase tracking-widest hover:bg-gold hover:text-gold-foreground transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border border border-border">
            {recentOrders.map((order: any) => (
              <div
                key={order.id}
                className="px-6 py-4 flex flex-wrap justify-between items-center gap-4 hover:bg-champagne/5 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium">
                    Order #{order.id.substring(0, 8).toUpperCase()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(order.created_at).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                    {" · "}
                    {(order.items as any[])?.length || 0} item(s)
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`border px-2 py-0.5 text-[10px] uppercase tracking-wider rounded ${
                      ORDER_STATUS_COLORS[order.status] ||
                      "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    {order.status}
                  </span>
                  <p className="text-sm font-semibold text-gold">{formatINR(order.total)}</p>
                  <Link
                    href="/account/orders"
                    className="text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground border border-border px-3 py-1.5 transition-colors"
                  >
                    Track →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <div>
          <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
            <h2 className="font-display text-xl">Recently Viewed</h2>
            <Link
              href="/account/recently-viewed"
              className="text-xs uppercase tracking-wider text-muted-foreground hover:text-gold transition-colors flex items-center gap-1"
            >
              View History <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            {recentlyViewed.map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Recommended Products */}
      <div>
        <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
          <h2 className="font-display text-xl">Recommended for You</h2>
          <Link
            href="/shop"
            className="text-xs uppercase tracking-wider text-muted-foreground hover:text-gold transition-colors flex items-center gap-1"
          >
            Explore All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {recLoading ? (
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-champagne/40" />
                <div className="mt-3 h-3 w-3/4 bg-champagne/60 rounded" />
                <div className="mt-2 h-3 w-1/2 bg-champagne/40 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            {recommended.map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>

      {/* Wishlist Preview */}
      {wishlistItems.length > 0 && (
        <div>
          <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
            <h2 className="font-display text-xl">Your Wishlist</h2>
            <Link
              href="/account/wishlist"
              className="text-xs uppercase tracking-wider text-muted-foreground hover:text-gold transition-colors flex items-center gap-1"
            >
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            {(wishlistItems as any[]).slice(0, 4).map((item: any) => (
              <ProductCard key={item.product_id} product={item.product} />
            ))}
          </div>
        </div>
      )}

      {/* Account Completion */}
      <div className="border border-border p-6 bg-champagne/5">
        <div className="flex items-start justify-between mb-4 flex-wrap gap-4">
          <div>
            <h2 className="font-display text-xl">Account Setup</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Complete your profile for a better experience
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-display text-2xl text-gold">{completionPct}%</span>
            <span className="text-xs text-muted-foreground">complete</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full bg-border rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-gold/70 to-gold rounded-full transition-all duration-700"
            style={{ width: `${completionPct}%` }}
          />
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {completionItems.map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-xs">
              {item.done ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
              <span className={item.done ? "text-foreground" : "text-muted-foreground"}>
                {item.label}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-3">
          <Link
            href="/account/profile"
            className="text-xs uppercase tracking-wider border-b border-foreground pb-0.5 hover:text-gold hover:border-gold transition-colors"
          >
            Complete Profile
          </Link>
          <Link
            href="/account/addresses"
            className="text-xs uppercase tracking-wider border-b border-foreground pb-0.5 hover:text-gold hover:border-gold transition-colors"
          >
            Add Address
          </Link>
        </div>
      </div>

      {/* Cart Summary */}
      {cCount > 0 && (
        <div className="border border-gold/20 bg-gold/5 p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="eyebrow text-gold text-[9px]">Shopping Bag</p>
              <h2 className="font-display text-xl mt-1">
                {cCount} item{cCount !== 1 ? "s" : ""} in your cart
              </h2>
            </div>
            <Link
              href="/checkout"
              className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 text-xs font-medium tracking-[0.2em] uppercase hover:bg-gold hover:text-gold-foreground transition-colors"
            >
              <ShoppingBag className="h-4 w-4" />
              Checkout Now
            </Link>
          </div>
        </div>
      )}

      {/* Notifications alert */}
      {unreadCount > 0 && (
        <div className="border border-amber-200 bg-amber-50 p-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-800">
              You have {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
            </p>
          </div>
          <Link
            href="/account/notifications"
            className="text-xs uppercase tracking-wider text-amber-700 border-b border-amber-400 hover:text-amber-900 transition-colors"
          >
            View Now
          </Link>
        </div>
      )}
    </DashboardLayout>
  );
}
