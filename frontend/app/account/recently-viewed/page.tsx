"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { User, LogOut, Package, MapPin, Settings, Heart, History } from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import { formatINR } from "@/lib/products";

export default function RecentlyViewed() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    const history = JSON.parse(localStorage.getItem("drapeva-recent-viewed") || "[]");
    setItems(history);
  }, [isAuthenticated, router]);

  const clearHistory = () => {
    localStorage.removeItem("drapeva-recent-viewed");
    setItems([]);
  };

  if (!user) return null;

  return (
    <div className="container-luxe py-12">
      <div className="grid gap-8 lg:grid-cols-[250px_1fr]">
        {/* Sidebar */}
        <aside className="border-b border-border pb-6 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-8">
          <div className="flex items-center gap-3 pb-6 border-b border-border">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-champagne text-gold font-display text-lg">
              {(user.name || user.email || "?").charAt(0)}
            </div>
            <div>
              <p className="font-medium text-sm">{user.name || user.email || "Valued Customer"}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <nav className="mt-6 space-y-1 text-xs uppercase tracking-widest font-medium text-muted-foreground">
            <Link
              href="/account"
              className="flex items-center gap-3 px-3 py-2 hover:text-foreground transition-colors"
            >
              <User className="h-4 w-4" /> Account Overview
            </Link>
            <Link
              href="/account/orders"
              className="flex items-center gap-3 px-3 py-2 hover:text-foreground transition-colors"
            >
              <Package className="h-4 w-4" /> Order History
            </Link>
            <Link
              href="/account/addresses"
              className="flex items-center gap-3 px-3 py-2 hover:text-foreground transition-colors"
            >
              <MapPin className="h-4 w-4" /> Address Book
            </Link>
            <Link
              href="/account/profile"
              className="flex items-center gap-3 px-3 py-2 hover:text-foreground transition-colors"
            >
              <Settings className="h-4 w-4" /> Profile Settings
            </Link>
            <button
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-destructive hover:text-destructive/80 text-left cursor-pointer"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </nav>
        </aside>

        {/* Content */}
        <main className="space-y-8">
          <div className="flex justify-between items-baseline flex-wrap gap-4 border-b border-border pb-5">
            <div>
              <p className="eyebrow text-gold">Browse history</p>
              <h1 className="mt-1 font-display text-3xl">Recently Viewed</h1>
            </div>
            {items.length > 0 && (
              <button
                onClick={clearHistory}
                className="text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground border-b border-foreground pb-0.5"
              >
                Clear History
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-border">
              <History className="h-10 w-10 mx-auto text-muted-foreground stroke-1" />
              <p className="mt-4 text-sm text-muted-foreground font-display">
                No browsing history found.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 md:gap-x-8">
              {items.map((p) => (
                <div key={p.id} className="group relative block overflow-hidden">
                  <Link href={`/product/${p.id}`} className="block">
                    <div className="aspect-[3/4] overflow-hidden bg-champagne/40">
                      <img
                        src={p.image}
                        alt={p.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-105"
                      />
                    </div>
                    <div className="mt-4 flex justify-between gap-4">
                      <div>
                        <p className="font-display text-base group-hover:text-gold transition-colors">
                          {p.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{p.collection}</p>
                      </div>
                      <p className="text-sm font-medium">{formatINR(p.price)}</p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
