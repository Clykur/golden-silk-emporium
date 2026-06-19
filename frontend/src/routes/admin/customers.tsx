import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/admin-layout";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/lib/types";
import { Search, Users, Mail, Phone } from "lucide-react";

export const Route = createFileRoute("/admin/customers")({
  head: () => ({ meta: [{ title: "Customers — Admin" }] }),
  component: AdminCustomers,
});

function AdminCustomers() {
  const [search, setSearch] = useState("");

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "customer")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const filtered = customers.filter((c: Profile) =>
    !search || (c.name || "").toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="Customers" subtitle={`${customers.length} registered customers`}>
      <div className="space-y-5">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers..."
            className="w-full border border-border bg-background pl-9 pr-4 py-2.5 text-sm focus:outline-none" />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-border">
            <Users className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
            <p className="font-display text-xl">No customers found</p>
            <p className="text-sm text-muted-foreground mt-2">Customers will appear here after they register.</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-border">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-champagne/10">
                  <th className="p-4 eyebrow text-[9px]">Name</th>
                  <th className="p-4 eyebrow text-[9px]">Email</th>
                  <th className="p-4 eyebrow text-[9px]">Phone</th>
                  <th className="p-4 eyebrow text-[9px]">Role</th>
                  <th className="p-4 eyebrow text-[9px]">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((c: Profile) => (
                  <tr key={c.id} className="hover:bg-champagne/5">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gold/10 grid place-items-center text-gold font-semibold text-xs shrink-0">
                          {(c.name || c.email).charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{c.name || "—"}</span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        {c.email}
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {c.phone ? (
                        <div className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{c.phone}</div>
                      ) : "—"}
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 border rounded ${c.role === "admin" ? "bg-gold/10 text-gold border-gold/20" : "bg-muted text-muted-foreground border-border"}`}>
                        {c.role}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-muted-foreground">
                      {new Date(c.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
