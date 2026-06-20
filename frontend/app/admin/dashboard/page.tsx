"use client";

import Link from "next/link";
import { useRouter, usePathname, useSearchParams, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { AdminLayout } from "@/components/admin/admin-layout";
import { adminStatsApi } from "@/lib/api";
import { formatINR } from "@/lib/types";
import { ShoppingBag, Users, DollarSign, Package, TrendingUp, AlertTriangle } from "lucide-react";

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color = "gold",
}: {
  label: string;
  value: string;
  sub: string;
  icon: any;
  color?: string;
}) {
  return (
    <div className="border border-border bg-background p-6 hover-lift shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="eyebrow text-[9px] text-muted-foreground">{label}</p>
          <p className="font-display text-2xl mt-3">{value}</p>
          <p className="text-[10px] text-muted-foreground mt-1.5">{sub}</p>
        </div>
        <div className={`h-9 w-9 rounded bg-${color}/10 grid place-items-center`}>
          <Icon className={`h-4 w-4 text-${color}`} />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: adminStatsApi.getOverview,
    refetchInterval: 60000, // refresh every minute
  });

  if (isLoading || !stats) {
    return (
      <AdminLayout title="Dashboard" subtitle="Store overview and analytics">
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
        </div>
      </AdminLayout>
    );
  }

  const recentRevenue = stats.monthlyData[stats.monthlyData.length - 1]?.sales || 0;
  const prevRevenue = stats.monthlyData[stats.monthlyData.length - 2]?.sales || 0;
  const revenueChange =
    prevRevenue > 0 ? (((recentRevenue - prevRevenue) / prevRevenue) * 100).toFixed(1) : "0";

  return (
    <AdminLayout title="Dashboard" subtitle="Real-time store performance">
      <div className="space-y-8">
        {/* Stats */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Revenue"
            value={formatINR(stats.totalRevenue)}
            sub={`${revenueChange}% from last month`}
            icon={DollarSign}
          />
          <StatCard
            label="Total Orders"
            value={stats.totalOrders.toLocaleString()}
            sub="All time orders"
            icon={ShoppingBag}
          />
          <StatCard
            label="Active Products"
            value={stats.publishedProducts.toLocaleString()}
            sub={`${stats.outOfStock} out of stock`}
            icon={Package}
            color="emerald-600"
          />
          <StatCard
            label="Customers"
            value={stats.totalCustomers.toLocaleString()}
            sub="Registered accounts"
            icon={Users}
          />
        </div>

        {/* Alerts */}
        {(stats.lowStockProducts > 0 || stats.outOfStock > 0) && (
          <div className="flex items-center gap-3 border border-amber-200 bg-amber-50 px-5 py-4 rounded text-sm">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <span className="text-amber-800">
              {stats.outOfStock > 0 && <strong>{stats.outOfStock} products out of stock. </strong>}
              {stats.lowStockProducts > 0 && (
                <>{stats.lowStockProducts} products with low stock (≤5 units).</>
              )}{" "}
              <a href="/admin/inventory" className="underline font-medium">
                Manage inventory →
              </a>
            </span>
          </div>
        )}

        {/* Charts row */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Revenue chart */}
          <div className="lg:col-span-2 border border-border bg-background p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-lg">Revenue Trend</h2>
                <p className="text-xs text-muted-foreground mt-1">Last 6 months</p>
              </div>
              <TrendingUp className="h-5 w-5 text-gold" />
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={stats.monthlyData}
                  margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9e4db" />
                  <XAxis dataKey="month" stroke="#8c7853" fontSize={10} tickLine={false} />
                  <YAxis
                    stroke="#8c7853"
                    fontSize={10}
                    tickLine={false}
                    tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
                  />
                  <Tooltip
                    formatter={(v: any) => [formatINR(v), "Revenue"]}
                    labelStyle={{ fontSize: 11 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#d4af37"
                    strokeWidth={2}
                    fill="url(#revenueGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Orders chart */}
          <div className="border border-border bg-background p-6">
            <div className="mb-6">
              <h2 className="font-display text-lg">Orders</h2>
              <p className="text-xs text-muted-foreground mt-1">Last 6 months</p>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.monthlyData}
                  margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9e4db" vertical={false} />
                  <XAxis dataKey="month" stroke="#8c7853" fontSize={10} tickLine={false} />
                  <YAxis stroke="#8c7853" fontSize={10} tickLine={false} />
                  <Tooltip formatter={(v: any) => [v, "Orders"]} labelStyle={{ fontSize: 11 }} />
                  <Bar dataKey="orders" fill="#d4af37" radius={[2, 2, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Add New Product",
              href: "/admin/products",
              desc: "Publish to store instantly",
              icon: ShoppingBag,
            },
            {
              label: "Manage Orders",
              href: "/admin/orders",
              desc: "Update statuses & tracking",
              icon: Package,
            },
            {
              label: "Review Moderation",
              href: "/admin/reviews",
              desc: "Approve customer reviews",
              icon: Users,
            },
            {
              label: "Create Coupon",
              href: "/admin/coupons",
              desc: "Launch discount campaigns",
              icon: DollarSign,
            },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="group border border-border p-5 hover:border-gold hover:bg-gold/5 transition-all"
            >
              <item.icon className="h-5 w-5 text-gold mb-3" />
              <p className="font-semibold text-sm group-hover:text-gold transition-colors">
                {item.label}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
