"use client";

import { formatINR } from "@/lib/types";
import { Map, Navigation } from "lucide-react";

interface GeoLocation {
  city: string;
  revenue: number;
  orders: number;
}

export function GeographicHeatmap({ data }: { data: GeoLocation[] }) {
  if (!data || data.length === 0) return null;

  const maxRevenue = Math.max(...data.map((d) => d.revenue));

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden h-full flex flex-col">
      <div className="px-5 py-4 border-b border-border bg-gray-50/50">
        <h3 className="font-semibold text-lg">Regional Performance</h3>
        <p className="text-sm text-muted-foreground">Revenue by city</p>
      </div>

      <div className="p-5 flex-1 overflow-auto hide-scrollbar">
        <div className="space-y-4">
          {data.slice(0, 7).map((loc, i) => {
            const width = Math.max((loc.revenue / maxRevenue) * 100, 5);
            return (
              <div key={loc.city} className="relative">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium flex items-center">
                    <Navigation className="w-3 h-3 mr-1.5 text-muted-foreground" />
                    {loc.city}
                  </span>
                  <span className="font-bold">{formatINR(loc.revenue)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gold rounded-full" style={{ width: `${width}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground w-16 text-right">
                    {loc.orders} orders
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
