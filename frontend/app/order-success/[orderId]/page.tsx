"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CheckCircle,
  Truck,
  ShoppingBag,
  ArrowLeft,
  Loader2,
  MapPin,
  Calendar,
  CreditCard,
  ChevronRight,
} from "lucide-react";
import { ordersApi } from "@/lib/api";
import { formatINR } from "@/lib/types";

export default function OrderSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const data = await ordersApi.getById(orderId);
        setOrder(data);
      } catch (err: any) {
        console.error(err);
        setError("We couldn't retrieve your order details. Rest assured, your order is safe.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Loading receipt details...
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container-luxe py-24 text-center space-y-5">
        <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground stroke-1" />
        <h1 className="font-display text-3xl">Receipt Not Found</h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {error || "The specified order could not be located."}
        </p>
        <Link
          href="/collections"
          className="mt-6 inline-block bg-foreground text-background px-8 py-3 text-xs uppercase tracking-[0.2em] font-medium hover:bg-gold hover:text-gold-foreground transition-all"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  const items = order.items || [];
  const address = order.shipping_address || {};
  const statusSteps = [
    { label: "Ordered", date: order.created_at, active: true },
    { label: "Processing", active: order.status !== "pending" && order.status !== "cancelled" },
    { label: "Shipped", active: order.status === "shipped" || order.status === "delivered" },
    { label: "Delivered", active: order.status === "delivered" },
  ];

  return (
    <div className="container-luxe py-12 max-w-4xl mx-auto space-y-8 animate-rise">
      {/* Header section */}
      <div className="text-center space-y-3">
        <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-sm">
          <CheckCircle className="h-8 w-8 text-emerald-600 animate-pulse" />
        </div>
        <span className="text-[10px] uppercase tracking-[0.25em] text-gold font-bold bg-gold/5 px-3 py-1 border border-gold/15">
          Order Success
        </span>
        <h1 className="font-display text-3xl md:text-5xl mt-2 font-semibold text-ink">
          Thank you for your order
        </h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Your order is confirmed and is being carefully prepared. A receipt has been sent to your
          email.
        </p>
      </div>

      {/* Grid containing tracking timeline and receipt details */}
      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          {/* Timeline and status */}
          <div className="border border-border bg-background p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h2 className="font-display text-lg font-medium text-foreground flex items-center gap-2">
                <Truck className="h-4.5 w-4.5 text-gold" /> Track Order
              </h2>
              <span className="font-mono text-xs text-muted-foreground uppercase bg-muted/65 px-2 py-0.5 border border-border/40">
                {order.order_number}
              </span>
            </div>

            {/* Progress indicators */}
            <div className="relative flex justify-between items-start pt-3">
              <div className="absolute top-4 left-4 right-4 h-0.5 bg-border -z-10" />
              <div
                className="absolute top-4 left-4 h-0.5 bg-gold -z-10 transition-all duration-700"
                style={{
                  width: `${
                    order.status === "delivered"
                      ? "100%"
                      : order.status === "shipped"
                        ? "66%"
                        : order.status === "processing"
                          ? "33%"
                          : "0%"
                  }`,
                }}
              />
              {statusSteps.map((step, idx) => (
                <div key={idx} className="flex flex-col items-center text-center space-y-2">
                  <div
                    className={`h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all ${
                      step.active
                        ? "border-gold bg-background text-gold shadow-sm"
                        : "border-border bg-background text-muted-foreground"
                    }`}
                  >
                    {step.active ? (
                      <span className="h-2 w-2 rounded-full bg-gold" />
                    ) : (
                      <span className="text-[10px] font-bold">{idx + 1}</span>
                    )}
                  </div>
                  <div>
                    <p
                      className={`text-[10px] uppercase tracking-widest font-semibold ${step.active ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {step.label}
                    </p>
                    {step.date && (
                      <p className="text-[9px] text-muted-foreground mt-0.5 font-sans">
                        {new Date(step.date).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Estimated timeline banner */}
            <div className="border border-border bg-champagne/5 p-4 text-xs space-y-1.5 leading-relaxed">
              <p className="font-semibold text-foreground uppercase tracking-widest text-[10px] text-gold flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> Estimated Delivery Timeline
              </p>
              <p className="text-muted-foreground">
                Every Drapeva saree is carefully prepared and undergoes a thorough quality
                inspection to ensure it reaches you in perfect condition. As part of this commitment
                to quality, delivery typically takes 10–15 business days. Once your order is
                dispatched, tracking details will be shared via email.
              </p>
            </div>
          </div>

          {/* Delivery & Billing Details */}
          <div className="border border-border bg-background p-6 space-y-6 shadow-sm">
            <h2 className="font-display text-lg font-medium text-foreground flex items-center gap-2 border-b border-border/60 pb-3">
              <MapPin className="h-4.5 w-4.5 text-gold" /> Delivery Details
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 text-sm leading-relaxed">
              <div>
                <p className="eyebrow text-[9px] text-muted-foreground mb-1.5">Recipient</p>
                <p className="font-semibold text-foreground">
                  {address.name || order.customer_name}
                </p>
                <p className="text-muted-foreground font-sans mt-0.5">{order.customer_phone}</p>
                <p className="text-muted-foreground font-sans">{order.customer_email}</p>
              </div>
              <div>
                <p className="eyebrow text-[9px] text-muted-foreground mb-1.5">Shipping Address</p>
                <p className="text-muted-foreground font-sans">
                  {address.line1}
                  {address.line2 && `, ${address.line2}`}
                  <br />
                  {address.city}, {address.state} — {address.postal_code}
                  <br />
                  {address.country || "India"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items & Totals */}
        <div className="space-y-6">
          <div className="border border-border bg-background p-6 space-y-5 shadow-sm">
            <h2 className="font-display text-lg font-medium text-foreground border-b border-border/60 pb-3">
              Items Ordered
            </h2>
            <div className="divide-y divide-border/60 max-h-[350px] overflow-y-auto pr-1 hide-scrollbar">
              {items.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3.5 py-3 first:pt-0">
                  {item.product_image && (
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                      className="h-16 w-12 object-cover border border-border/60 shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground line-clamp-2">
                      {item.product_name}
                    </p>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-1 font-semibold">
                      Size: {item.size} · Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="text-xs font-bold text-ink shrink-0">{formatINR(item.total)}</p>
                </div>
              ))}
            </div>

            {/* Payment status banner */}
            <div className="border-t border-b border-border/60 py-3 flex justify-between items-center text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5 text-gold" /> Payment Status
              </span>
              <span
                className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${
                  order.payment_status === "paid"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : order.payment_status === "cod"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                {order.payment_status === "paid"
                  ? "Paid Online"
                  : order.payment_status === "cod"
                    ? "COD"
                    : "Pending"}
              </span>
            </div>

            {/* Pricing Details */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium text-foreground">{formatINR(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount</span>
                  <span>-{formatINR(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium text-foreground">
                  {order.shipping_cost === 0 ? "Free" : formatINR(order.shipping_cost)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">GST (5%)</span>
                <span className="font-medium text-foreground">{formatINR(order.tax || 0)}</span>
              </div>
              <div className="flex justify-between font-bold text-gold text-sm border-t border-border/60 pt-3 mt-1.5">
                <span>Total Paid</span>
                <span>{formatINR(order.total)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="bg-foreground text-background py-3.5 text-center text-[10px] uppercase tracking-[0.25em] font-semibold hover:bg-gold hover:text-gold-foreground transition-all duration-300 shadow-sm"
            >
              Return to Homepage
            </Link>
            <Link
              href="/collections"
              className="border border-border hover:bg-muted/30 py-3.5 text-center text-[10px] uppercase tracking-[0.25em] font-semibold transition-all duration-300"
            >
              Explore New Sarees
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
