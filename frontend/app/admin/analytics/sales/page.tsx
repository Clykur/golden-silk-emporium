"use client";

import { useQuery } from "@tanstack/react-query";
import { DollarSign, Package, TrendingUp } from "lucide-react";
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
import { AnalyticsNav } from "@/components/admin/analytics-nav";
import { adminStatsApi } from "@/lib/api";
import { formatINR } from "@/lib/types";

export default function SalesAnalytics() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-sales-analytics"],
    queryFn: adminStatsApi.getSalesAnalytics,
  });

  if (isLoading || !stats) {
    return (
      <AdminLayout title="Sales Analytics" subtitle="Detailed sales and revenue metrics">
        <AnalyticsNav />
        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-border p-6 animate-pulse h-28 bg-champagne/5" />
          ))}
        </div>
      </AdminLayout>
    );
  }

  const kpiCards = [
    {
      label: "All Time Revenue",
      value: formatINR(stats.totalRevenue),
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "All Time Orders",
      value: stats.totalOrders.toLocaleString(),
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Average Order Value",
      value: formatINR(stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0),
      icon: TrendingUp,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
  ];

  return (
    <AdminLayout title="Sales Analytics" subtitle="Detailed sales and revenue metrics">
      <AnalyticsNav />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
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
          </div>
        ))}
      </div>

      {/* Revenue Trend Over Time */}
      <div className="border border-border bg-background p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="eyebrow text-[9px]">Historical Trend</p>
            <h2 className="font-display text-lg mt-1">Revenue Over Time</h2>
          </div>
        </div>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.monthlyTrends}>
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

      {/* Orders Trend */}
      <div className="border border-border bg-background p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="eyebrow text-[9px]">Historical Trend</p>
            <h2 className="font-display text-lg mt-1">Orders Over Time</h2>
          </div>
        </div>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#737373" }}
                dy={10}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#737373" }} />
              <Tooltip
                cursor={{ fill: "#f5f5f5" }}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e5e5e5",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="orders" fill="#1F2937" radius={[4, 4, 0, 0]} maxBarSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AdminLayout>
  );
}
