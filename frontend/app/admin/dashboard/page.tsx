"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Combobox } from "@/components/combobox";
import { adminStatsApi } from "@/lib/api";
import { Calendar } from "lucide-react";

// Import Widgets
import { ExecutiveKpiGrid } from "@/components/admin/dashboard-widgets/ExecutiveKpiGrid";
import { ActionCenter } from "@/components/admin/dashboard-widgets/ActionCenter";
import { RevenueChartWidget } from "@/components/admin/dashboard-widgets/RevenueChartWidget";
import { PerformanceSnapshot } from "@/components/admin/dashboard-widgets/PerformanceSnapshot";
import { InventoryIntelligence } from "@/components/admin/dashboard-widgets/InventoryIntelligence";
import { SalesFunnelWidget } from "@/components/admin/dashboard-widgets/SalesFunnelWidget";
import { TopProductsTable } from "@/components/admin/dashboard-widgets/TopProductsTable";
import { GeographicHeatmap } from "@/components/admin/dashboard-widgets/GeographicHeatmap";
import { RecentOrdersFeed } from "@/components/admin/dashboard-widgets/RecentOrdersFeed";
import { ActivityFeed } from "@/components/admin/dashboard-widgets/ActivityFeed";

export default function AdminDashboard() {
  const [dateRange, setDateRange] = useState("30d");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["admin-command-center", dateRange, customStartDate, customEndDate],
    queryFn: () =>
      adminStatsApi.getCommandCenterData({
        dateRange,
        startDate: customStartDate,
        endDate: customEndDate,
      }),
    refetchInterval: 60000,
  });

  const dateRangeOptions = [
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "7d", label: "Last 7 Days" },
    { value: "30d", label: "Last 30 Days" },
    { value: "90d", label: "Last 90 Days" },
    { value: "all", label: "All Time" },
    { value: "custom", label: "Custom Range" },
  ];

  const dateRangeAction = (
    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
      {dateRange === "custom" && (
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-border">
          <input
            type="date"
            value={customStartDate}
            onChange={(e) => setCustomStartDate(e.target.value)}
            className="text-xs text-foreground bg-transparent border-0 focus:ring-0 focus:outline-none"
          />
          <span className="text-muted-foreground text-xs font-medium">to</span>
          <input
            type="date"
            value={customEndDate}
            onChange={(e) => setCustomEndDate(e.target.value)}
            className="text-xs text-foreground bg-transparent border-0 focus:ring-0 focus:outline-none"
          />
        </div>
      )}
      <div className="flex items-center gap-2 bg-white p-1 rounded-xl w-48 border border-border">
        <Calendar className="w-4 h-4 text-muted-foreground shrink-0 ml-2" />
        <Combobox
          options={dateRangeOptions}
          value={dateRange}
          onChange={setDateRange}
          className="border-0 shadow-none bg-transparent flex-1"
        />
      </div>
    </div>
  );

  return (
    <AdminLayout title="Dashboard" actions={dateRangeAction}>
      <div className="relative min-h-[400px]">
        {isLoading ? (
          /* SKELETON LOADER GRID */
          <div className="space-y-6">
            <div className="grid grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-[120px] bg-gray-100 animate-pulse rounded-xl"></div>
              ))}
            </div>
            <div className="h-[200px] bg-gray-100 animate-pulse rounded-xl"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-[400px] bg-gray-100 animate-pulse rounded-xl"></div>
              <div className="h-[400px] bg-gray-100 animate-pulse rounded-xl"></div>
            </div>
          </div>
        ) : data ? (
          /* REAL DASHBOARD GRID */
          <div
            className={`space-y-6 transition-opacity duration-200 ${isFetching ? "opacity-60 pointer-events-none" : ""}`}
          >
            {isFetching && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/20 backdrop-blur-[1px]">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
              </div>
            )}
            {/* SECTION 1: Executive KPIs */}
            <ExecutiveKpiGrid data={data.kpi} />

            {/* SECTION 2: Action Center */}
            <ActionCenter data={data.actionCenter} />

            {/* SECTION 3 & 4: Charts and Snapshot */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RevenueChartWidget data={data.performanceChart} />
              </div>
              <div>
                <PerformanceSnapshot data={data.snapshot} />
              </div>
            </div>

            {/* SECTION 5 & 6: Inventory & Funnel */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <InventoryIntelligence data={data.inventory} />
              <SalesFunnelWidget data={data.funnel} />
            </div>

            {/* SECTION 7 & 8: Products & Geography */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <TopProductsTable data={data.topProducts} />
              </div>
              <div>
                <GeographicHeatmap data={data.geoLocations} />
              </div>
            </div>

            {/* SECTION 9 & 10: Orders & Activity Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RecentOrdersFeed orders={data.recentOrders} />
              </div>
              <div>
                <ActivityFeed />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
}
