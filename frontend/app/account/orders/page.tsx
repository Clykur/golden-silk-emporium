"use client";

import Link from "next/link";
import { useRouter, usePathname, useSearchParams, useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Package,
  Download,
  X,
  CheckCircle,
  Truck,
  RefreshCw,
  Clock,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import { ordersApi, collectionsApi } from "@/lib/api";
import { formatINR } from "@/lib/types";
import type { DbOrder, OrderStatus } from "@/lib/types";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useShop } from "@/lib/store";

const STATUS_STEPS: { key: OrderStatus; label: string; icon: any }[] = [
  { key: "pending", label: "Order Placed", icon: Clock },
  { key: "processing", label: "Processing", icon: RefreshCw },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  returned: "bg-orange-50 text-orange-700 border-orange-200",
};

const STEP_ORDER = ["pending", "processing", "shipped", "delivered"];

function getStepIndex(status: string) {
  return STEP_ORDER.indexOf(status);
}

function OrderTracker({ status }: { status: string }) {
  const current = getStepIndex(status);
  if (status === "cancelled" || status === "returned") {
    return (
      <div className="flex items-center gap-2 py-2">
        <XCircle className="h-5 w-5 text-red-500" />
        <span className="text-sm text-red-600 font-medium capitalize">{status}</span>
      </div>
    );
  }
  return (
    <div className="relative max-w-2xl pt-2">
      <div className="flex items-center justify-between gap-2">
        {STATUS_STEPS.map((step, i) => {
          const done = i <= current;
          const active = i === current;
          return (
            <div key={step.key} className="flex flex-col items-center gap-2 flex-1 relative z-10">
              <div
                className={`h-8 w-8 rounded-full border-2 grid place-items-center transition-all bg-background ${
                  done ? "border-gold text-gold" : "border-border text-muted-foreground/50"
                } ${active ? "ring-4 ring-gold/10 ring-offset-0 bg-gold text-gold-foreground" : ""}`}
              >
                <step.icon className={`h-4 w-4 ${active && "text-gold-foreground"}`} />
              </div>
              <span
                className={`text-[10px] uppercase tracking-wider text-center leading-tight ${done ? "text-foreground font-medium" : "text-muted-foreground/50"}`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      {/* Connecting line */}
      <div className="absolute top-6 left-[12.5%] right-[12.5%] h-[2px] bg-border z-0">
        <div
          className="h-full bg-gold transition-all duration-700"
          style={{ width: current <= 0 ? "0%" : `${(current / (STATUS_STEPS.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
}

function OrderCard({
  order,
  onExpand,
  expanded,
}: {
  order: DbOrder;
  onExpand: () => void;
  expanded: boolean;
}) {
  const qc = useQueryClient();
  const { addToCart } = useShop();
  const router = useRouter();

  const handleReorder = () => {
    try {
      (order.items as any[]).forEach((item: any) => {
        const product = {
          id: item.product_id,
          name: item.product_name,
          image: item.product_image,
          slug: item.product_slug,
          price: item.price,
          sale_price: null,
          compare_at: null,
          inStock: true,
          stock_quantity: 10,
          details: [],
          tags: [],
          gallery: [item.product_image],
          category: null,
          collection: null,
        } as any;
        addToCart(product, item.size, item.quantity);
      });
      toast.success("Items added to your shopping bag!");
      router.push("/checkout");
    } catch (err) {
      toast.error("Failed to reorder.");
    }
  };

  const cancelMut = useMutation({
    mutationFn: () => ordersApi.cancelOrder(order.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-orders"] });
      toast.success("Order cancelled successfully");
    },
    onError: (e: any) => toast.error(e.message || "Failed to cancel order"),
  });

  const handleDownloadInvoice = () => {
    const lines = [
      `DRAPEVA : TAX INVOICE`,
      `Order: ${order.order_number || "#" + order.id.slice(0, 8).toUpperCase()}`,
      `Date: ${new Date(order.created_at).toLocaleDateString("en-IN")}`,
      `Customer: ${order.customer_name}`,
      `Email: ${order.customer_email}`,
      ``,
      `ITEMS:`,
      ...(order.items as any[]).map(
        (item: any) =>
          `  ${item.product_name} (${item.size}) x${item.quantity} : ${formatINR(item.total)}`,
      ),
      ``,
      `Subtotal: ${formatINR(order.subtotal)}`,
      order.discount > 0 ? `Discount: -${formatINR(order.discount)}` : null,
      `Shipping: ${formatINR(order.shipping_cost)}`,
      `TOTAL: ${formatINR(order.total)}`,
      `Payment: ${order.payment_status}`,
    ]
      .filter(Boolean)
      .join("\n");

    const blob = new Blob([lines], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Drapeva-Invoice-${order.order_number || order.id.slice(0, 8).toUpperCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Invoice downloaded");
  };

  const canCancel = ["pending", "processing"].includes(order.status);

  return (
    <div className="border border-border bg-background hover:border-gold/30 transition-colors shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 flex flex-wrap justify-between items-center gap-4 bg-champagne/10 border-b border-border">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-display text-lg font-medium text-ink">
              Order {order.order_number || "#" + order.id.slice(0, 8).toUpperCase()}
            </span>
            <span
              className={`border px-2 py-0.5 text-[10px] uppercase tracking-wider rounded font-medium ${STATUS_COLORS[order.status] || "bg-muted"}`}
            >
              {order.status}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5 flex gap-2 items-center">
            <span>
              Placed{" "}
              {new Date(order.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <span className="h-1 w-1 bg-border rounded-full" />
            <span>{(order.items as any[])?.length} item(s)</span>
            <span className="h-1 w-1 bg-border rounded-full" />
            <span className="font-medium text-foreground">{formatINR(order.total)}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReorder}
            className="inline-flex items-center gap-1.5 bg-foreground text-background px-4 py-2 text-[10px] uppercase tracking-widest font-medium hover:bg-gold hover:text-gold-foreground transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            Reorder
          </button>
          <button
            onClick={handleDownloadInvoice}
            className="inline-flex items-center gap-1.5 border border-border bg-background px-4 py-2 text-[10px] uppercase tracking-widest font-medium hover:bg-muted transition-colors"
          >
            <Download className="h-3 w-3" />
            Invoice
          </button>
          {canCancel && (
            <button
              onClick={() => {
                if (confirm("Are you sure you want to cancel this order?")) {
                  cancelMut.mutate();
                }
              }}
              disabled={cancelMut.isPending}
              className="inline-flex items-center gap-1.5 border border-red-200 bg-red-50 text-red-700 px-4 py-2 text-[10px] uppercase tracking-widest font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              <X className="h-3 w-3" />
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Main Body (Items Thumbnail + Tracker) */}
      <div className="p-6 space-y-8">
        {/* Thumbnails */}
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {(order.items as any[]).map((item: any, i: number) => (
            <div
              key={i}
              className="flex gap-3 items-center shrink-0 border border-border p-2 pr-6 bg-champagne/5 min-w-[200px]"
            >
              {item.product_image ? (
                <img
                  src={item.product_image}
                  className="h-12 w-9 object-cover border border-border shrink-0"
                  alt={item.product_name}
                />
              ) : (
                <div className="h-12 w-9 bg-muted border border-border flex items-center justify-center shrink-0">
                  <Package className="h-4 w-4 text-muted-foreground opacity-50" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{item.product_name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Qty: {item.quantity}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tracker */}
        <div>
          <OrderTracker status={order.status} />
        </div>

        {/* Details Toggle */}
        <div className="flex justify-center border-t border-dashed border-border pt-4">
          <button
            onClick={onExpand}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider font-medium"
          >
            {expanded ? "Hide Order Details" : "View Full Details"}
            {expanded ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-border bg-champagne/5 p-6 grid gap-8 md:grid-cols-2">
          {/* Items Detailed */}
          <div>
            <p className="eyebrow text-[10px] mb-4 text-gold">Order Items</p>
            <div className="space-y-4">
              {(order.items as any[]).map((item: any, i: number) => (
                <div key={i} className="flex gap-4 items-center">
                  {item.product_image && (
                    <img
                      src={item.product_image}
                      className="h-16 w-12 object-cover border border-border shrink-0"
                      alt={item.product_name}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-snug truncate">{item.product_name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Size: {item.size} · Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-foreground shrink-0">
                    {formatINR(item.total)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Address, Tracking, Totals */}
          <div className="space-y-6">
            {order.shipping_address && (
              <div>
                <p className="eyebrow text-[10px] mb-2 text-gold">Delivery Address</p>
                <p className="text-sm text-foreground leading-relaxed border-l-2 border-border pl-3">
                  {(order.shipping_address as any).name}
                  <br />
                  {(order.shipping_address as any).line1}
                  {(order.shipping_address as any).line2 &&
                    `, ${(order.shipping_address as any).line2}`}
                  <br />
                  {(order.shipping_address as any).city}, {(order.shipping_address as any).state} :{" "}
                  {(order.shipping_address as any).postal_code}
                </p>
              </div>
            )}

            {order.tracking_number && (
              <div>
                <p className="eyebrow text-[10px] mb-2 text-gold">Tracking Number</p>
                <code className="text-sm font-mono bg-background px-3 py-1.5 border border-border inline-block">
                  {order.tracking_number}
                </code>
              </div>
            )}

            <div className="border-t border-border pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatINR(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span>-{formatINR(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>{formatINR(order.shipping_cost)}</span>
              </div>
              <div className="flex justify-between font-semibold text-foreground text-base pt-3 border-t border-border">
                <span>Total</span>
                <span>{formatINR(order.total)}</span>
              </div>
            </div>

            {order.status === "delivered" && (
              <div className="pt-2">
                <Link
                  href="/account/returns"
                  className="text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground border-b border-dashed border-muted-foreground pb-0.5 inline-block"
                >
                  Request Return or Exchange →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrderHistory() {
  const { user } = useAuth();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["my-orders", user?.id],
    queryFn: () => (user ? ordersApi.getUserOrders(user.id) : Promise.resolve([])),
    enabled: !!user,
  });

  const { data: collections = [] } = useQuery({
    queryKey: ["orders-empty-collections"],
    queryFn: () => collectionsApi.list(),
    enabled: orders.length === 0,
  });

  const filtered = filter === "all" ? orders : orders.filter((o: any) => o.status === filter);
  const TABS = ["all", "pending", "processing", "shipped", "delivered", "cancelled"] as const;

  return (
    <DashboardLayout title="My Orders" subtitle="Order History">
      {/* Clean Tabs */}
      <div className="flex gap-6 border-b border-border mb-8 overflow-x-auto scrollbar-hide">
        {TABS.map((f) => {
          const count =
            f === "all" ? orders.length : orders.filter((o: any) => o.status === f).length;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`pb-3 text-[11px] uppercase tracking-widest font-medium whitespace-nowrap transition-all border-b-2 ${
                filter === f
                  ? "border-gold text-gold"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              {f === "all" ? "All Orders" : f}{" "}
              <span className="opacity-60 font-normal">({count})</span>
            </button>
          );
        })}
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="border border-border p-6 animate-pulse">
                <div className="h-5 bg-champagne/50 rounded w-48 mb-3" />
                <div className="h-3 bg-champagne/30 rounded w-64" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="space-y-12">
            <div className="py-16 text-center border border-dashed border-border bg-champagne/5 space-y-4">
              <Package className="h-10 w-10 mx-auto text-muted-foreground stroke-1" />
              <h3 className="font-display text-2xl">No orders found</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                {filter === "all"
                  ? "You haven't placed any orders yet."
                  : `No ${filter} orders in your history.`}
              </p>
              {filter === "all" && (
                <div className="pt-2">
                  <Link
                    href="/collections"
                    className="inline-block bg-foreground text-background px-6 py-3 text-xs uppercase tracking-widest hover:bg-gold hover:text-gold-foreground transition-all duration-300"
                  >
                    Shop Now
                  </Link>
                </div>
              )}
            </div>
          </div>
        ) : (
          filtered.map((order: any) => (
            <OrderCard
              key={order.id}
              order={order}
              expanded={expandedId === order.id}
              onExpand={() => setExpandedId(expandedId === order.id ? null : order.id)}
            />
          ))
        )}
      </div>
    </DashboardLayout>
  );
}
