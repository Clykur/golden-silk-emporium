import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Package, MapPin, Heart, ShoppingBag, TrendingUp, Clock } from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import { ordersApi, wishlistApi } from "@/lib/api";
import { formatINR } from "@/lib/types";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: [
      { title: "My Account — Drapeva" },
      { name: "description", content: "Your Drapeva profile, orders, and account details." },
    ],
  }),
  component: Dashboard,
});

const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  returned: "bg-orange-50 text-orange-700 border-orange-200",
};

function Dashboard() {
  const { user } = useAuth();

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["my-orders", user?.id],
    queryFn: () => user ? ordersApi.getUserOrders(user.id) : Promise.resolve([]),
    enabled: !!user,
  });

  const { data: wishlist = [] } = useQuery({
    queryKey: ["my-wishlist", user?.id],
    queryFn: () => user ? wishlistApi.get(user.id) : Promise.resolve([]),
    enabled: !!user,
  });

  const totalSpent = orders
    .filter((o: any) => o.status !== "cancelled")
    .reduce((sum: number, o: any) => sum + (o.total || 0), 0);

  const activeOrders = orders.filter((o: any) =>
    ["pending", "processing", "shipped"].includes(o.status)
  ).length;

  const recentOrders = orders.slice(0, 3);

  const stats = [
    { label: "Total Orders", value: orders.length.toString(), icon: Package, color: "text-gold" },
    { label: "Total Spent", value: formatINR(totalSpent), icon: TrendingUp, color: "text-emerald-600" },
    { label: "Active Orders", value: activeOrders.toString(), icon: Clock, color: "text-indigo-600" },
    { label: "Wishlist Items", value: wishlist.length.toString(), icon: Heart, color: "text-rose-500" },
  ];

  return (
    <DashboardLayout title="Account Overview" subtitle="Dashboard">
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="border border-border bg-champagne/10 p-5 hover:border-gold/30 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <p className="eyebrow text-[9px] text-muted-foreground">{stat.label}</p>
                <p className="font-display text-2xl mt-2">{stat.value}</p>
              </div>
              <stat.icon className={`h-5 w-5 ${stat.color} mt-1`} />
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="border border-border p-6 bg-champagne/10">
          <h2 className="font-display text-lg mb-2">Default Delivery</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Manage your delivery addresses for faster checkout.
          </p>
          <Link
            to="/dashboard/addresses"
            className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-wider border-b border-foreground pb-0.5 hover:text-gold hover:border-gold transition-colors"
          >
            <MapPin className="h-3.5 w-3.5" />
            Manage Addresses
          </Link>
        </div>

        <div className="border border-border p-6 bg-champagne/10 flex flex-col justify-between">
          <div>
            <h2 className="font-display text-lg mb-2">Concierge Consultation</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Need bridal styling advice? Book a personal consultation.
            </p>
          </div>
          <Link
            to="/book-appointment"
            className="mt-4 inline-block bg-foreground text-background py-3 text-center text-xs uppercase tracking-widest font-medium transition-colors hover:bg-gold hover:text-gold-foreground"
          >
            Schedule Appointment
          </Link>
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="font-display text-xl">Recent Orders</h2>
          <Link
            to="/dashboard/orders"
            className="text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground border-b border-muted-foreground pb-0.5"
          >
            View All →
          </Link>
        </div>

        {ordersLoading ? (
          <p className="text-sm text-muted-foreground py-8 animate-pulse">Loading orders...</p>
        ) : recentOrders.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-border mt-4">
            <ShoppingBag className="h-10 w-10 mx-auto text-muted-foreground stroke-1 mb-4" />
            <p className="text-sm text-muted-foreground font-display">
              No orders placed yet.
            </p>
            <Link
              to="/shop"
              search={{ category: "all" }}
              className="mt-4 inline-block bg-foreground text-background px-6 py-3 text-xs uppercase tracking-widest"
            >
              Shop the Collections
            </Link>
          </div>
        ) : (
          <div className="mt-4 divide-y divide-border border border-border">
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
                    {new Date(order.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    {" · "}
                    {(order.items as any[])?.length || 0} item(s)
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`border px-2 py-0.5 text-[10px] uppercase tracking-wider rounded ${ORDER_STATUS_COLORS[order.status] || "bg-muted text-muted-foreground border-border"}`}>
                    {order.status}
                  </span>
                  <p className="text-sm font-semibold text-gold">{formatINR(order.total)}</p>
                  <Link
                    to="/dashboard/orders"
                    className="text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground border border-border px-3 py-1.5"
                  >
                    Track →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
