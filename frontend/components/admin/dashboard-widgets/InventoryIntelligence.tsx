"use client";

import Link from "next/link";
import { formatINR } from "@/lib/types";
import { ArrowRight, Boxes, AlertCircle } from "lucide-react";

interface InventoryItem {
  id: string;
  name: string;
  stock: number;
  value: number;
  status: string;
}

interface InventoryData {
  totalValue: number;
  lowStock: number;
  outOfStock: number;
  table: InventoryItem[];
}

export function InventoryIntelligence({ data }: { data: InventoryData }) {
  if (!data) return null;

  const healthScore = Math.max(0, 100 - data.outOfStock * 5 - data.lowStock * 2);
  let healthColor = "text-emerald-500";
  if (healthScore < 70) healthColor = "text-amber-500";
  if (healthScore < 40) healthColor = "text-red-500";

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden flex flex-col h-full">
      <div className="px-5 py-4 border-b border-border bg-gray-50/50 flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-lg">Inventory Health</h3>
          <p className="text-sm text-muted-foreground">Value and stock alerts</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-muted-foreground">Health Score</div>
          <div className={`text-2xl font-bold ${healthColor}`}>{healthScore}%</div>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg text-center border border-border">
            <div className="text-muted-foreground text-xs font-medium uppercase tracking-wider mb-1">
              Total Value
            </div>
            <div className="text-xl font-bold text-foreground">{formatINR(data.totalValue)}</div>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg text-center border border-amber-200">
            <div className="text-amber-700 text-xs font-medium uppercase tracking-wider mb-1">
              Low Stock
            </div>
            <div className="text-xl font-bold text-amber-600">{data.lowStock}</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center border border-red-200">
            <div className="text-red-700 text-xs font-medium uppercase tracking-wider mb-1">
              Out of Stock
            </div>
            <div className="text-xl font-bold text-red-600">{data.outOfStock}</div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-gray-50 uppercase border-y border-border">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium text-right">Stock</th>
                <th className="px-4 py-3 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.table.slice(0, 5).map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium truncate max-w-[150px]">{item.name}</td>
                  <td className="px-4 py-3 text-right font-semibold">{item.stock}</td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${
                        item.stock === 0
                          ? "bg-red-100 text-red-700"
                          : item.stock <= 5
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {item.stock === 0
                        ? "Out of Stock"
                        : item.stock <= 5
                          ? "Low Stock"
                          : "In Stock"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pt-4 mt-auto border-t border-border text-center">
          <Link
            href="/admin/products"
            className="text-sm text-gold hover:text-gold/80 font-medium inline-flex items-center"
          >
            Manage Inventory <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
