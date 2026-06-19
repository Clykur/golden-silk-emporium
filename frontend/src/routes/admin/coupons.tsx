import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/admin-layout";
import { couponsApi } from "@/lib/api";
import type { Coupon } from "@/lib/types";
import { Plus, Edit, Trash2, Ticket, Copy } from "lucide-react";
import { formatINR } from "@/lib/types";

export const Route = createFileRoute("/admin/coupons")({
  head: () => ({ meta: [{ title: "Coupons — Admin" }] }),
  component: AdminCoupons,
});

const empty = {
  code: "", discount_type: "percentage" as "percentage" | "fixed",
  discount_value: 10, min_order_value: 0, max_discount_value: null as null | number,
  usage_limit: null as null | number, expires_at: null as null | string, is_active: true,
};

function AdminCoupons() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(empty);

  const { data: coupons = [], isLoading } = useQuery({ queryKey: ["admin-coupons"], queryFn: couponsApi.adminList });

  const createMut = useMutation({
    mutationFn: (d: typeof empty) => couponsApi.create(d as any),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-coupons"] }); toast.success("Coupon created"); resetForm(); },
    onError: (e: any) => toast.error(e.message),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, d }: { id: string; d: Partial<typeof empty> }) => couponsApi.update(id, d as any),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-coupons"] }); toast.success("Coupon updated"); resetForm(); },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: couponsApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-coupons"] }); toast.success("Coupon deleted"); },
    onError: (e: any) => toast.error(e.message),
  });

  const resetForm = () => { setForm(empty); setEditId(null); setShowForm(false); };
  const startEdit = (c: Coupon) => {
    setForm({
      code: c.code, discount_type: c.discount_type, discount_value: c.discount_value,
      min_order_value: c.min_order_value, max_discount_value: c.max_discount_value,
      usage_limit: c.usage_limit, expires_at: c.expires_at ? c.expires_at.slice(0, 10) : null, is_active: c.is_active,
    });
    setEditId(c.id); setShowForm(true);
  };
  const setField = <K extends keyof typeof empty>(k: K, v: (typeof empty)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const d = { ...form, code: form.code.toUpperCase() };
    if (editId) updateMut.mutate({ id: editId, d });
    else createMut.mutate(d);
  };

  const activeCoupons = coupons.filter((c: Coupon) => c.is_active).length;

  return (
    <AdminLayout title="Coupons" subtitle={`${activeCoupons} active coupons`}
      actions={
        showForm ? (
          <div className="flex gap-3">
            <button type="button" onClick={resetForm} className="border border-border px-5 py-2.5 text-xs uppercase tracking-widest hover:bg-muted">Cancel</button>
            <button onClick={handleSubmit} className="bg-foreground text-background px-6 py-2.5 text-xs uppercase tracking-widest hover:bg-gold hover:text-gold-foreground transition-colors">
              {editId ? "Update" : "Create Coupon"}
            </button>
          </div>
        ) : (
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 bg-foreground text-background px-5 py-2.5 text-xs uppercase tracking-widest hover:bg-gold hover:text-gold-foreground transition-colors">
            <Plus className="h-4 w-4" /> New Coupon
          </button>
        )
      }>
      {showForm ? (
        <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
          <div className="border border-border p-6 space-y-4 bg-background">
            <label className="block">
              <span className="eyebrow text-[10px] mb-1.5 block">Coupon Code *</span>
              <input value={form.code} onChange={(e) => setField("code", e.target.value.toUpperCase())}
                required className={inp} placeholder="DIWALI20" />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="eyebrow text-[10px] mb-1.5 block">Discount Type</span>
                <select value={form.discount_type} onChange={(e) => setField("discount_type", e.target.value as "percentage" | "fixed")} className={inp}>
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </label>
              <label className="block">
                <span className="eyebrow text-[10px] mb-1.5 block">Discount Value *</span>
                <input type="number" value={form.discount_value} onChange={(e) => setField("discount_value", parseFloat(e.target.value) || 0)}
                  required className={inp} min={0} placeholder={form.discount_type === "percentage" ? "20" : "500"} />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="eyebrow text-[10px] mb-1.5 block">Min Order Value (₹)</span>
                <input type="number" value={form.min_order_value} onChange={(e) => setField("min_order_value", parseFloat(e.target.value) || 0)} className={inp} min={0} />
              </label>
              <label className="block">
                <span className="eyebrow text-[10px] mb-1.5 block">Max Discount (₹)</span>
                <input type="number" value={form.max_discount_value || ""} onChange={(e) => setField("max_discount_value", parseFloat(e.target.value) || null)} className={inp} min={0} placeholder="No limit" />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="eyebrow text-[10px] mb-1.5 block">Usage Limit</span>
                <input type="number" value={form.usage_limit || ""} onChange={(e) => setField("usage_limit", parseInt(e.target.value) || null)} className={inp} min={1} placeholder="Unlimited" />
              </label>
              <label className="block">
                <span className="eyebrow text-[10px] mb-1.5 block">Expiry Date</span>
                <input type="date" value={form.expires_at || ""} onChange={(e) => setField("expires_at", e.target.value || null)} className={inp} />
              </label>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <div onClick={() => setField("is_active", !form.is_active)} className={`relative h-5 w-9 rounded-full transition-colors ${form.is_active ? "bg-gold" : "bg-border"}`}>
                <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${form.is_active ? "translate-x-4" : "translate-x-0.5"}`} />
              </div>
              <span className="text-sm">Active</span>
            </label>
          </div>
        </form>
      ) : (
        isLoading ? (
          <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" /></div>
        ) : (
          <div className="space-y-3">
            {coupons.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-border">
                <Ticket className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                <p className="font-display text-xl">No coupons yet</p>
                <button onClick={() => setShowForm(true)} className="mt-6 inline-flex items-center gap-2 bg-foreground text-background px-5 py-2.5 text-xs uppercase tracking-widest">
                  <Plus className="h-4 w-4" /> Create Coupon
                </button>
              </div>
            ) : coupons.map((c: Coupon) => (
              <div key={c.id} className={`border bg-background p-5 flex items-center gap-5 ${!c.is_active ? "opacity-50" : "border-border"}`}>
                <div className="bg-gold/10 border border-gold/20 px-4 py-3 text-center min-w-[120px]">
                  <p className="font-mono text-lg font-bold tracking-widest text-gold">{c.code}</p>
                  <p className="text-[9px] uppercase tracking-wider text-gold/70 mt-0.5">
                    {c.discount_type === "percentage" ? `${c.discount_value}% OFF` : `₹${c.discount_value} OFF`}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                    {c.min_order_value > 0 && <span>Min: {formatINR(c.min_order_value)}</span>}
                    {c.max_discount_value && <span>Max: {formatINR(c.max_discount_value)}</span>}
                    {c.usage_limit && <span>Limit: {c.usage_count}/{c.usage_limit} used</span>}
                    {c.expires_at && <span>Expires: {new Date(c.expires_at).toLocaleDateString("en-IN")}</span>}
                    <span className={`inline-block px-1.5 py-0.5 text-[9px] uppercase tracking-wider rounded border ${c.is_active ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-muted text-muted-foreground border-border"}`}>
                      {c.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => { navigator.clipboard.writeText(c.code); toast.success("Coupon code copied!"); }}
                    className="p-2 hover:text-gold transition-colors" title="Copy code"><Copy className="h-4 w-4" /></button>
                  <button onClick={() => startEdit(c)} className="p-2 hover:text-gold transition-colors" title="Edit"><Edit className="h-4 w-4" /></button>
                  <button onClick={() => { if (confirm(`Delete coupon ${c.code}?`)) deleteMut.mutate(c.id); }}
                    className="p-2 hover:text-destructive transition-colors" title="Delete"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </AdminLayout>
  );
}

const inp = "w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors";
