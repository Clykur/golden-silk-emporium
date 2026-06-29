"use client";

import { useQuery } from "@tanstack/react-query";
import { Filter, Heart, Repeat, TicketPercent } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AnalyticsNav } from "@/components/admin/analytics-nav";
import { adminStatsApi } from "@/lib/api";
import { formatINR } from "@/lib/types";

const COLORS = ["#C6A87C", "#1F2937", "#9CA3AF", "#D4BA96", "#4B5563"];

export default function MarketingAnalytics() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-marketing-analytics"],
    queryFn: adminStatsApi.getMarketingAnalytics,
  });

  if (isLoading || !stats) {
    return (
      <AdminLayout title="Marketing & Funnel" subtitle="Acquisition and conversion metrics">
        <AnalyticsNav />
        <div className="grid gap-4 sm:grid-cols-2 mb-8">
          {[1, 2].map((i) => (
            <div key={i} className="border border-border p-6 animate-pulse h-64 bg-champagne/5" />
          ))}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Marketing & Funnel" subtitle="Acquisition and conversion metrics">
      <AnalyticsNav />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-4 mb-8">
        <div className="border border-border bg-background p-5 hover:border-gold/30 transition-colors">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Filter className="h-3 w-3" /> Conversion Rate
          </p>
          <p className="font-display text-2xl mt-2">
            {stats.funnel[0].count > 0
              ? ((stats.funnel[4].count / stats.funnel[0].count) * 100).toFixed(1)
              : "0"}
            %
          </p>
        </div>
        <div className="border border-border bg-background p-5 hover:border-gold/30 transition-colors">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Heart className="h-3 w-3 text-rose-500" /> Total Wishlist Items
          </p>
          <p className="font-display text-2xl mt-2">{stats.totalWishlistItems}</p>
        </div>
        <div className="border border-border bg-background p-5 hover:border-gold/30 transition-colors">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <TicketPercent className="h-3 w-3" /> Active Coupons Used
          </p>
          <p className="font-display text-2xl mt-2">{stats.couponStats.length}</p>
        </div>
        <div className="border border-red-200 bg-red-50 p-5 hover:border-red-300 transition-colors">
          <p className="text-[10px] uppercase tracking-wider text-red-700 flex items-center gap-2">
            <Repeat className="h-3 w-3" /> Return Rate
          </p>
          <p className="font-display text-2xl mt-2 text-red-600">{stats.returns.rate}%</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Sales Funnel Chart */}
        <div className="border border-border bg-background p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="eyebrow text-[9px]">Conversion</p>
              <h2 className="font-display text-lg mt-1">E-Commerce Funnel</h2>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.funnel}
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
                  {stats.funnel.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Traffic Sources Chart */}
        <div className="border border-border bg-background p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="eyebrow text-[9px]">Acquisition</p>
              <h2 className="font-display text-lg mt-1">Traffic Sources</h2>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center">
            {stats.trafficSources.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.trafficSources}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {stats.trafficSources.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
            ) : (
              <p className="text-sm text-muted-foreground">No data available</p>
            )}
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs">
            {stats.trafficSources.map((s, i) => (
              <div key={s.name} className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span>{s.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Coupon Usage Table */}
      <div className="border border-border bg-background p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="eyebrow text-[9px]">Promotions</p>
            <h2 className="font-display text-lg mt-1">Coupon Performance</h2>
          </div>
          <TicketPercent className="h-4 w-4 text-gold" />
        </div>
        <div className="overflow-x-auto hide-scrollbar">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left font-medium text-muted-foreground pb-2 px-2">
                  Coupon Code
                </th>
                <th className="text-right font-medium text-muted-foreground pb-2 px-2">
                  Times Used
                </th>
                <th className="text-right font-medium text-muted-foreground pb-2 px-2">
                  Revenue Generated
                </th>
                <th className="text-right font-medium text-muted-foreground pb-2 px-2">
                  Average Order Value
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {stats.couponStats.map((c) => (
                <tr key={c.code} className="group hover:bg-muted/50">
                  <td className="py-3 px-2 font-mono text-emerald-600 font-medium">{c.code}</td>
                  <td className="py-3 px-2 text-right">{c.count}</td>
                  <td className="py-3 px-2 text-right font-medium">{formatINR(c.revenue)}</td>
                  <td className="py-3 px-2 text-right text-muted-foreground">
                    {formatINR(c.revenue / c.count)}
                  </td>
                </tr>
              ))}
              {stats.couponStats.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-muted-foreground text-xs">
                    No coupons have been used in orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
