"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, TrendingUp, Package, Users, Target, ShoppingCart } from "lucide-react";

const NAV_ITEMS = [
  { to: "/admin/analytics", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/analytics/sales", label: "Sales & Orders", icon: TrendingUp },
  { to: "/admin/analytics/products", label: "Products & Inventory", icon: Package },
  { to: "/admin/analytics/customers", label: "Customers & Geography", icon: Users },
  { to: "/admin/analytics/marketing", label: "Marketing & Funnel", icon: Target },
];

export function AnalyticsNav() {
  const pathname = usePathname();

  return (
    <div className="flex border-b border-border mb-6 overflow-x-auto hide-scrollbar">
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
        const isActive = pathname === to;
        return (
          <Link
            key={to}
            href={to}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 -mb-[2px] transition-all whitespace-nowrap ${
              isActive
                ? "border-gold text-gold"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </div>
  );
}
