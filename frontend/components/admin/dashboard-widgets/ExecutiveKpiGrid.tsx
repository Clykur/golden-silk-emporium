"use client";

import { formatINR } from "@/lib/types";
import {
  TrendingUp,
  TrendingDown,
  IndianRupee,
  ShoppingBag,
  Users,
  Percent,
  Sparkles,
  Activity,
} from "lucide-react";

interface KpiData {
  revenue: { value: number; change: number };
  orders: { value: number; change: number };
  aov: { value: number; change: number };
  conversion: { value: number; change: number };
  returning: { value: number; change: number };
  profit: { value: number; change: number };
  sparkline: number[];
}

// A simple SVG Sparkline component
function Sparkline({ data, positive = true }: { data: number[]; positive?: boolean }) {
  if (!data || data.length === 0) return null;

  // Create a visually downward trending dataset if the change is negative
  const plotData = positive ? data : [...data].reverse();

  const min = Math.min(...plotData);
  const max = Math.max(...plotData);
  const range = max - min || 1;
  const width = 100;
  const height = 30;

  const points = plotData
    .map((val, i) => {
      const x = (i / (plotData.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  const color = positive ? "#10b981" : "#ef4444"; // emerald vs red

  return (
    <svg
      width="100%"
      height="30"
      viewBox={`0 -5 100 40`}
      preserveAspectRatio="none"
      className="mt-2"
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

function KpiCard({
  title,
  value,
  change,
  icon: Icon,
  sparkline,
  isCurrency = false,
  isPercent = false,
}: {
  title: string;
  value: number;
  change: number;
  icon: any;
  sparkline?: number[];
  isCurrency?: boolean;
  isPercent?: boolean;
}) {
  const isPositive = change >= 0;
  const formattedValue = isCurrency
    ? formatINR(value)
    : isPercent
      ? `${value.toFixed(1)}%`
      : value.toLocaleString();

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm p-5 hover:shadow-md transition-all group">
      <div className="flex justify-between items-start">
        <div className="text-muted-foreground text-sm font-medium">{title}</div>
        <div className="text-muted-foreground transition-colors group-hover:text-foreground">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <div className="text-2xl font-semibold tracking-tight">{formattedValue}</div>
          <div className="flex items-center mt-1 text-xs font-medium">
            <span
              className={`flex items-center ${isPositive ? "text-emerald-600" : "text-red-500"}`}
            >
              {isPositive ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1" />
              )}
              {Math.abs(change).toFixed(1)}%
            </span>
            <span className="text-muted-foreground ml-1 font-normal">vs previous</span>
          </div>
        </div>
      </div>

      {sparkline && <Sparkline data={sparkline} positive={isPositive} />}
    </div>
  );
}

export function ExecutiveKpiGrid({ data }: { data: KpiData }) {
  if (!data) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <KpiCard
        title="Net Revenue"
        value={data.revenue.value}
        change={data.revenue.change}
        icon={IndianRupee}
        sparkline={data.sparkline}
        isCurrency
      />
      <KpiCard
        title="Total Orders"
        value={data.orders.value}
        change={data.orders.change}
        icon={ShoppingBag}
        sparkline={data.sparkline}
      />
      <KpiCard
        title="Average Order Value"
        value={data.aov.value}
        change={data.aov.change}
        icon={Activity}
        sparkline={data.sparkline}
        isCurrency
      />
      <KpiCard
        title="Conversion Rate"
        value={data.conversion.value}
        change={data.conversion.change}
        icon={Percent}
        sparkline={data.sparkline}
        isPercent
      />
      <KpiCard
        title="Returning Customers"
        value={data.returning.value}
        change={data.returning.change}
        icon={Users}
        sparkline={data.sparkline}
        isPercent
      />
      <KpiCard
        title="Est. Net Profit"
        value={data.profit.value}
        change={data.profit.change}
        icon={Sparkles}
        sparkline={data.sparkline}
        isCurrency
      />
    </div>
  );
}
