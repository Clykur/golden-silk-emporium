"use client";

import { useQuery } from "@tanstack/react-query";
import { MapPin, Users, Crown, RefreshCcw } from "lucide-react";
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

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899"];

export default function CustomersAnalytics() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-customers-analytics"],
    queryFn: adminStatsApi.getCustomerAnalytics,
  });

  if (isLoading || !stats) {
    return (
      <AdminLayout title="Customers & Geography" subtitle="Audience demographic intelligence">
        <AnalyticsNav />
        <div className="grid gap-4 sm:grid-cols-2 mb-8">
          {[1, 2].map((i) => (
            <div key={i} className="border border-border p-6 animate-pulse h-64 bg-champagne/5" />
          ))}
        </div>
      </AdminLayout>
    );
  }

  const repeatRate =
    stats.totalCustomers > 0
      ? Math.round((stats.returningCustomers / stats.totalCustomers) * 100)
      : 0;

  const newVsReturning = [
    { name: "New Customers", value: stats.totalCustomers - stats.returningCustomers },
    { name: "Returning Customers", value: stats.returningCustomers },
  ];

  return (
    <AdminLayout title="Customers & Geography" subtitle="Audience demographic intelligence">
      <AnalyticsNav />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-4 mb-8">
        <div className="border border-border bg-background p-5">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Users className="h-3 w-3" /> Total Customers
          </p>
          <p className="font-display text-2xl mt-2">{stats.totalCustomers}</p>
        </div>
        <div className="border border-border bg-background p-5">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <RefreshCcw className="h-3 w-3" /> Repeat Purchase Rate
          </p>
          <p className="font-display text-2xl mt-2">{repeatRate}%</p>
        </div>
        <div className="border border-border bg-background p-5">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <MapPin className="h-3 w-3" /> Top State
          </p>
          <p className="font-display text-xl mt-2 truncate">{stats.states[0]?.name || "N/A"}</p>
        </div>
        <div className="border border-border bg-background p-5">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <MapPin className="h-3 w-3" /> Top City
          </p>
          <p className="font-display text-xl mt-2 truncate">{stats.cities[0]?.name || "N/A"}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Retention Chart */}
        <div className="border border-border bg-background p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="eyebrow text-[9px]">Retention</p>
              <h2 className="font-display text-lg mt-1">New vs Returning</h2>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center">
            {stats.totalCustomers > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={newVsReturning}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#1F2937" />
                    <Cell fill="#C6A87C" />
                  </Pie>
                  <Tooltip
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
          <div className="mt-4 flex justify-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#1F2937]" />
              <span>New</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#C6A87C]" />
              <span>Returning</span>
            </div>
          </div>
        </div>

        {/* Geographic Bar Chart */}
        <div className="border border-border bg-background p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="eyebrow text-[9px]">Geography</p>
              <h2 className="font-display text-lg mt-1">Revenue by State</h2>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.states.slice(0, 5)} layout="vertical">
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
                  width={100}
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
                <Bar dataKey="revenue" fill="#C6A87C" radius={[0, 4, 4, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Customers Table */}
      <div className="border border-border bg-background p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="eyebrow text-[9px]">VIP Segment</p>
            <h2 className="font-display text-lg mt-1">Top Customers by Spend</h2>
          </div>
          <Crown className="h-4 w-4 text-gold" />
        </div>
        <div className="overflow-x-auto hide-scrollbar">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left font-medium text-muted-foreground pb-2 px-2">Customer</th>
                <th className="text-right font-medium text-muted-foreground pb-2 px-2">Orders</th>
                <th className="text-right font-medium text-muted-foreground pb-2 px-2">
                  Total Spend
                </th>
                <th className="text-right font-medium text-muted-foreground pb-2 px-2">
                  Last Purchase
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {stats.topCustomers.map((c) => (
                <tr key={c.id} className="group hover:bg-muted/50">
                  <td className="py-3 px-2 font-medium">{c.name}</td>
                  <td className="py-3 px-2 text-right">{c.orders}</td>
                  <td className="py-3 px-2 text-right font-medium text-emerald-600">
                    {formatINR(c.spend)}
                  </td>
                  <td className="py-3 px-2 text-right text-muted-foreground text-xs">
                    {c.last_purchase ? new Date(c.last_purchase).toLocaleDateString() : "Never"}
                  </td>
                </tr>
              ))}
              {stats.topCustomers.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-muted-foreground text-xs">
                    No customer data available yet.
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
