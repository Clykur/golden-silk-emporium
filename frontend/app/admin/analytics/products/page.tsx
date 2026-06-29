"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, PackageSearch, Tag, TrendingDown } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AnalyticsNav } from "@/components/admin/analytics-nav";
import { adminStatsApi } from "@/lib/api";
import { formatINR } from "@/lib/types";
import Link from "next/link";

const COLORS = ["#C6A87C", "#1F2937", "#9CA3AF", "#D4BA96", "#4B5563", "#6B7280"];

export default function ProductsAnalytics() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-products-analytics"],
    queryFn: adminStatsApi.getProductAnalytics,
  });

  if (isLoading || !stats) {
    return (
      <AdminLayout title="Products & Inventory" subtitle="Merchandise performance intelligence">
        <AnalyticsNav />
        <div className="grid gap-4 sm:grid-cols-2 mb-8">
          {[1, 2].map((i) => (
            <div key={i} className="border border-border p-6 animate-pulse h-64 bg-champagne/5" />
          ))}
        </div>
      </AdminLayout>
    );
  }

  const { productPerformance, categoryPerformance } = stats;

  const topProducts = productPerformance.slice(0, 5);
  const worstProducts = [...productPerformance]
    .filter((p) => p.status === "published" && p.units === 0)
    .slice(0, 5);
  const lowStockProducts = productPerformance.filter(
    (p) => p.stock_quantity <= 5 && p.stock_quantity > 0,
  );
  const outOfStockProducts = productPerformance.filter((p) => p.stock_quantity === 0);

  return (
    <AdminLayout title="Products & Inventory" subtitle="Merchandise performance intelligence">
      <AnalyticsNav />

      {/* Overview stats */}
      <div className="grid gap-4 sm:grid-cols-4 mb-8">
        <div className="border border-border bg-background p-5 hover:border-gold/30 transition-colors">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Total Units Sold
          </p>
          <p className="font-display text-2xl mt-2">{stats.totalItemsSold.toLocaleString()}</p>
        </div>
        <div className="border border-border bg-background p-5 hover:border-gold/30 transition-colors">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Active Products
          </p>
          <p className="font-display text-2xl mt-2">
            {productPerformance.filter((p) => p.status === "published").length}
          </p>
        </div>
        <div className="border border-amber-200 bg-amber-50 p-5 hover:border-amber-300 transition-colors">
          <p className="text-[10px] uppercase tracking-wider text-amber-700">Low Stock Alerts</p>
          <p className="font-display text-2xl mt-2 text-amber-600">{lowStockProducts.length}</p>
        </div>
        <div className="border border-red-200 bg-red-50 p-5 hover:border-red-300 transition-colors">
          <p className="text-[10px] uppercase tracking-wider text-red-700">Out of Stock</p>
          <p className="font-display text-2xl mt-2 text-red-600">{outOfStockProducts.length}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
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
            {categoryPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryPerformance}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="revenue"
                  >
                    {categoryPerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
            ) : (
              <p className="text-sm text-muted-foreground">No data available</p>
            )}
          </div>
          <div className="mt-4 space-y-2">
            {categoryPerformance.slice(0, 3).map((c, i) => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span className="font-medium">{c.name}</span>
                </div>
                <span className="text-muted-foreground">{formatINR(c.revenue)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="border border-border bg-background p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="eyebrow text-[9px]">Best Sellers</p>
              <h2 className="font-display text-lg mt-1">Top Products by Revenue</h2>
            </div>
            <PackageSearch className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="flex-1 overflow-x-auto hide-scrollbar">
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
                {topProducts.map((p) => (
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
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Slow Moving Products */}
        <div className="border border-border bg-background p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="eyebrow text-[9px]">Inventory Alerts</p>
              <h2 className="font-display text-lg mt-1">Dead Stock (Zero Sales)</h2>
            </div>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="overflow-x-auto hide-scrollbar">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left font-medium text-muted-foreground pb-2 px-2">Product</th>
                  <th className="text-right font-medium text-muted-foreground pb-2 px-2">Stock</th>
                  <th className="text-right font-medium text-muted-foreground pb-2 px-2">
                    Value Locked
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {worstProducts.length > 0 ? (
                  worstProducts.map((p) => (
                    <tr key={p.id} className="group hover:bg-muted/50">
                      <td className="py-3 px-2">
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="font-medium hover:text-gold transition-colors"
                        >
                          {p.name}
                        </Link>
                      </td>
                      <td className="py-3 px-2 text-right text-red-600 font-medium">
                        {p.stock_quantity}
                      </td>
                      <td className="py-3 px-2 text-right">
                        {formatINR(p.stock_quantity * p.price)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-muted-foreground text-xs">
                      No dead stock found. Great job!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Warning */}
        <div className="border border-amber-200 bg-amber-50/30 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="eyebrow text-[9px] text-amber-700">Action Required</p>
              <h2 className="font-display text-lg mt-1 text-amber-900">Low Stock Products</h2>
            </div>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          <div className="overflow-x-auto hide-scrollbar">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-amber-200">
                  <th className="text-left font-medium text-amber-800 pb-2 px-2">Product</th>
                  <th className="text-right font-medium text-amber-800 pb-2 px-2">Sales</th>
                  <th className="text-right font-medium text-amber-800 pb-2 px-2">Remaining</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-200/50">
                {lowStockProducts.length > 0 ? (
                  lowStockProducts.slice(0, 5).map((p) => (
                    <tr key={p.id}>
                      <td className="py-3 px-2">
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="font-medium text-amber-900 hover:text-amber-700 transition-colors"
                        >
                          {p.name}
                        </Link>
                      </td>
                      <td className="py-3 px-2 text-right text-amber-800">{p.units} units</td>
                      <td className="py-3 px-2 text-right font-bold text-red-600">
                        {p.stock_quantity}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-amber-700 text-xs">
                      No products are running low on stock.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
