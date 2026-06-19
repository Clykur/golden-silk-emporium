import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, DollarSign, Package, Users, ShoppingBag, ArrowUp, ArrowDown } from "lucide-react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { adminStatsApi, productsApi } from "@/lib/api";
import { formatINR } from "@/lib/types";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({
    meta: [{ title: "Analytics — Drapeva Admin" }],
  }),
  component: Analytics,
});

function Analytics() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: adminStatsApi.getOverview,
  });

  const { data: products = [] } = useQuery({
    queryKey: ["admin-products"],
    queryFn: productsApi.adminList,
  });

  if (isLoading || !stats) {
    return (
      <AdminLayout title="Analytics" subtitle="Business overview and performance metrics">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border border-border p-6 animate-pulse h-28 bg-champagne/10" />
          ))}
        </div>
      </AdminLayout>
    );
  }

  const lastMonth = stats.monthlyData[stats.monthlyData.length - 1];
  const prevMonth = stats.monthlyData[stats.monthlyData.length - 2];
  const revenueGrowth = prevMonth?.sales > 0
    ? Math.round(((lastMonth.sales - prevMonth.sales) / prevMonth.sales) * 100)
    : 0;

  const kpiCards = [
    {
      label: "Total Revenue",
      value: formatINR(stats.totalRevenue),
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      sub: `${revenueGrowth >= 0 ? "+" : ""}${revenueGrowth}% vs last month`,
      trend: revenueGrowth >= 0,
    },
    {
      label: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-50",
      sub: `${lastMonth?.orders || 0} this month`,
      trend: null,
    },
    {
      label: "Customers",
      value: stats.totalCustomers.toLocaleString(),
      icon: Users,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      sub: "Registered accounts",
      trend: null,
    },
    {
      label: "Low Stock Items",
      value: stats.lowStockProducts.toLocaleString(),
      icon: ShoppingBag,
      color: "text-amber-600",
      bg: "bg-amber-50",
      sub: `${stats.outOfStock} out of stock`,
      trend: false,
    },
  ];

  const maxSales = Math.max(...stats.monthlyData.map((d) => d.sales), 1);

  return (
    <AdminLayout title="Analytics" subtitle="Business overview and performance metrics">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => (
          <div key={kpi.label} className="border border-border bg-background p-5 hover:border-gold/30 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{kpi.label}</p>
                <p className="font-display text-2xl mt-2">{kpi.value}</p>
              </div>
              <div className={`h-9 w-9 rounded-full ${kpi.bg} grid place-items-center`}>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </div>
            {kpi.sub && (
              <p className={`text-xs mt-3 flex items-center gap-1 ${
                kpi.trend === true ? "text-emerald-600" : kpi.trend === false ? "text-amber-600" : "text-muted-foreground"
              }`}>
                {kpi.trend === true && <ArrowUp className="h-3 w-3" />}
                {kpi.trend === false && <ArrowDown className="h-3 w-3" />}
                {kpi.sub}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="border border-border bg-background p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="eyebrow text-[9px]">Revenue Trend</p>
            <h2 className="font-display text-xl mt-1">Monthly Revenue</h2>
          </div>
          <TrendingUp className="h-5 w-5 text-gold" />
        </div>
        <div className="flex items-end gap-3 h-48">
          {stats.monthlyData.map((month, i) => {
            const height = maxSales > 0 ? Math.max((month.sales / maxSales) * 100, 2) : 2;
            const isLast = i === stats.monthlyData.length - 1;
            return (
              <div key={month.month} className="flex-1 flex flex-col items-center gap-2">
                <div className="flex-1 w-full flex items-end">
                  <div
                    className={`w-full rounded-t transition-all duration-700 ${isLast ? "bg-gold" : "bg-champagne"}`}
                    style={{ height: `${height}%` }}
                    title={`${month.month}: ${formatINR(month.sales)}`}
                  />
                </div>
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{month.month}</p>
                <p className="text-[9px] text-muted-foreground font-mono">
                  {month.sales > 0 ? formatINR(month.sales).replace("₹", "₹") : "—"}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Orders by month */}
      <div className="border border-border bg-background p-6">
        <h2 className="font-display text-xl mb-4 border-b border-border pb-4">Monthly Orders</h2>
        <div className="grid gap-3">
          {stats.monthlyData.map((month, i) => (
            <div key={month.month} className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">{month.month}</span>
              <div className="flex items-center gap-8">
                <span className="text-sm font-medium">{month.orders} orders</span>
                <span className="text-sm text-gold font-display">{formatINR(month.sales)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Product performance */}
      <div className="border border-border bg-background p-6">
        <h2 className="font-display text-xl mb-4 border-b border-border pb-4">Product Inventory Status</h2>
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="border border-border p-4 text-center">
            <p className="font-display text-3xl text-emerald-600">{stats.publishedProducts}</p>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">Published</p>
          </div>
          <div className="border border-amber-200 p-4 text-center bg-amber-50">
            <p className="font-display text-3xl text-amber-600">{stats.lowStockProducts}</p>
            <p className="text-xs uppercase tracking-wider text-amber-600 mt-1">Low Stock (≤5)</p>
          </div>
          <div className="border border-red-200 p-4 text-center bg-red-50">
            <p className="font-display text-3xl text-red-600">{stats.outOfStock}</p>
            <p className="text-xs uppercase tracking-wider text-red-600 mt-1">Out of Stock</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
