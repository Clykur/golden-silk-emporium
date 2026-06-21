"use client";

import Link from "next/link";
import { useRouter, usePathname, useSearchParams, useParams } from "next/navigation";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/admin-layout";
import { productsApi } from "@/lib/api";
import { formatINR } from "@/lib/types";
import type { Product } from "@/lib/types";
import { Package, AlertTriangle, ArrowUp, ArrowDown, Search } from "lucide-react";

export default function AdminInventory() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState<"all" | "low" | "out">("all");
  const [editing, setEditing] = useState<Record<string, string>>({});

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: productsApi.adminList,
  });

  const updateStockMut = useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      productsApi.updateStock(id, quantity),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Stock updated");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const filtered = products.filter((p: Product) => {
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku || "").toLowerCase().includes(search.toLowerCase());
    if (stockFilter === "out") return matchSearch && p.stock_quantity === 0;
    if (stockFilter === "low") return matchSearch && p.stock_quantity > 0 && p.stock_quantity <= 3;
    return matchSearch;
  });

  const outOfStock = products.filter((p: Product) => p.stock_quantity === 0).length;
  const lowStock = products.filter(
    (p: Product) => p.stock_quantity > 0 && p.stock_quantity <= 3,
  ).length;

  const handleStockUpdate = (id: string) => {
    const qty = parseInt(editing[id] || "0");
    if (isNaN(qty) || qty < 0) {
      toast.error("Enter a valid quantity");
      return;
    }
    updateStockMut.mutate({ id, quantity: qty });
    setEditing((e) => {
      const n = { ...e };
      delete n[id];
      return n;
    });
  };

  return (
    <AdminLayout title="Inventory" subtitle="Manage stock levels across all products">
      <div className="space-y-5">
        {/* Alerts */}
        {(outOfStock > 0 || lowStock > 0) && (
          <div className="flex items-start gap-3 border border-amber-200 bg-amber-50 px-5 py-4 rounded text-sm">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-amber-800">
              {outOfStock > 0 && (
                <p>
                  <strong>{outOfStock} products are out of stock.</strong> Restock immediately to
                  avoid lost sales.
                </p>
              )}
              {lowStock > 0 && <p>{lowStock} products have 5 or fewer units remaining.</p>}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full border border-border bg-background pl-9 pr-4 py-2.5 text-sm focus:outline-none"
            />
          </div>
          <div className="flex border border-border">
            {(["all", "low", "out"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setStockFilter(f)}
                className={`px-4 py-2 text-xs uppercase tracking-widest transition-colors ${stockFilter === f ? "bg-foreground text-background" : "hover:bg-muted"}`}
              >
                {f === "all" ? "All" : f === "low" ? "Low Stock" : "Out of Stock"}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
          </div>
        ) : (
          <div className="overflow-x-auto border border-border">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-champagne/10">
                  <th className="p-4 eyebrow text-[9px] w-12" />
                  <th className="p-4 eyebrow text-[9px]">Product</th>
                  <th className="p-4 eyebrow text-[9px]">SKU</th>
                  <th className="p-4 eyebrow text-[9px]">Price</th>
                  <th className="p-4 eyebrow text-[9px]">Current Stock</th>
                  <th className="p-4 eyebrow text-[9px]">Status</th>
                  <th className="p-4 eyebrow text-[9px]">Update Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((p: Product) => {
                  const isEditing = p.id in editing;
                  const stockStatus =
                    p.stock_quantity === 0 ? "out" : p.stock_quantity <= 3 ? "low" : "ok";
                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-champagne/5 ${stockStatus === "out" ? "bg-red-50/30" : stockStatus === "low" ? "bg-amber-50/30" : ""}`}
                    >
                      <td className="p-4">
                        <img
                          src={p.image || "/media/placeholder-saree.jpg"}
                          className="h-10 w-8 object-cover border border-border"
                        />
                      </td>
                      <td className="p-4">
                        <p className="font-medium line-clamp-2 max-w-[200px]">{p.name}</p>
                        <p className="text-[10px] text-muted-foreground">{p.collection?.name}</p>
                      </td>
                      <td className="p-4 font-mono text-xs text-muted-foreground">
                        {p.sku || "—"}
                      </td>
                      <td className="p-4 font-semibold text-gold">{formatINR(p.price)}</td>
                      <td className="p-4">
                        <span
                          className={`text-base font-display ${stockStatus === "out" ? "text-destructive" : stockStatus === "low" ? "text-amber-600" : ""}`}
                        >
                          {p.stock_quantity}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">units</span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${
                            stockStatus === "out"
                              ? "bg-red-50 text-red-600 border-red-200"
                              : stockStatus === "low"
                                ? "bg-amber-50 text-amber-600 border-amber-200"
                                : "bg-emerald-50 text-emerald-600 border-emerald-200"
                          }`}
                        >
                          {stockStatus === "out"
                            ? "Out of Stock"
                            : stockStatus === "low"
                              ? "Low Stock"
                              : "In Stock"}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center border border-border">
                            <button
                              onClick={() =>
                                setEditing((e) => ({
                                  ...e,
                                  [p.id]: String(
                                    Math.max(0, parseInt(e[p.id] || String(p.stock_quantity)) - 1),
                                  ),
                                }))
                              }
                              className="px-2 py-1.5 hover:bg-muted transition-colors"
                            >
                              <ArrowDown className="h-3 w-3" />
                            </button>
                            <input
                              type="number"
                              value={isEditing ? editing[p.id] : p.stock_quantity}
                              onChange={(e) =>
                                setEditing((ev) => ({ ...ev, [p.id]: e.target.value }))
                              }
                              onFocus={() => {
                                if (!isEditing)
                                  setEditing((e) => ({ ...e, [p.id]: String(p.stock_quantity) }));
                              }}
                              className="w-16 bg-transparent px-2 py-1.5 text-sm text-center focus:outline-none"
                              min={0}
                            />
                            <button
                              onClick={() =>
                                setEditing((e) => ({
                                  ...e,
                                  [p.id]: String(parseInt(e[p.id] || String(p.stock_quantity)) + 1),
                                }))
                              }
                              className="px-2 py-1.5 hover:bg-muted transition-colors"
                            >
                              <ArrowUp className="h-3 w-3" />
                            </button>
                          </div>
                          {isEditing && (
                            <button
                              onClick={() => handleStockUpdate(p.id)}
                              className="bg-foreground text-background px-3 py-1.5 text-[10px] uppercase tracking-widest hover:bg-gold hover:text-gold-foreground transition-colors"
                            >
                              Save
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
