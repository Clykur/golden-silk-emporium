"use client";

import Link from "next/link";
import { formatINR } from "@/lib/types";
import { ArrowRight, Star } from "lucide-react";

interface TopProduct {
  id: string;
  name: string;
  category: string;
  revenue: number;
  units: number;
  orders: number;
  price?: number;
  stock?: number;
}

export function TopProductsTable({ data }: { data: TopProduct[] }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden flex flex-col h-full">
      <div className="px-5 py-4 border-b border-border flex justify-between items-center bg-gray-50/50">
        <div>
          <h3 className="font-semibold text-lg">Top Performers</h3>
          <p className="text-sm text-muted-foreground">Highest revenue generating products</p>
        </div>
        <Link
          href="/admin/analytics/products"
          className="text-sm font-medium text-gold hover:text-gold/80 flex items-center"
        >
          View All <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>

      <div className="flex-1 overflow-x-auto hide-scrollbar">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground bg-gray-50 uppercase border-b border-border">
            <tr>
              <th className="px-5 py-4 font-medium">Rank</th>
              <th className="px-5 py-4 font-medium">Product</th>
              <th className="px-5 py-4 font-medium">Category</th>
              <th className="px-5 py-4 font-medium text-right">Units</th>
              <th className="px-5 py-4 font-medium text-right">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((product, i) => (
              <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-5 py-4">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      i === 0
                        ? "bg-yellow-100 text-yellow-700"
                        : i === 1
                          ? "bg-gray-200 text-gray-700"
                          : i === 2
                            ? "bg-amber-100 text-amber-800"
                            : "bg-gray-50 text-muted-foreground"
                    }`}
                  >
                    {i + 1}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="font-medium text-foreground hover:text-gold transition-colors block max-w-[200px] truncate"
                  >
                    {product.name}
                  </Link>
                </td>
                <td className="px-5 py-4 text-muted-foreground">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                    {product.category}
                  </span>
                </td>
                <td className="px-5 py-4 text-right font-medium">{product.units}</td>
                <td className="px-5 py-4 text-right font-bold text-foreground">
                  {formatINR(product.revenue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
