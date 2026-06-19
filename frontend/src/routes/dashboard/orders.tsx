import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Package, Download, X, CheckCircle, Truck, RefreshCw, Clock, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import { ordersApi } from "@/lib/api";
import { formatINR } from "@/lib/types";
import type { DbOrder, OrderStatus } from "@/lib/types";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

export const Route = createFileRoute("/dashboard/orders")({
  head: () => ({
    meta: [
      { title: "My Orders — Drapeva" },
      { name: "description", content: "Track and manage your Drapeva orders." },
    ],
  }),
  component: OrderHistory,
});

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
    <div className="relative">
      <div className="flex items-center justify-between gap-2">
        {STATUS_STEPS.map((step, i) => {
          const done = i <= current;
          const active = i === current;
          return (
            <div key={step.key} className="flex flex-col items-center gap-1 flex-1">
              <div className={`h-7 w-7 rounded-full border-2 grid place-items-center transition-all ${
                done
                  ? "border-gold bg-gold text-gold-foreground"
                  : "border-border bg-background text-muted-foreground"
              } ${active ? "ring-2 ring-gold/30 ring-offset-1" : ""}`}>
                <step.icon className="h-3 w-3" />
              </div>
              <span className={`text-[9px] uppercase tracking-wider text-center leading-tight ${done ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      {/* Connecting line */}
      <div className="absolute top-3.5 left-[14px] right-[14px] h-0.5 bg-border -z-10">
        <div
          className="h-full bg-gold transition-all duration-700"
          style={{ width: current < 0 ? "0%" : `${(current / (STATUS_STEPS.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
}

function OrderCard({ order, onExpand, expanded }: { order: DbOrder; onExpand: () => void; expanded: boolean }) {
  const qc = useQueryClient();

  const cancelMut = useMutation({
    mutationFn: () => ordersApi.cancelOrder(order.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-orders"] });
      toast.success("Order cancelled successfully");
    },
    onError: (e: any) => toast.error(e.message || "Failed to cancel order"),
  });

  const handleDownloadInvoice = () => {
    // Build a simple invoice text and trigger download
    const lines = [
      `DRAPEVA — TAX INVOICE`,
      `Order: #${order.id.slice(0, 8).toUpperCase()}`,
      `Date: ${new Date(order.created_at).toLocaleDateString("en-IN")}`,
      `Customer: ${order.customer_name}`,
      `Email: ${order.customer_email}`,
      ``,
      `ITEMS:`,
      ...(order.items as any[]).map((item: any) =>
        `  ${item.product_name} (${item.size}) x${item.quantity} — ${formatINR(item.total)}`
      ),
      ``,
      `Subtotal: ${formatINR(order.subtotal)}`,
      order.discount > 0 ? `Discount: -${formatINR(order.discount)}` : null,
      `Shipping: ${formatINR(order.shipping_cost)}`,
      `TOTAL: ${formatINR(order.total)}`,
      `Payment: ${order.payment_status}`,
    ].filter(Boolean).join("\n");

    const blob = new Blob([lines], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Drapeva-Invoice-${order.id.slice(0, 8).toUpperCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Invoice downloaded");
  };

  const canCancel = ["pending", "processing"].includes(order.status);

  return (
    <div className="border border-border bg-background hover:border-gold/30 transition-colors">
      {/* Header */}
      <div className="px-6 py-4 flex flex-wrap justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Package className="h-4 w-4 text-gold stroke-1" />
            <span className="font-display text-base">
              Order #{order.id.slice(0, 8).toUpperCase()}
            </span>
            <span className={`border px-2 py-0.5 text-[10px] uppercase tracking-wider rounded ${STATUS_COLORS[order.status] || "bg-muted"}`}>
              {order.status}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 ml-7">
            Placed {new Date(order.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
            {" · "}
            {(order.items as any[])?.length} item(s)
            {" · "}
            <span className="font-medium text-foreground">{formatINR(order.total)}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadInvoice}
            className="inline-flex items-center gap-1.5 border border-border px-3 py-1.5 text-[10px] uppercase tracking-widest hover:bg-muted transition-colors"
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
              className="inline-flex items-center gap-1.5 border border-red-200 bg-red-50 text-red-700 px-3 py-1.5 text-[10px] uppercase tracking-widest hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              <X className="h-3 w-3" />
              Cancel
            </button>
          )}
          <button
            onClick={onExpand}
            className="inline-flex items-center gap-1.5 border border-border px-3 py-1.5 text-[10px] uppercase tracking-widest hover:bg-muted transition-colors"
          >
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {expanded ? "Hide" : "Details"}
          </button>
        </div>
      </div>

      {/* Tracker */}
      <div className="px-6 pb-4">
        <OrderTracker status={order.status} />
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-border px-6 py-5 space-y-5 bg-champagne/5">
          {/* Items */}
          <div>
            <p className="eyebrow text-[9px] mb-3">Items</p>
            <div className="space-y-3">
              {(order.items as any[]).map((item: any, i: number) => (
                <div key={i} className="flex gap-4 items-center">
                  {item.product_image && (
                    <img src={item.product_image} className="h-14 w-10 object-cover border border-border shrink-0" alt={item.product_name} />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.product_name}</p>
                    <p className="text-xs text-muted-foreground">Size: {item.size} · Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-gold shrink-0">{formatINR(item.total)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping address */}
          {order.shipping_address && (
            <div>
              <p className="eyebrow text-[9px] mb-2">Delivery Address</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {(order.shipping_address as any).name}<br />
                {(order.shipping_address as any).line1}
                {(order.shipping_address as any).line2 && `, ${(order.shipping_address as any).line2}`}<br />
                {(order.shipping_address as any).city}, {(order.shipping_address as any).state} — {(order.shipping_address as any).postal_code}
              </p>
            </div>
          )}

          {/* Tracking */}
          {order.tracking_number && (
            <div>
              <p className="eyebrow text-[9px] mb-2">Tracking Number</p>
              <code className="text-sm font-mono bg-champagne/30 px-3 py-1.5 border border-border">
                {order.tracking_number}
              </code>
            </div>
          )}

          {/* Totals */}
          <div className="border-t border-border pt-4 space-y-1 text-sm">
            <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{formatINR(order.subtotal)}</span></div>
            {order.discount > 0 && <div className="flex justify-between text-emerald-600"><span>Discount</span><span>-{formatINR(order.discount)}</span></div>}
            <div className="flex justify-between text-muted-foreground"><span>Shipping</span><span>{formatINR(order.shipping_cost)}</span></div>
            <div className="flex justify-between font-semibold text-gold text-base pt-2 border-t border-border">
              <span>Total</span><span>{formatINR(order.total)}</span>
            </div>
          </div>

          {/* Return link */}
          {order.status === "delivered" && (
            <div className="pt-2">
              <Link
                to="/dashboard/returns"
                className="text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground border-b border-dashed border-muted-foreground pb-0.5"
              >
                Request Return or Exchange →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function OrderHistory() {
  const { user } = useAuth();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["my-orders", user?.id],
    queryFn: () => user ? ordersApi.getUserOrders(user.id) : Promise.resolve([]),
    enabled: !!user,
  });

  const filtered = filter === "all" ? orders : orders.filter((o: any) => o.status === filter);

  return (
    <DashboardLayout title="My Orders" subtitle="Order History">
      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "pending", "processing", "shipped", "delivered", "cancelled"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-[10px] uppercase tracking-widest border transition-colors ${
              filter === f ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
            }`}
          >
            {f === "all" ? "All Orders" : f}
            {" "}
            <span className="opacity-60">
              ({f === "all" ? orders.length : orders.filter((o: any) => o.status === f).length})
            </span>
          </button>
        ))}
      </div>

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
        <div className="py-16 text-center border border-dashed border-border">
          <Package className="h-10 w-10 mx-auto text-muted-foreground stroke-1 mb-4" />
          <p className="font-display text-xl">No orders found</p>
          <p className="text-sm text-muted-foreground mt-2">
            {filter === "all" ? "You haven't placed any orders yet." : `No ${filter} orders.`}
          </p>
          {filter === "all" && (
            <Link
              to="/shop"
              search={{ category: "all" }}
              className="mt-6 inline-block bg-foreground text-background px-6 py-3 text-xs uppercase tracking-widest"
            >
              Discover Collections
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order: DbOrder) => (
            <OrderCard
              key={order.id}
              order={order}
              expanded={expandedId === order.id}
              onExpand={() => setExpandedId(expandedId === order.id ? null : order.id)}
            />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
