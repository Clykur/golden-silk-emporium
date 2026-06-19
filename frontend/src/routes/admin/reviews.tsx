import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/admin-layout";
import { reviewsApi } from "@/lib/api";
import type { Review } from "@/lib/types";
import { CheckCircle, Trash2, Star, Search, Filter } from "lucide-react";

export const Route = createFileRoute("/admin/reviews")({
  head: () => ({ meta: [{ title: "Reviews — Admin" }] }),
  component: AdminReviews,
});

function AdminReviews() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: reviewsApi.adminList,
  });

  const approveMut = useMutation({
    mutationFn: reviewsApi.approve,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-reviews"] }); toast.success("Review approved"); },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: reviewsApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-reviews"] }); toast.success("Review deleted"); },
    onError: (e: any) => toast.error(e.message),
  });

  const filtered = reviews.filter((r: Review) => {
    const matchSearch = !search || (r.reviewer_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.comment || "").toLowerCase().includes(search.toLowerCase()) || (r.product as any)?.name?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || (filter === "pending" ? !r.is_approved : r.is_approved);
    return matchSearch && matchFilter;
  });

  const pending = reviews.filter((r: Review) => !r.is_approved).length;
  const approved = reviews.filter((r: Review) => r.is_approved).length;

  return (
    <AdminLayout title="Reviews" subtitle={`${pending} pending moderation · ${approved} published`}>
      <div className="space-y-5">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search reviews..."
              className="w-full border border-border bg-background pl-9 pr-4 py-2.5 text-sm focus:outline-none" />
          </div>
          <div className="flex border border-border">
            {(["all", "pending", "approved"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 text-xs uppercase tracking-widest transition-colors ${filter === f ? "bg-foreground text-background" : "hover:bg-muted"}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-border">
            <Star className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
            <p className="font-display text-xl">No reviews found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((r: Review) => (
              <div key={r.id} className={`border bg-background p-5 transition-all ${!r.is_approved ? "border-amber-200 bg-amber-50/30" : "border-border"}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-gold text-gold" : "text-border"}`} />
                        ))}
                      </div>
                      {r.title && <span className="font-semibold text-sm">{r.title}</span>}
                      {!r.is_approved && <span className="text-[9px] uppercase tracking-widest bg-amber-100 text-amber-700 px-1.5 py-0.5 border border-amber-200">Pending</span>}
                      {r.is_approved && <span className="text-[9px] uppercase tracking-widest bg-emerald-50 text-emerald-600 px-1.5 py-0.5 border border-emerald-200">Approved</span>}
                    </div>
                    {r.comment && <p className="text-sm text-muted-foreground mt-2 leading-relaxed">"{r.comment}"</p>}
                    <div className="flex items-center gap-3 mt-3 text-[10px] text-muted-foreground">
                      <span className="font-medium">{r.reviewer_name || "Anonymous"}</span>
                      {(r as any).product && <span>on <a href={`/product/${(r as any).product.slug}`} className="text-gold hover:underline">{(r as any).product.name}</a></span>}
                      <span>{new Date(r.created_at).toLocaleDateString("en-IN")}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!r.is_approved && (
                      <button onClick={() => approveMut.mutate(r.id)}
                        className="inline-flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1.5 text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-colors">
                        <CheckCircle className="h-3.5 w-3.5" /> Approve
                      </button>
                    )}
                    <button onClick={() => { if (confirm("Delete this review?")) deleteMut.mutate(r.id); }}
                      className="p-2 hover:text-destructive transition-colors border border-border hover:border-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
