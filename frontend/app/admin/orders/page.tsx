"use client";

import Link from "next/link";
import { useRouter, usePathname, useSearchParams, useParams } from "next/navigation";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/admin-layout";
import { ordersApi } from "@/lib/api";
import { formatINR } from "@/lib/types";
import type { DbOrder, OrderStatus } from "@/lib/types";
import { Search, Eye, Package, Truck, CheckCircle, XCircle, RefreshCw } from "lucide-react";

import { Combobox } from "@/components/combobox";
const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: any }> = {
  pending: {
    label: "Pending",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    icon: RefreshCw,
  },
  processing: {
    label: "Processing",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Package,
  },
  shipped: {
    label: "Shipped",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle,
  },
  cancelled: { label: "Cancelled", color: "bg-red-50 text-red-700 border-red-200", icon: XCircle },
  returned: {
    label: "Returned",
    color: "bg-orange-50 text-orange-700 border-orange-200",
    icon: RefreshCw,
  },
};

export default function AdminOrders() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [selected, setSelected] = useState<DbOrder | null>(null);
  const [trackingInput, setTrackingInput] = useState("");

  const { data: orders = [], isLoading } = useQuery<DbOrder[]>({
    queryKey: ["admin-orders"],
    queryFn: () => ordersApi.adminList(),
    refetchInterval: 30000,
  });

  const updateStatusMut = useMutation({
    mutationFn: ({ id, status, tracking }: { id: string; status: string; tracking?: string }) =>
      ordersApi.updateStatus(id, status as OrderStatus, tracking),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Order status updated");
      setSelected(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const filtered = orders.filter((o: DbOrder) => {
    const matchSearch =
      !search ||
      o.id.includes(search) ||
      o.order_number?.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalRevenue = filtered
    .filter((o: DbOrder) => o.status !== "cancelled")
    .reduce((s: number, o: DbOrder) => s + o.total, 0);

  return (
    <AdminLayout
      title={
        selected
          ? `Order ${selected.order_number || "#" + selected.id.slice(0, 8).toUpperCase()}`
          : "Orders"
      }
      subtitle={
        selected
          ? new Date(selected.created_at).toLocaleString("en-IN")
          : `${orders.length} total orders · ${formatINR(totalRevenue)} revenue`
      }
      actions={
        selected && (
          <button
            onClick={() => setSelected(null)}
            className="border border-border px-5 py-2.5 text-xs uppercase tracking-widest hover:bg-muted"
          >
            Back to Orders
          </button>
        )
      }
    >
      {!selected ? (
        <div className="space-y-5">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by order number, name, email..."
                className="w-full border border-border bg-background pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-foreground"
              />
            </div>
            <Combobox
              value={statusFilter}
              onChange={(val) => setStatusFilter(val as OrderStatus | "all")}
              options={[
                { label: "All Status", value: "all" },
                ...Object.entries(STATUS_CONFIG).map(([k, { label }]) => ({ label, value: k })),
              ]}
              className="w-[180px]"
            />
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {Object.entries(STATUS_CONFIG).map(([status, { label, color }]) => {
              const count = orders.filter((o: DbOrder) => o.status === status).length;
              return (
                <button
                  key={status}
                  onClick={() =>
                    setStatusFilter(statusFilter === status ? "all" : (status as OrderStatus))
                  }
                  className={`border p-3 text-center transition-all ${statusFilter === status ? "ring-2 ring-gold" : "border-border hover:border-foreground/30"}`}
                >
                  <p className="font-display text-xl">{count}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
                    {label}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
            </div>
          ) : (
            <div className="overflow-x-auto border border-border">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-champagne/10">
                    <th className="p-4 eyebrow text-[9px]">Order ID</th>
                    <th className="p-4 eyebrow text-[9px]">Customer</th>
                    <th className="p-4 eyebrow text-[9px]">Items</th>
                    <th className="p-4 eyebrow text-[9px]">Total</th>
                    <th className="p-4 eyebrow text-[9px]">Status</th>
                    <th className="p-4 eyebrow text-[9px]">Order Date</th>
                    <th className="p-4 eyebrow text-[9px]">Delivery Date</th>
                    <th className="p-4 eyebrow text-[9px] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((o: DbOrder) => {
                    const { label, color, icon: Icon } = STATUS_CONFIG[o.status];
                    return (
                      <tr
                        key={o.id}
                        className="hover:bg-champagne/5 cursor-pointer"
                        onClick={() => {
                          setSelected(o);
                          setTrackingInput(o.tracking_number || "");
                        }}
                      >
                        <td className="p-4 font-mono text-xs text-muted-foreground">
                          {o.order_number || o.id.slice(0, 8).toUpperCase()}
                        </td>
                        <td className="p-4">
                          <p className="font-medium">{o.customer_name}</p>
                          <p className="text-[10px] text-muted-foreground">{o.customer_email}</p>
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {(o.items as any[]).length} item
                          {(o.items as any[]).length !== 1 ? "s" : ""}
                        </td>
                        <td className="p-4">
                          <p className="font-semibold text-gold">{formatINR(o.total)}</p>
                          <span
                            className={`inline-block text-[9px] font-semibold uppercase tracking-wider ${
                              o.payment_status === "paid"
                                ? "text-emerald-600"
                                : o.payment_status === "cod"
                                  ? "text-blue-500"
                                  : "text-amber-500"
                            }`}
                          >
                            {o.payment_status === "paid"
                              ? "Paid"
                              : o.payment_status === "cod"
                                ? "COD"
                                : o.payment_status}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1.5 border px-2 py-0.5 text-[10px] uppercase tracking-wider rounded ${color}`}
                          >
                            <Icon className="h-3 w-3" /> {label}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-muted-foreground">
                          {new Date(o.created_at).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="p-4 text-xs text-muted-foreground">
                          {o.status === "delivered"
                            ? new Date(o.updated_at).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "Est. " +
                              new Date(
                                new Date(o.created_at).getTime() + 7 * 24 * 60 * 60 * 1000,
                              ).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                        </td>
                        <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              setSelected(o);
                              setTrackingInput(o.tracking_number || "");
                            }}
                            className="inline-flex items-center gap-1.5 border border-border px-3 py-1.5 text-[10px] uppercase tracking-widest hover:bg-muted transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5" /> Manage
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-background border border-border w-full">
          <div className="p-6 space-y-6">
            {/* Customer */}
            <div>
              <p className="eyebrow text-[9px] mb-3">Customer Info</p>
              <p className="text-sm font-medium">{selected.customer_name}</p>
              <p className="text-xs text-muted-foreground">
                {selected.customer_email} · {selected.customer_phone}
              </p>
            </div>
            {/* Address */}
            {selected.shipping_address && (
              <div>
                <p className="eyebrow text-[9px] mb-2">Shipping Address</p>
                <p className="text-xs text-muted-foreground">
                  {(selected.shipping_address as any).line1},{" "}
                  {(selected.shipping_address as any).line2 &&
                    `${(selected.shipping_address as any).line2}, `}
                  {(selected.shipping_address as any).city},{" "}
                  {(selected.shipping_address as any).state}{" "}
                  {(selected.shipping_address as any).postal_code}
                </p>
              </div>
            )}
            {/* Items */}
            <div>
              <p className="eyebrow text-[9px] mb-3">Items</p>
              <div className="space-y-2">
                {(selected.items as any[]).map((item: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 border border-border p-3">
                    {item.product_image && (
                      <img
                        src={item.product_image}
                        className="h-12 w-9 object-cover border border-border"
                      />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.product_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Qty: {item.quantity} · Size: {item.size}
                      </p>
                    </div>
                    <p className="font-semibold text-gold">{formatINR(item.total)}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* Totals */}
            <div className="border-t border-border pt-4 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatINR(selected.subtotal)}</span>
              </div>
              {selected.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span>-{formatINR(selected.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{formatINR(selected.shipping_cost)}</span>
              </div>
              <div className="flex justify-between font-semibold text-gold text-base border-t border-border pt-2 mt-2">
                <span>Total</span>
                <span>{formatINR(selected.total)}</span>
              </div>
            </div>
            {/* Payment */}
            <div>
              <p className="eyebrow text-[9px] mb-2">Payment</p>
              <div className="flex items-center gap-3">
                <span
                  className={`inline-block border px-2 py-0.5 text-[10px] uppercase tracking-wider rounded ${
                    selected.payment_status === "paid"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : selected.payment_status === "cod"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                >
                  {selected.payment_status}
                </span>
                {selected.payment_status !== "paid" && (
                  <button
                    onClick={async () => {
                      try {
                        await ordersApi.updatePaymentStatus(selected.id, "paid");
                        toast.success("Order payment marked as PAID");
                        qc.invalidateQueries({ queryKey: ["admin-orders"] });
                        setSelected({ ...selected, payment_status: "paid" });
                      } catch (err: any) {
                        toast.error(err.message || "Failed to update payment status");
                      }
                    }}
                    className="border border-emerald-300 px-3 py-1.5 text-[10px] uppercase tracking-widest bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors"
                  >
                    Mark as Paid
                  </button>
                )}
              </div>
              {selected.razorpay_payment_id && (
                <p className="text-xs text-muted-foreground mt-1.5">
                  Payment ID: {selected.razorpay_payment_id}
                </p>
              )}
            </div>
            {/* Update status */}
            <div className="border-t border-border pt-5">
              <p className="eyebrow text-[9px] mb-3">Update Order Status</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {(
                  [
                    "pending",
                    "processing",
                    "shipped",
                    "delivered",
                    "cancelled",
                    "returned",
                  ] as OrderStatus[]
                ).map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      updateStatusMut.mutate({
                        id: selected.id,
                        status: s,
                        tracking: s === "shipped" ? trackingInput : undefined,
                      });
                    }}
                    className={`border px-3 py-1.5 text-[10px] uppercase tracking-widest transition-colors ${selected.status === s ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground"}`}
                  >
                    {STATUS_CONFIG[s].label}
                  </button>
                ))}
              </div>
              <label className="block">
                <span className="eyebrow text-[10px] mb-1.5 block">Tracking Number</span>
                <input
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none"
                  placeholder="AWB / Tracking number..."
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
