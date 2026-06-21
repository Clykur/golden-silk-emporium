"use client";

import Link from "next/link";
import {
  Package,
  AlertTriangle,
  XCircle,
  ShoppingCart,
  MessageSquareWarning,
  Headset,
  ArrowRight,
} from "lucide-react";

interface ActionData {
  pendingOrders: number;
  lowStock: number;
  outOfStock: number;
  abandonedCarts: number;
  pendingReviews: number;
  unreadSupport: number;
}

function ActionCard({
  title,
  count,
  icon: Icon,
  href,
  urgent = false,
  colorClass = "text-gold bg-gold/10",
}: {
  title: string;
  count: number;
  icon: any;
  href: string;
  urgent?: boolean;
  colorClass?: string;
}) {
  return (
    <Link
      href={href}
      className={`relative flex items-center p-4 rounded-xl border transition-all ${
        urgent && count > 0
          ? "border-red-200 bg-red-50/50 hover:bg-red-50"
          : "border-border bg-white hover:border-gold/30 hover:shadow-md"
      }`}
    >
      <div
        className={`p-3 rounded-full mr-4 ${urgent && count > 0 ? "bg-red-100 text-red-600" : colorClass}`}
      >
        <Icon className="w-5 h-5" />
      </div>

      <div className="flex-1">
        <div className="text-2xl font-semibold tracking-tight">{count}</div>
        <div
          className={`text-sm font-medium ${urgent && count > 0 ? "text-red-600" : "text-muted-foreground"}`}
        >
          {title}
        </div>
      </div>

      <ArrowRight className={`w-4 h-4 opacity-50 ${urgent && count > 0 ? "text-red-500" : ""}`} />
    </Link>
  );
}

export function ActionCenter({ data }: { data: ActionData }) {
  if (!data) return null;

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-border bg-gray-50/50">
        <h3 className="font-semibold text-lg">Action Center</h3>
        <p className="text-sm text-muted-foreground">Items requiring your immediate attention</p>
      </div>

      <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ActionCard
          title="Orders to Fulfill"
          count={data.pendingOrders}
          icon={Package}
          href="/admin/orders?status=processing"
          urgent={true}
        />
        <ActionCard
          title="Out of Stock"
          count={data.outOfStock}
          icon={XCircle}
          href="/admin/products?status=out_of_stock"
          urgent={true}
        />
        <ActionCard
          title="Low Stock Items"
          count={data.lowStock}
          icon={AlertTriangle}
          href="/admin/products?status=low_stock"
          colorClass="bg-amber-100 text-amber-600"
        />
        <ActionCard
          title="Pending Reviews"
          count={data.pendingReviews}
          icon={MessageSquareWarning}
          href="/admin/reviews?status=pending"
          colorClass="bg-blue-100 text-blue-600"
        />
        <ActionCard
          title="Unread Support"
          count={data.unreadSupport}
          icon={Headset}
          href="/admin/support"
          urgent={true}
        />
        <ActionCard
          title="Abandoned Carts"
          count={data.abandonedCarts}
          icon={ShoppingCart}
          href="/admin/analytics"
          colorClass="bg-purple-100 text-purple-600"
        />
      </div>
    </div>
  );
}
