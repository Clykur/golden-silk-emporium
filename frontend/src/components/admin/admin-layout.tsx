import { Link, useRouter } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/lib/auth-store";
import { toast } from "sonner";
import {
  LayoutDashboard, ShoppingBag, Tags, Layers, FileText,
  Star, Ticket, Package, Home, BarChart2, Users,
  LogOut, ChevronRight, HelpCircle, Bell, ScrollText, TrendingUp,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: ShoppingBag },
  { to: "/admin/categories", label: "Categories", icon: Tags },
  { to: "/admin/collections", label: "Collections", icon: Layers },
  { to: "/admin/orders", label: "Orders", icon: FileText },
  { to: "/admin/inventory", label: "Inventory", icon: Package },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
  { to: "/admin/coupons", label: "Coupons", icon: Ticket },
  { to: "/admin/homepage", label: "Homepage", icon: Home },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/analytics", label: "Analytics", icon: TrendingUp },
  { to: "/admin/support", label: "Support Tickets", icon: HelpCircle },
  { to: "/admin/audit-logs", label: "Audit Logs", icon: ScrollText },
];

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  activeHref?: string;
}

export function AdminLayout({ children, title, subtitle, actions, activeHref }: AdminLayoutProps) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error("Please sign in to access the admin panel");
      router.navigate({ to: "/auth/login" });
    } else if (!isAdmin()) {
      toast.error("Admin access required");
      router.navigate({ to: "/" });
    }
  }, [user]);

  if (!user || !isAdmin()) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.navigate({ to: "/auth/login" });
  };

  const currentPath = typeof window !== "undefined" ? window.location.pathname : activeHref || "/admin";

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-background">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-border px-6">
          <div className="h-7 w-7 rounded bg-gold/20 grid place-items-center">
            <BarChart2 className="h-4 w-4 text-gold" />
          </div>
          <div>
            <p className="font-display text-sm tracking-widest text-gold">ATELIER CMS</p>
            <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Admin Console</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map(({ to, label, icon: Icon, exact }: any) => {
            const isActive = exact
              ? currentPath === to || currentPath === `${to}/`
              : to !== "/admin" && (currentPath === to || currentPath.startsWith(to));
            return (
              <Link
                key={to}
                to={to as any}
                className={`group flex items-center gap-3 rounded px-3 py-2.5 text-xs font-semibold uppercase tracking-widest transition-all ${
                  isActive
                    ? "bg-gold/10 text-gold"
                    : "text-muted-foreground hover:bg-champagne/40 hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight className="h-3 w-3 opacity-50" />}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-full bg-gold/20 grid place-items-center text-gold font-semibold text-xs">
              {user.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate">{user.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-destructive transition-colors py-1"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center border-b border-border bg-background/95 backdrop-blur px-8 gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-lg truncate">{title}</h1>
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
        </header>

        {/* Page content */}
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
