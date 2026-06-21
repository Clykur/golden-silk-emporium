"use client";

import { useQueries } from "@tanstack/react-query";
import {
  TrendingUp,
  DollarSign,
  Package,
  Users,
  ShoppingBag,
  ArrowUp,
  ArrowDown,
  Percent,
  Tag,
  PackageSearch,
  Crown,
  Repeat,
  AlertTriangle,
} from "lucide-react";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AnalyticsNav } from "@/components/admin/analytics-nav";
import { adminStatsApi } from "@/lib/api";
import { formatINR } from "@/lib/types";
import Link from "next/link";

const COLORS_PREMIUM = ["#C6A87C", "#1F2937", "#9CA3AF", "#D4BA96", "#4B5563", "#6B7280"];

export default function AnalyticsOverview() {
  const results = useQueries({
    queries: [
      { queryKey: ["admin-stats-overview"], queryFn: adminStatsApi.getOverview },
      { queryKey: ["admin-sales-analytics"], queryFn: adminStatsApi.getSalesAnalytics },
      { queryKey: ["admin-products-analytics"], queryFn: adminStatsApi.getProductAnalytics },
      { queryKey: ["admin-customers-analytics"], queryFn: adminStatsApi.getCustomerAnalytics },
      { queryKey: ["admin-marketing-analytics"], queryFn: adminStatsApi.getMarketingAnalytics },
    ],
  });

  const isLoading = results.some((r) => r.isLoading);
  const isError = results.some((r) => r.isError);

  if (isLoading || isError || !results[0].data) {
    return (
      <AdminLayout title="Business Intelligence" subtitle="Platform Overview">
        <AnalyticsNav />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="border border-border p-6 animate-pulse h-28 bg-champagne/5" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-8 mt-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={`chart-${i}`}
              className="border border-border p-6 animate-pulse h-80 bg-champagne/5"
            />
          ))}
        </div>
      </AdminLayout>
    );
  }

  const [
    { data: overview },
    { data: sales },
    { data: products },
    { data: customers },
    { data: marketing },
  ] = results as any;

  const lastMonth = overview.monthlyData[overview.monthlyData.length - 1];
  const prevMonth = overview.monthlyData[overview.monthlyData.length - 2];

  const revenueGrowth =
    prevMonth?.sales > 0
      ? Math.round(((lastMonth.sales - prevMonth.sales) / prevMonth.sales) * 100)
      : 0;

  const ordersGrowth =
    prevMonth?.orders > 0
      ? Math.round(((lastMonth.orders - prevMonth.orders) / prevMonth.orders) * 100)
      : 0;

  const aov = overview.totalOrders > 0 ? overview.totalRevenue / overview.totalOrders : 0;

  const kpiCards = [
    {
      label: "Net Revenue",
      value: formatINR(overview.totalRevenue),
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      sub: `${revenueGrowth >= 0 ? "+" : ""}${revenueGrowth}% vs last month`,
      trend: revenueGrowth >= 0,
    },
    {
      label: "Total Orders",
      value: overview.totalOrders.toLocaleString(),
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-50",
      sub: `${ordersGrowth >= 0 ? "+" : ""}${ordersGrowth}% vs last month`,
      trend: ordersGrowth >= 0,
    },
    {
      label: "Average Order Value",
      value: formatINR(aov),
      icon: TrendingUp,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      sub: "Historical Average",
      trend: null,
    },
    {
      label: "Conversion Rate",
      value:
        marketing?.funnel[0]?.count > 0
          ? ((marketing.funnel[4].count / marketing.funnel[0].count) * 100).toFixed(1) + "%"
          : "0%",
      icon: Percent,
      color: "text-purple-600",
      bg: "bg-purple-50",
      sub: "Estimated from traffic",
      trend: true,
    },
    {
      label: "Total Customers",
      value: customers?.totalCustomers?.toLocaleString() || "0",
      icon: Users,
      color: "text-sky-600",
      bg: "bg-sky-50",
      sub: "Registered accounts",
      trend: null,
    },
    {
      label: "Returning Customers",
      value:
        customers?.totalCustomers > 0
          ? Math.round((customers.returningCustomers / customers.totalCustomers) * 100) + "%"
          : "0%",
      icon: Repeat,
      color: "text-teal-600",
      bg: "bg-teal-50",
      sub: "Made >1 purchase",
      trend: null,
    },
    {
      label: "Active Products",
      value: overview.publishedProducts.toLocaleString(),
      icon: ShoppingBag,
      color: "text-fuchsia-600",
      bg: "bg-fuchsia-50",
      sub: "Currently visible",
      trend: null,
    },
    {
      label: "Inventory Alerts",
      value: (overview.lowStockProducts + overview.outOfStock).toLocaleString(),
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50",
      sub: `${overview.outOfStock} out of stock`,
      trend: false,
    },
  ];

  return (
    <AdminLayout title="Business Intelligence" subtitle="Platform Overview">
      <AnalyticsNav />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {kpiCards.map((kpi) => (
          <div
            key={kpi.label}
            className="border border-border bg-background p-5 hover:border-gold/30 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {kpi.label}
                </p>
                <p className="font-display text-2xl mt-2">{kpi.value}</p>
              </div>
              <div className={`h-9 w-9 rounded-full ${kpi.bg} grid place-items-center`}>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </div>
            {kpi.sub && (
              <p
                className={`text-xs mt-3 flex items-center gap-1 ${
                  kpi.trend === true
                    ? "text-emerald-600"
                    : kpi.trend === false
                      ? "text-red-600"
                      : "text-muted-foreground"
                }`}
              >
                {kpi.trend === true && <ArrowUp className="h-3 w-3" />}
                {kpi.trend === false && <ArrowDown className="h-3 w-3" />}
                {kpi.sub}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Revenue Chart */}
        <div className="border border-border bg-background p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="eyebrow text-[9px]">Revenue Trend</p>
              <h2 className="font-display text-lg mt-1">Monthly Gross Sales</h2>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={overview.monthlyData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C6A87C" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#C6A87C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#737373" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#737373" }}
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: number) => [formatINR(value), "Revenue"]}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e5e5e5",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#C6A87C"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSales)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales Funnel Chart */}
        <div className="border border-border bg-background p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="eyebrow text-[9px]">Conversion</p>
              <h2 className="font-display text-lg mt-1">E-Commerce Funnel</h2>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={marketing?.funnel || []}
                layout="vertical"
                margin={{ top: 0, right: 30, left: 40, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={true}
                  vertical={false}
                  stroke="#e5e5e5"
                />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#737373" }}
                />
                <YAxis
                  dataKey="step"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#737373" }}
                  width={100}
                />
                <Tooltip
                  cursor={{ fill: "#f5f5f5" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e5e5e5",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={30}>
                  {(marketing?.funnel || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        {/* Traffic Sources Chart */}
        <div className="border border-border bg-background p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="eyebrow text-[9px]">Acquisition</p>
              <h2 className="font-display text-lg mt-1">Traffic Sources</h2>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center">
            {marketing?.trafficSources?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={marketing.trafficSources}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {marketing.trafficSources.map((entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS_PREMIUM[index % COLORS_PREMIUM.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`${value} Visitors`, "Traffic"]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e5e5e5",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </div>

        {/* Category Revenue Chart */}
        <div className="border border-border bg-background p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="eyebrow text-[9px]">Distribution</p>
              <h2 className="font-display text-lg mt-1">Revenue by Category</h2>
            </div>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="h-64 flex items-center justify-center">
            {products?.categoryPerformance?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={products.categoryPerformance}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="revenue"
                  >
                    {products.categoryPerformance.map((entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS_PREMIUM[index % COLORS_PREMIUM.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [formatINR(value), "Revenue"]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e5e5e5",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </div>

        {/* Geographic Bar Chart */}
        <div className="border border-border bg-background p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="eyebrow text-[9px]">Geography</p>
              <h2 className="font-display text-lg mt-1">Top Regions</h2>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={customers?.states?.slice(0, 5) || []} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={true}
                  vertical={false}
                  stroke="#e5e5e5"
                />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#737373" }}
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#737373" }}
                  width={90}
                />
                <Tooltip
                  cursor={{ fill: "#f5f5f5" }}
                  formatter={(value: number) => [formatINR(value), "Revenue"]}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e5e5e5",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="revenue" fill="#C6A87C" radius={[0, 4, 4, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Top Products Table */}
        <div className="border border-border bg-background p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="eyebrow text-[9px]">Best Sellers</p>
              <h2 className="font-display text-lg mt-1">Top Products</h2>
            </div>
            <PackageSearch className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left font-medium text-muted-foreground pb-2 px-2">Product</th>
                  <th className="text-right font-medium text-muted-foreground pb-2 px-2">Units</th>
                  <th className="text-right font-medium text-muted-foreground pb-2 px-2">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {(products?.productPerformance?.slice(0, 5) || []).map((p: any) => (
                  <tr key={p.id} className="group hover:bg-muted/50">
                    <td className="py-3 px-2">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="font-medium hover:text-gold transition-colors"
                      >
                        {p.name}
                      </Link>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{p.category}</p>
                    </td>
                    <td className="py-3 px-2 text-right">{p.units}</td>
                    <td className="py-3 px-2 text-right font-medium">{formatINR(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Customers Table */}
        <div className="border border-border bg-background p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="eyebrow text-[9px]">VIP Segment</p>
              <h2 className="font-display text-lg mt-1">Top Customers</h2>
            </div>
            <Crown className="h-4 w-4 text-gold" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left font-medium text-muted-foreground pb-2 px-2">
                    Customer
                  </th>
                  <th className="text-right font-medium text-muted-foreground pb-2 px-2">Orders</th>
                  <th className="text-right font-medium text-muted-foreground pb-2 px-2">Spend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {(customers?.topCustomers?.slice(0, 5) || []).map((c: any) => (
                  <tr key={c.id} className="group hover:bg-muted/50">
                    <td className="py-3 px-2 font-medium">{c.name}</td>
                    <td className="py-3 px-2 text-right">{c.orders}</td>
                    <td className="py-3 px-2 text-right font-medium text-emerald-600">
                      {formatINR(c.spend)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
