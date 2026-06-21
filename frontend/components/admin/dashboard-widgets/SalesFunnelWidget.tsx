"use client";

import { Users, Eye, ShoppingCart, CreditCard, CheckCircle } from "lucide-react";

interface FunnelStep {
  step: string;
  count: number;
}

export function SalesFunnelWidget({ data }: { data: FunnelStep[] }) {
  if (!data || data.length === 0) return null;

  const maxCount = Math.max(...data.map((d) => d.count));

  const icons = [
    <Users key="1" className="w-4 h-4" />,
    <Eye key="2" className="w-4 h-4" />,
    <ShoppingCart key="3" className="w-4 h-4" />,
    <CreditCard key="4" className="w-4 h-4" />,
    <CheckCircle key="5" className="w-4 h-4" />,
  ];

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden h-full flex flex-col">
      <div className="px-5 py-4 border-b border-border bg-gray-50/50">
        <h3 className="font-semibold text-lg">Sales Funnel</h3>
        <p className="text-sm text-muted-foreground">Customer journey conversion</p>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-center gap-4">
        {data.map((item, i) => {
          const width = Math.max((item.count / maxCount) * 100, 5); // min 5% width for visibility
          const previousCount = i > 0 ? data[i - 1].count : maxCount;
          const dropoff =
            previousCount > 0 ? ((previousCount - item.count) / previousCount) * 100 : 0;

          return (
            <div key={item.step} className="relative">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium flex items-center gap-2">
                  <span className="text-muted-foreground">{icons[i]}</span>
                  {item.step}
                </span>
                <span className="font-bold">{item.count.toLocaleString()}</span>
              </div>

              <div className="h-6 w-full bg-gray-100 rounded-full overflow-hidden flex items-center relative">
                <div
                  className="h-full bg-gold transition-all duration-1000 ease-out flex items-center pl-3"
                  style={{ width: `${width}%` }}
                >
                  <div className="absolute right-3 text-xs font-semibold mix-blend-difference text-white">
                    {i === 0 ? "100%" : `${((item.count / maxCount) * 100).toFixed(1)}%`}
                  </div>
                </div>
              </div>

              {i > 0 && dropoff > 0 && (
                <div className="absolute right-0 -top-4 text-[10px] text-red-500 font-medium">
                  -{dropoff.toFixed(1)}% drop
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
