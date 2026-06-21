"use client";

import Link from "next/link";
import { useRouter, usePathname, useSearchParams, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ScrollText, Search } from "lucide-react";
import { useState } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Combobox } from "@/components/combobox";
import { auditLogApi } from "@/lib/api";
import type { AuditLog } from "@/lib/types";

const RESOURCE_COLORS: Record<string, string> = {
  order: "bg-blue-50 text-blue-700",
  product: "bg-emerald-50 text-emerald-700",
  user: "bg-indigo-50 text-indigo-700",
  coupon: "bg-amber-50 text-amber-700",
  review: "bg-rose-50 text-rose-700",
  banner: "bg-purple-50 text-purple-700",
};

export default function AuditLogs() {
  const [search, setSearch] = useState("");
  const [resourceFilter, setResourceFilter] = useState("all");
  const [adminFilter, setAdminFilter] = useState("all");

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["admin-audit-logs"],
    queryFn: () => auditLogApi.list(200),
    refetchInterval: 120000,
  });

  const uniqueResources = Array.from(new Set(logs.map((l: AuditLog) => l.resource_type))).filter(
    Boolean,
  );
  const uniqueAdmins = Array.from(new Set(logs.map((l: AuditLog) => l.admin_email))).filter(
    Boolean,
  );

  const resourceOptions = [
    { value: "all", label: "All Resources" },
    ...uniqueResources.map((r) => ({
      value: r as string,
      label: String(r).charAt(0).toUpperCase() + String(r).slice(1),
    })),
  ];

  const adminOptions = [
    { value: "all", label: "All Admins" },
    ...uniqueAdmins.map((a) => ({ value: a as string, label: a as string })),
  ];

  const filtered = logs.filter((log: AuditLog) => {
    if (resourceFilter !== "all" && log.resource_type !== resourceFilter) return false;
    if (adminFilter !== "all" && log.admin_email !== adminFilter) return false;
    if (!search) return true;

    const s = search.toLowerCase();
    return (
      log.action?.toLowerCase().includes(s) ||
      log.resource_type?.toLowerCase().includes(s) ||
      log.admin_email?.toLowerCase().includes(s) ||
      log.resource_id?.toLowerCase().includes(s)
    );
  });

  return (
    <AdminLayout title="Audit Logs" subtitle="Record of all admin actions">
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search logs..."
            className="w-full border border-border bg-background pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-foreground h-[42px]"
          />
        </div>
        <Combobox
          options={resourceOptions}
          value={resourceFilter}
          onChange={setResourceFilter}
          className="w-full sm:w-48 shrink-0"
        />
        <Combobox
          options={adminOptions}
          value={adminFilter}
          onChange={setAdminFilter}
          className="w-full sm:w-64 shrink-0"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="border border-border p-3 h-14 animate-pulse bg-champagne/5" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-border">
          <ScrollText className="h-10 w-10 mx-auto text-muted-foreground stroke-1 mb-4" />
          <p className="font-display text-xl">No audit logs found</p>
          <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="border border-border divide-y divide-border">
          {/* Header */}
          <div className="grid grid-cols-[1fr_120px_200px_150px] gap-4 px-4 py-2 bg-champagne/10 text-[9px] uppercase tracking-widest text-muted-foreground">
            <span>Action</span>
            <span>Resource</span>
            <span>Admin</span>
            <span>Time</span>
          </div>
          {filtered.map((log: AuditLog) => (
            <div
              key={log.id}
              className="grid grid-cols-[1fr_120px_200px_150px] gap-4 items-center px-4 py-3 hover:bg-champagne/5 transition-colors"
            >
              <div>
                <p className="text-sm font-medium">{log.action}</p>
                {log.resource_id && (
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">
                    #{log.resource_id.slice(0, 8)}
                  </p>
                )}
              </div>
              <span
                className={`px-2 py-0.5 text-[10px] uppercase tracking-wider rounded font-medium ${RESOURCE_COLORS[log.resource_type] || "bg-muted text-muted-foreground"}`}
              >
                {log.resource_type}
              </span>
              <span className="text-xs text-muted-foreground">{log.admin_email || "System"}</span>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {new Date(log.created_at).toLocaleString("en-IN", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </span>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Showing {filtered.length} of {logs.length} log entries
      </p>
    </AdminLayout>
  );
}
