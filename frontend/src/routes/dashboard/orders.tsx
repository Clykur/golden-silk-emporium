import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  User,
  LogOut,
  Package,
  MapPin,
  Settings,
  Calendar,
  ShieldCheck,
  Download,
} from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import { api } from "@/lib/api";
import { formatINR } from "@/lib/products";

export const Route = createFileRoute("/dashboard/orders")({
  head: () => ({
    meta: [
      { title: "Order History — Maaya Couture" },
      { name: "description", content: "Review and track your couture commissions." },
    ],
  }),
  component: OrderHistory,
});

function OrderHistory() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.navigate({ to: "/auth/login" });
      return;
    }

    api.orders
      .history()
      .then((data) => setOrders(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (!user) return null;

  return (
    <div className="container-luxe py-12">
      <div className="grid gap-8 lg:grid-cols-[250px_1fr]">
        {/* Sidebar */}
        <aside className="border-b border-border pb-6 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-8">
          <div className="flex items-center gap-3 pb-6 border-b border-border">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-champagne text-gold font-display text-lg">
              {user.name.charAt(0)}
            </div>
            <div>
              <p className="font-medium text-sm">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <nav className="mt-6 space-y-1 text-xs uppercase tracking-widest font-medium text-muted-foreground">
            <Link
              to="/dashboard"
              className="flex items-center gap-3 px-3 py-2 hover:text-foreground transition-colors"
            >
              <User className="h-4 w-4" /> Account Overview
            </Link>
            <Link
              to="/dashboard/orders"
              className="flex items-center gap-3 px-3 py-2 bg-champagne text-foreground"
            >
              <Package className="h-4 w-4" /> Order History
            </Link>
            <Link
              to="/dashboard/addresses"
              className="flex items-center gap-3 px-3 py-2 hover:text-foreground transition-colors"
            >
              <MapPin className="h-4 w-4" /> Address Book
            </Link>
            <Link
              to="/dashboard/profile"
              className="flex items-center gap-3 px-3 py-2 hover:text-foreground transition-colors"
            >
              <Settings className="h-4 w-4" /> Profile Settings
            </Link>
            <button
              onClick={() => {
                logout();
                router.navigate({ to: "/" });
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-destructive hover:text-destructive/80 text-left cursor-pointer"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </nav>
        </aside>

        {/* Content */}
        <main className="space-y-8">
          <div>
            <p className="eyebrow text-gold">Commissions</p>
            <h1 className="mt-1 font-display text-3xl">Order History</h1>
            <span className="gold-divider mt-4 block" />
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground py-10 animate-pulse">
              Loading purchase history...
            </p>
          ) : orders.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-border">
              <Package className="h-10 w-10 mx-auto text-muted-foreground stroke-1" />
              <p className="mt-4 text-sm text-muted-foreground font-display">
                You have not placed any orders yet.
              </p>
              <Link
                to="/shop"
                search={{ category: "all" }}
                className="mt-6 inline-block bg-foreground text-background px-6 py-3 text-xs uppercase tracking-widest"
              >
                Discover Couture
              </Link>
            </div>
          ) : selectedOrder ? (
            /* Order Detail / Tracking View */
            <div className="border border-border p-6 md:p-8 space-y-6">
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground border border-border px-4 py-2"
              >
                &larr; Back to History
              </button>

              <div className="flex flex-wrap justify-between items-baseline gap-4 border-b border-border pb-5">
                <div>
                  <h2 className="font-display text-2xl">
                    Order #{selectedOrder.id.substring(0, 8).toUpperCase()}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Placed on: {new Date(selectedOrder.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className="bg-gold text-gold-foreground px-3 py-1 text-xs uppercase tracking-wider font-semibold">
                    {selectedOrder.status}
                  </span>
                </div>
              </div>

              {/* Progress Tracker */}
              <div className="py-6 border-b border-border">
                <p className="eyebrow text-gold mb-6">Atelier Progress</p>
                <div className="grid grid-cols-4 gap-2 text-center text-[10px] uppercase tracking-wider">
                  {[
                    { label: "Design Approved", done: true },
                    {
                      label: "Weaving & Embroidery",
                      done: ["PROCESSING", "SHIPPED", "DELIVERED"].includes(selectedOrder.status),
                    },
                    {
                      label: "Atelier Fitting / Dispatched",
                      done: ["SHIPPED", "DELIVERED"].includes(selectedOrder.status),
                    },
                    { label: "Delivered", done: selectedOrder.status === "DELIVERED" },
                  ].map((step, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div
                        className={`h-6 w-6 rounded-full border grid place-items-center mb-2 font-semibold ${
                          step.done
                            ? "border-gold bg-gold text-gold-foreground"
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        {i + 1}
                      </div>
                      <span
                        className={
                          step.done ? "text-foreground font-medium" : "text-muted-foreground"
                        }
                      >
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Items List */}
              <div>
                <p className="eyebrow mb-4">Couture Pieces</p>
                <ul className="divide-y divide-border">
                  {selectedOrder.items.map((item: any) => (
                    <li key={item.id} className="flex gap-4 py-4 items-center">
                      <img
                        src={
                          item.variant.product.images?.[0]?.url ||
                          "https://images.unsplash.com/photo-1610189012906-4c0aa9b9781e?w=200&q=80"
                        }
                        alt=""
                        className="h-16 w-12 object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-display text-sm font-medium">
                          {item.variant.product.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Size {item.variant.size} · Qty {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-medium">{formatINR(item.price * item.quantity)}</p>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Invoice Generation Option */}
              <div className="flex justify-between items-center flex-wrap gap-4 border-t border-border pt-6 text-sm">
                <div>
                  <p className="text-muted-foreground">Order Total:</p>
                  <p className="font-display text-2xl mt-1">{formatINR(selectedOrder.total)}</p>
                </div>
                <button
                  onClick={() => toast.success("Invoice generated! Downloading PDF...")}
                  className="inline-flex items-center gap-2 border border-foreground bg-foreground text-background px-5 py-3 text-xs uppercase tracking-wider font-semibold hover:bg-gold hover:text-gold-foreground transition-colors"
                >
                  <Download className="h-4 w-4" /> Download Invoice
                </button>
              </div>
            </div>
          ) : (
            /* Orders List */
            <div className="border border-border divide-y divide-border">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="p-6 flex flex-wrap justify-between items-center gap-6"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-gold stroke-1" />
                      <span className="font-display text-lg">
                        Order #{order.id.substring(0, 8).toUpperCase()}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-6 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />{" "}
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5 text-gold" /> {order.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Total Paid</p>
                      <p className="font-medium mt-1">{formatINR(order.total)}</p>
                    </div>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="border border-border px-4 py-2.5 text-xs uppercase tracking-wider font-medium hover:border-foreground"
                    >
                      Track Order
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
