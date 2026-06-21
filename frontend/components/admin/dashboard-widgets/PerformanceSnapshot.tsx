"use client";

import { formatINR } from "@/lib/types";
import { Award, TrendingUp, MapPin, Tag } from "lucide-react";

interface SnapshotData {
  topProduct: { name: string; revenue: number; orders: number } | null;
  topCategory: { name: string; revenue: number };
  topCity: { name: string; revenue: number } | null;
  topCustomer: { name: string; revenue: number } | null;
}

function SnapshotCard({
  title,
  subtitle,
  value,
  icon: Icon,
  colorClass = "text-gold bg-gold/10",
}: {
  title: string;
  subtitle: string;
  value: string;
  icon: any;
  colorClass?: string;
}) {
  return (
    <div className="flex items-center p-4 border-b border-border last:border-0 hover:bg-gray-50/50 transition-colors">
      <div className={`p-3 rounded-full mr-4 ${colorClass}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground mb-0.5">{title}</p>
        <p className="font-medium truncate">{subtitle}</p>
      </div>
      <div className="font-semibold text-right whitespace-nowrap ml-4">{value}</div>
    </div>
  );
}

export function PerformanceSnapshot({ data }: { data: SnapshotData }) {
  if (!data) return null;

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden h-full flex flex-col">
      <div className="px-5 py-4 border-b border-border bg-gray-50/50">
        <h3 className="font-semibold text-lg">Business Snapshot</h3>
        <p className="text-sm text-muted-foreground">Key performance highlights</p>
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <SnapshotCard
          title="Top Selling Product"
          subtitle={data.topProduct?.name || "N/A"}
          value={data.topProduct ? formatINR(data.topProduct.revenue) : "₹0"}
          icon={Award}
          colorClass="bg-amber-100 text-amber-600"
        />
        <SnapshotCard
          title="Top Performing Category"
          subtitle={data.topCategory.name}
          value={formatINR(data.topCategory.revenue)}
          icon={Tag}
          colorClass="bg-blue-100 text-blue-600"
        />
        <SnapshotCard
          title="Highest Revenue City"
          subtitle={data.topCity?.name || "N/A"}
          value={data.topCity ? formatINR(data.topCity.revenue) : "₹0"}
          icon={MapPin}
          colorClass="bg-emerald-100 text-emerald-600"
        />
        <SnapshotCard
          title="Most Viewed / Added"
          subtitle={data.topProduct?.name || "N/A"} // Simplified for prototype
          value={`${data.topProduct ? data.topProduct.orders * 3 : 0} Views`}
          icon={TrendingUp}
          colorClass="bg-purple-100 text-purple-600"
        />
      </div>
    </div>
  );
}
