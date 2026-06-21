"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/admin-layout";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-store";
import { ordersApi } from "@/lib/api";
import type { Profile } from "@/lib/types";
import {
  Search,
  Users,
  Mail,
  Phone,
  Shield,
  ShieldAlert,
  UserCheck,
  RefreshCw,
  ChevronLeft,
  Package,
  Calendar,
} from "lucide-react";

export default function AdminCustomers() {
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "customer" | "admin">("all");
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const queryClient = useQueryClient();

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: userOrders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ["admin-customer-orders", selectedUser?.id],
    queryFn: () => ordersApi.getUserOrders(selectedUser!.id),
    enabled: !!selectedUser,
  });

  const toggleRoleMut = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: "customer" | "admin" }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ role, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
      toast.success("User role updated successfully");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update role");
    },
  });

  const handleRoleToggle = (e: React.MouseEvent, profile: Profile) => {
    e.stopPropagation();
    if (profile.id === currentUser?.id) {
      toast.error("You cannot demote or modify your own admin role.");
      return;
    }
    const newRole = profile.role === "admin" ? "customer" : "admin";
    const confirmMsg = `Are you sure you want to change ${profile.name || profile.email}'s role to ${newRole.toUpperCase()}?`;
    if (confirm(confirmMsg)) {
      toggleRoleMut.mutate({ id: profile.id, role: newRole });
    }
  };

  const filtered = customers.filter(
    (c: Profile) =>
      (!search ||
        (c.name || "").toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.customer_id?.toLowerCase().includes(search.toLowerCase())) &&
      (roleFilter === "all" || c.role === roleFilter),
  );

  const customerCount = customers.filter((c) => c.role === "customer").length;
  const adminCount = customers.filter((c) => c.role === "admin").length;

  return (
    <AdminLayout title="User Management" subtitle={`${customers.length} registered users total`}>
      <div className="space-y-6">
        {!selectedUser ? (
          <>
            {/* Filter and Search Bar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Role filter tabs */}
              <div className="flex border-b border-border">
                <button
                  onClick={() => setRoleFilter("all")}
                  className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 -mb-[2px] transition-all ${
                    roleFilter === "all"
                      ? "border-gold text-gold"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All Roles ({customers.length})
                </button>
                <button
                  onClick={() => setRoleFilter("customer")}
                  className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 -mb-[2px] transition-all ${
                    roleFilter === "customer"
                      ? "border-gold text-gold"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Customers ({customerCount})
                </button>
                <button
                  onClick={() => setRoleFilter("admin")}
                  className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 -mb-[2px] transition-all ${
                    roleFilter === "admin"
                      ? "border-gold text-gold"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Admins ({adminCount})
                </button>
              </div>

              <div className="relative max-w-sm w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, email, or Customer ID..."
                  className="w-full border border-border bg-background pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-border bg-background">
                <Users className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                <p className="font-display text-xl">No users found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your filters or search term.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-border bg-background">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-champagne/10">
                      <th className="p-4 eyebrow text-[9px] uppercase tracking-wider">
                        User Details
                      </th>
                      <th className="p-4 eyebrow text-[9px] uppercase tracking-wider">Contact</th>
                      <th className="p-4 eyebrow text-[9px] uppercase tracking-wider">Role</th>
                      <th className="p-4 eyebrow text-[9px] uppercase tracking-wider">Joined</th>
                      <th className="p-4 eyebrow text-[9px] uppercase tracking-wider text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.map((c: Profile) => (
                      <tr
                        key={c.id}
                        onClick={() => {
                          if (c.role === "customer") setSelectedUser(c);
                        }}
                        className={`transition-colors ${c.role === "customer" ? "cursor-pointer hover:bg-champagne/10" : "hover:bg-champagne/5"}`}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-gold/10 grid place-items-center text-gold font-semibold text-xs shrink-0 border border-gold/20">
                              {(c.name || c.email).charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-medium text-foreground block">
                                {c.name || "—"}
                              </span>
                              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                                {c.customer_id || c.id.slice(0, 8)}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs">
                              <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground/75" />
                              <span>{c.email}</span>
                            </div>
                            {c.phone && (
                              <div className="flex items-center gap-1.5 text-xs">
                                <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground/75" />
                                <span>{c.phone}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`text-[9px] font-semibold uppercase tracking-widest px-2.5 py-1 border rounded-full inline-flex items-center gap-1 ${
                              c.role === "admin"
                                ? "bg-amber-50 text-amber-800 border-amber-200"
                                : "bg-stone-50 text-stone-700 border-stone-200"
                            }`}
                          >
                            {c.role === "admin" ? (
                              <>
                                <Shield className="h-3 w-3 text-amber-600" />
                                Admin
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-3 w-3 text-stone-500" />
                                Customer
                              </>
                            )}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-muted-foreground">
                          {new Date(c.created_at).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="p-4 text-right">
                          {c.id === currentUser?.id ? (
                            <span className="text-xs text-muted-foreground italic px-3 py-1.5 bg-stone-100/60 rounded border border-stone-200">
                              Your Account
                            </span>
                          ) : (
                            <button
                              onClick={(e) => handleRoleToggle(e, c)}
                              disabled={toggleRoleMut.isPending}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer rounded ${
                                c.role === "admin"
                                  ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-600 hover:text-white hover:border-red-600"
                                  : "bg-gold/10 text-gold border-gold/20 hover:bg-gold hover:text-gold-foreground hover:border-gold"
                              }`}
                            >
                              {toggleRoleMut.isPending && toggleRoleMut.variables?.id === c.id ? (
                                <RefreshCw className="h-3 w-3 animate-spin" />
                              ) : c.role === "admin" ? (
                                <>
                                  <ShieldAlert className="h-3 w-3" />
                                  Demote
                                </>
                              ) : (
                                <>
                                  <Shield className="h-3 w-3" />
                                  Promote
                                </>
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <div className="bg-background border border-border w-full">
            <div className="border-b border-border p-6 flex items-center justify-between">
              <div>
                <h3 className="font-display text-xl text-foreground">Customer History</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Viewing details for {selectedUser.name || selectedUser.email}
                </p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-border text-xs uppercase tracking-widest hover:border-foreground transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Back to Users
              </button>
            </div>
            <div className="p-6 space-y-8">
              {/* Customer summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 border border-border bg-champagne/5">
                  <p className="eyebrow text-[9px] mb-3 text-muted-foreground">Profile Info</p>
                  <p className="font-medium text-sm">{selectedUser.name || "—"}</p>
                  <p className="text-xs text-muted-foreground mt-1">{selectedUser.email}</p>
                  {selectedUser.phone && (
                    <p className="text-xs text-muted-foreground">{selectedUser.phone}</p>
                  )}
                </div>
                <div className="p-4 border border-border bg-champagne/5">
                  <p className="eyebrow text-[9px] mb-3 text-muted-foreground">Account Status</p>
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 border rounded-full inline-flex items-center gap-1 bg-stone-50 text-stone-700 border-stone-200">
                    <UserCheck className="h-3 w-3 text-stone-500" /> Customer
                  </span>
                  <p className="text-xs text-muted-foreground mt-3">
                    Joined: {new Date(selectedUser.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="p-4 border border-border bg-champagne/5">
                  <p className="eyebrow text-[9px] mb-3 text-muted-foreground">Order Statistics</p>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-muted-foreground">Total Orders</span>
                    <span className="font-medium text-sm">{userOrders.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Total Spent</span>
                    <span className="font-medium text-sm">
                      ₹
                      {userOrders
                        .reduce((sum: number, order: any) => sum + (order.total || 0), 0)
                        .toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Orders history */}
              <div>
                <p className="eyebrow text-[10px] mb-4">Order History</p>
                {loadingOrders ? (
                  <div className="py-10 flex justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-gold border-t-transparent" />
                  </div>
                ) : userOrders.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-border">
                    <Package className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm font-medium">No orders yet</p>
                    <p className="text-xs text-muted-foreground">
                      This customer hasn't placed any orders.
                    </p>
                  </div>
                ) : (
                  <div className="border border-border">
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr className="bg-champagne/10 border-b border-border">
                          <th className="p-3 eyebrow text-[9px] uppercase">Order ID</th>
                          <th className="p-3 eyebrow text-[9px] uppercase">Date</th>
                          <th className="p-3 eyebrow text-[9px] uppercase">Amount</th>
                          <th className="p-3 eyebrow text-[9px] uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {userOrders.map((order: any) => (
                          <tr key={order.id} className="hover:bg-champagne/5">
                            <td className="p-3 text-xs uppercase font-medium">
                              {order.order_number || order.id.slice(0, 8)}
                            </td>
                            <td className="p-3 text-xs text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString()}
                            </td>
                            <td className="p-3 text-xs font-medium">
                              ₹{order.total.toLocaleString("en-IN")}
                            </td>
                            <td className="p-3">
                              <span className="text-[9px] uppercase tracking-widest px-2 py-0.5 border rounded-full bg-stone-50 border-stone-200">
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
