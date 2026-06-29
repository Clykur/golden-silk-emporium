"use client";

import { useQuery } from "@tanstack/react-query";
import { auditLogApi } from "@/lib/api";
import {
  Package,
  ShoppingCart,
  User,
  Star,
  Settings,
  Tag,
  RefreshCcw,
  Activity,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function ActivityFeed() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ["admin-activity-feed"],
    queryFn: () => auditLogApi.list(15),
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden h-full flex flex-col p-5">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const getIcon = (action: string, type: string) => {
    const act = action.toLowerCase();
    const typ = type.toLowerCase();

    if (typ === "order" || act.includes("order")) return <ShoppingCart className="w-4 h-4" />;
    if (typ === "product" || act.includes("product")) return <Package className="w-4 h-4" />;
    if (typ === "customer" || typ === "user") return <User className="w-4 h-4" />;
    if (typ === "review") return <Star className="w-4 h-4" />;
    if (typ === "coupon") return <Tag className="w-4 h-4" />;
    if (act.includes("return")) return <RefreshCcw className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  const getColor = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes("create") || act.includes("new"))
      return "bg-emerald-100 text-emerald-600 border-emerald-200";
    if (act.includes("delete") || act.includes("remove") || act.includes("cancel"))
      return "bg-red-100 text-red-600 border-red-200";
    if (act.includes("update") || act.includes("edit"))
      return "bg-blue-100 text-blue-600 border-blue-200";
    if (act.includes("status")) return "bg-amber-100 text-amber-600 border-amber-200";
    return "bg-gray-100 text-gray-600 border-gray-200";
  };

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden h-full flex flex-col">
      <div className="px-5 py-4 border-b border-border bg-gray-50/50">
        <h3 className="font-semibold text-lg">Activity Feed</h3>
        <p className="text-sm text-muted-foreground">Real-time business operations</p>
      </div>

      <div className="flex-1 overflow-auto p-5 hide-scrollbar">
        <div className="space-y-6 relative">
          {logs?.map((log: any) => (
            <div key={log.id} className="relative flex items-start gap-4">
              <div
                className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 bg-white ${getColor(log.action)}`}
              >
                {getIcon(log.action, log.resource_type)}
              </div>
              <div className="flex-1 min-w-0 pt-1 flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground leading-tight">
                    {log.action}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{log.admin_email}</div>
                </div>
                <div className="text-[10px] text-muted-foreground whitespace-nowrap uppercase tracking-wider shrink-0">
                  {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })
                    .replace("minutes", "mins")
                    .replace("minute", "min")
                    .replace("about ", "")
                    .replace("hours", "hrs")
                    .replace("hour", "hr")}
                </div>
              </div>
            </div>
          ))}
          {(!logs || logs.length === 0) && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No recent activity recorded.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
