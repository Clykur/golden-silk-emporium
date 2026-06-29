"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RotateCcw, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import { returnsApi, ordersApi } from "@/lib/api";
import type { ReturnRequest } from "@/lib/types";
import { formatINR } from "@/lib/types";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

const RETURN_REASONS = [
  "Product damaged or defective",
  "Wrong item received",
  "Size/fit issue",
  "Quality not as described",
  "Changed my mind",
  "Other",
];

const RETURN_STATUS_COLORS: Record<string, string> = {
  requested: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-blue-50 text-blue-700 border-blue-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  picked_up: "bg-indigo-50 text-indigo-700 border-indigo-200",
  refunded: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export default function Returns() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [reason, setReason] = useState(RETURN_REASONS[0]);
  const [comments, setComments] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: returns = [], isLoading } = useQuery({
    queryKey: ["my-returns", user?.id],
    queryFn: () => (user ? returnsApi.getUserReturns(user.id) : Promise.resolve([])),
    enabled: !!user,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["my-orders", user?.id],
    queryFn: () => (user ? ordersApi.getUserOrders(user.id) : Promise.resolve([])),
    enabled: !!user,
  });

  const deliveredOrders = orders.filter((o: any) => o.status === "delivered");

  const createMut = useMutation({
    mutationFn: () => {
      const order = orders.find((o: any) => o.id === selectedOrderId);
      if (!order || !user) throw new Error("Order not found");
      return returnsApi.create({
        order_id: order.id,
        user_id: user.id,
        items: order.items as any,
        reason,
        comments: comments || undefined,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-returns"] });
      toast.success("Return request submitted. We'll process it within 2-3 business days.");
      setShowForm(false);
      setSelectedOrderId("");
      setReason(RETURN_REASONS[0]);
      setComments("");
    },
    onError: (e: any) => toast.error(e.message || "Failed to submit return request"),
  });

  return (
    <DashboardLayout title="Returns & Exchange" subtitle="My Returns">
      <div className="space-y-8">
        {/* Policy Note */}
        <div className="flex gap-3 border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium mb-1">Exchange Policy</p>
            <p className="text-xs leading-relaxed">
              We currently do not offer returns or refunds. However, we do offer exchanges within 1
              day of delivery for unused, unwashed, and unworn items with original tags and
              packaging intact. Sale, customized, and non-exchangeable items are excluded.
            </p>
          </div>
        </div>

        {/* New Return Button */}
        {!showForm && deliveredOrders.length > 0 && (
          <div className="flex justify-end">
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 border border-foreground px-5 py-3 text-xs uppercase tracking-wider font-medium hover:bg-foreground hover:text-background transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Request Return
            </button>
          </div>
        )}

        {/* Return Form */}
        {showForm && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createMut.mutate();
            }}
            className="border border-border p-6 space-y-5 bg-champagne/10"
          >
            <div className="flex justify-between items-center border-b border-border pb-4">
              <h2 className="font-display text-xl">Return Request</h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-muted-foreground hover:text-foreground text-xs uppercase tracking-wider"
              >
                Cancel
              </button>
            </div>

            <label className="block">
              <span className="eyebrow mb-1 block">Select Order</span>
              <select
                required
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value)}
                className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground"
              >
                <option value="">- Select a delivered order -</option>
                {deliveredOrders.map((o: any) => (
                  <option key={o.id} value={o.id}>
                    {o.order_number || "#" + o.id.slice(0, 8).toUpperCase()} -{" "}
                    {new Date(o.created_at).toLocaleDateString("en-IN")} - {formatINR(o.total)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="eyebrow mb-1 block">Reason for Return</span>
              <select
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground"
              >
                {RETURN_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="eyebrow mb-1 block">
                Additional Comments{" "}
                <span className="normal-case text-muted-foreground">(optional)</span>
              </span>
              <textarea
                rows={3}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Please provide any additional details..."
                className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground resize-none"
              />
            </label>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-3 text-xs uppercase tracking-wider border border-border text-muted-foreground hover:border-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMut.isPending || !selectedOrderId}
                className="bg-foreground text-background px-6 py-3 text-xs uppercase tracking-widest font-medium hover:bg-gold hover:text-gold-foreground transition-colors disabled:opacity-50"
              >
                {createMut.isPending ? "Submitting..." : "Submit Return Request"}
              </button>
            </div>
          </form>
        )}

        {/* Returns List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="border border-border p-4 h-20 animate-pulse bg-champagne/5" />
            ))}
          </div>
        ) : returns.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-border bg-champagne/5 space-y-4">
            <RotateCcw className="h-10 w-10 mx-auto text-muted-foreground stroke-1" />
            <p className="font-display text-xl">No return requests</p>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
              {deliveredOrders.length > 0
                ? "You can request a return for any delivered order."
                : "You have no delivered orders eligible for return."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {returns.map((ret: ReturnRequest) => (
              <div key={ret.id} className="border border-border">
                <div
                  onClick={() => setExpandedId(expandedId === ret.id ? null : ret.id)}
                  className="flex items-start justify-between gap-4 p-5 cursor-pointer hover:bg-champagne/5 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`border px-2 py-0.5 text-[10px] uppercase tracking-wider rounded ${RETURN_STATUS_COLORS[ret.status] || "bg-muted"}`}
                      >
                        {ret.status.replace("_", " ")}
                      </span>
                      {ret.refund_amount && (
                        <span className="text-xs text-emerald-600 font-medium">
                          Refund: {formatINR(ret.refund_amount)}
                        </span>
                      )}
                    </div>
                    <p className="font-medium text-sm mt-1">{ret.reason}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(ret.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                      {" · "}
                      <span className="font-medium text-ink">
                        Order{" "}
                        {ret.order?.order_number || "#" + ret.order_id.slice(0, 8).toUpperCase()}
                      </span>
                    </p>
                  </div>
                  {expandedId === ret.id ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                </div>

                {expandedId === ret.id && (
                  <div className="border-t border-border bg-champagne/5 p-5 space-y-3 text-sm">
                    <p>
                      <span className="text-muted-foreground">Reason:</span> {ret.reason}
                    </p>
                    {ret.comments && (
                      <p>
                        <span className="text-muted-foreground">Comments:</span> {ret.comments}
                      </p>
                    )}
                    {ret.admin_notes && (
                      <div className="border border-gold/20 bg-gold/5 p-3">
                        <p className="text-xs font-medium text-gold mb-1">Support Note:</p>
                        <p className="text-xs text-muted-foreground">{ret.admin_notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
