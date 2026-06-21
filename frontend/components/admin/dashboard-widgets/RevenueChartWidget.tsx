"use client";

import { useState } from "react";
import { formatINR } from "@/lib/types";
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

interface ChartData {
  date: string;
  revenue: number;
  orders: number;
  profit: number;
}

export function RevenueChartWidget({ data }: { data: ChartData[] }) {
  const [metric, setMetric] = useState<"revenue" | "orders" | "profit">("revenue");

  if (!data || data.length === 0) return null;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const val = payload[0].value;
      return (
        <div className="bg-white border border-border p-3 rounded-lg shadow-lg">
          <p className="font-medium mb-1">{label}</p>
          <p className="text-gold font-bold">
            {metric === "orders" ? `${val} Orders` : formatINR(val)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden h-full flex flex-col">
      <div className="px-5 py-4 border-b border-border flex justify-between items-center bg-gray-50/50">
        <div>
          <h3 className="font-semibold text-lg">Performance</h3>
          <p className="text-sm text-muted-foreground">Historical trends over time</p>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setMetric("revenue")}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${metric === "revenue" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Revenue
          </button>
          <button
            onClick={() => setMetric("orders")}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${metric === "orders" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Orders
          </button>
          <button
            onClick={() => setMetric("profit")}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${metric === "profit" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Profit
          </button>
        </div>
      </div>

      <div className="p-5 flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          {metric === "orders" ? (
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#888" }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#888" }}
                dx={-10}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8f8f8" }} />
              <Bar dataKey="orders" fill="#C6A87C" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          ) : (
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C6A87C" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#C6A87C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#888" }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#888" }}
                dx={-10}
                tickFormatter={(val) => `₹${val >= 1000 ? (val / 1000).toFixed(0) + "k" : val}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey={metric}
                stroke="#C6A87C"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorMetric)"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
