"use client";

import Link from "next/link";
import { formatINR } from "@/lib/types";
import { Eye, ArrowRight } from "lucide-react";

export function RecentOrdersFeed({ orders }: { orders: any[] }) {
  if (!orders || orders.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden flex flex-col h-full">
      <div className="px-5 py-4 border-b border-border flex justify-between items-center bg-gray-50/50">
        <div>
          <h3 className="font-semibold text-lg">Recent Orders</h3>
          <p className="text-sm text-muted-foreground">Latest transactions</p>
        </div>
        <Link
          href="/admin/orders"
          className="text-sm font-medium text-gold hover:text-gold/80 flex items-center"
        >
          View All <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground bg-gray-50 uppercase border-b border-border sticky top-0">
            <tr>
              <th className="px-5 py-4 font-medium">Order</th>
              <th className="px-5 py-4 font-medium">Customer</th>
              <th className="px-5 py-4 font-medium">Date</th>
              <th className="px-5 py-4 font-medium text-right">Amount</th>
              <th className="px-5 py-4 font-medium text-center">Status</th>
              <th className="px-5 py-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.slice(0, 10).map((order) => {
              const itemsCount = Array.isArray(order.items) ? order.items.length : 1;
              const date = new Date(order.created_at).toLocaleDateString("en-IN", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4 font-medium text-foreground">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-medium">
                      {order.profile?.name || order.customer_name || "Guest"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {itemsCount} item{itemsCount > 1 ? "s" : ""}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{date}</td>
                  <td className="px-5 py-4 text-right font-bold">{formatINR(order.total)}</td>
                  <td className="px-5 py-4 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${
                        order.status === "completed"
                          ? "bg-emerald-100 text-emerald-700"
                          : order.status === "processing"
                            ? "bg-amber-100 text-amber-700"
                            : order.status === "cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/admin/orders?id=${order.id}`}
                      className="inline-flex p-2 hover:bg-gray-100 rounded-md transition-colors text-muted-foreground hover:text-foreground"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
