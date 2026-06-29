"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/admin-layout";
import { couponsApi } from "@/lib/api";
import type { Coupon } from "@/lib/types";
import { Plus, Edit, Trash2, Ticket, X } from "lucide-react";
import { formatINR } from "@/lib/types";
import { Combobox } from "@/components/combobox";

const empty = {
  code: "",
  discount_type: "percentage" as "percentage" | "fixed",
  discount_value: 10,
  min_order_value: 0,
  max_discount_value: null as null | number,
  usage_limit: null as null | number,
  expires_at: null as null | string,
  is_active: true,
};

export default function AdminCoupons() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(empty);

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ["admin-coupons"],
    queryFn: couponsApi.adminList,
  });
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") resetForm();
    };

    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, []);
  const createMut = useMutation({
    mutationFn: (d: typeof empty) => couponsApi.create(d as any),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-coupons"] });
      toast.success("Coupon created");
      resetForm();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, d }: { id: string; d: Partial<typeof empty> }) =>
      couponsApi.update(id, d as any),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-coupons"] });
      toast.success("Coupon updated");
      resetForm();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: couponsApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-coupons"] });
      toast.success("Coupon deleted");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const resetForm = () => {
    setForm(empty);
    setEditId(null);
    setShowForm(false);
  };
  const startEdit = (c: Coupon) => {
    setForm({
      code: c.code,
      discount_type: c.discount_type,
      discount_value: c.discount_value,
      min_order_value: c.min_order_value,
      max_discount_value: c.max_discount_value,
      usage_limit: c.usage_limit,
      expires_at: c.expires_at ? c.expires_at.slice(0, 10) : null,
      is_active: c.is_active,
    });
    setEditId(c.id);
    setShowForm(true);
  };
  const setField = <K extends keyof typeof empty>(k: K, v: (typeof empty)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const d = { ...form, code: form.code.toUpperCase() };
    if (editId) updateMut.mutate({ id: editId, d });
    else createMut.mutate(d);
  };

  const activeCoupons = coupons.filter((c: Coupon) => c.is_active).length;

  return (
    <AdminLayout
      title="Coupons"
      subtitle={`${activeCoupons} active coupons`}
      actions={
        <button
          onClick={() => {
            setEditId(null);
            setForm(empty);
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 bg-foreground text-background px-5 py-2.5 text-xs uppercase tracking-widest"
        >
          <Plus className="h-4 w-4" />
          New Coupon
        </button>
      }
    >
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-3">
          {coupons.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-border">
              <Ticket className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
              <p className="font-display text-xl">No coupons yet</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-6 inline-flex items-center gap-2 bg-foreground text-background px-5 py-2.5 text-xs uppercase tracking-widest"
              >
                <Plus className="h-4 w-4" /> Create Coupon
              </button>
            </div>
          ) : (
            coupons.map((c: Coupon) => (
              <div
                key={c.id}
                className={`border bg-background p-5 flex items-center gap-5 ${!c.is_active ? "opacity-50" : "border-border"}`}
              >
                <div className="bg-gold/10 border border-gold/20 px-4 py-3 text-center min-w-[120px]">
                  <p className="font-mono text-lg font-bold tracking-widest text-gold">{c.code}</p>
                  <p className="text-[9px] uppercase tracking-wider text-gold/70 mt-0.5">
                    {c.discount_type === "percentage"
                      ? `${c.discount_value}% OFF`
                      : `₹${c.discount_value} OFF`}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                    {c.min_order_value > 0 && <span>Min: {formatINR(c.min_order_value)}</span>}
                    {c.max_discount_value && <span>Max: {formatINR(c.max_discount_value)}</span>}
                    {c.usage_limit && (
                      <span>
                        Limit: {c.usage_count}/{c.usage_limit} used
                      </span>
                    )}
                    {c.expires_at && (
                      <span>Expires: {new Date(c.expires_at).toLocaleDateString("en-IN")}</span>
                    )}
                    <span
                      className={`inline-block px-1.5 py-0.5 text-[9px] uppercase tracking-wider rounded border ${c.is_active ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-muted text-muted-foreground border-border"}`}
                    >
                      {c.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEdit(c)}
                    className="p-2 hover:text-gold transition-colors"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete coupon ${c.code}?`)) deleteMut.mutate(c.id);
                    }}
                    className="p-2 hover:text-destructive transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      {showForm && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4 hide-scrollbar"
          onClick={resetForm}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="mx-auto my-8 w-full max-w-2xl bg-background border border-border rounded-xl shadow-2xl"
          >
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-semibold">{editId ? "Edit Coupon" : "Create Coupon"}</h2>

              <button onClick={resetForm}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div
                className="overflow-y-auto px-8 py-8 space-y-6 hide-scrollbar"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                {/* Coupon Code */}
                <label className="block">
                  <span className="eyebrow text-[10px] mb-2 block">Coupon Code *</span>
                  <input
                    value={form.code}
                    onChange={(e) => setField("code", e.target.value.toUpperCase())}
                    required
                    placeholder="WELCOME10"
                    className="w-full border border-border bg-background px-4 py-3 text-lg font-mono uppercase tracking-[0.15em] focus:outline-none focus:border-gold transition-colors"
                  />
                </label>

                {/* Discount */}
                <div className="grid md:grid-cols-2 gap-5">
                  <label className="block">
                    <span className="eyebrow text-[10px] mb-2 block">Discount Type</span>

                    <Combobox
                      value={form.discount_type}
                      onChange={(val) => setField("discount_type", val as "percentage" | "fixed")}
                      options={[
                        {
                          label: "Percentage (%)",
                          value: "percentage",
                        },
                        {
                          label: "Fixed Amount (₹)",
                          value: "fixed",
                        },
                      ]}
                      className="w-full"
                    />
                  </label>

                  <label className="block">
                    <span className="eyebrow text-[10px] mb-2 block">Discount Value *</span>

                    <input
                      type="number"
                      value={form.discount_value}
                      onChange={(e) => setField("discount_value", parseFloat(e.target.value) || 0)}
                      required
                      min={0}
                      placeholder={form.discount_type === "percentage" ? "20" : "500"}
                      className={inp}
                    />
                  </label>
                </div>

                {/* Min / Max */}
                <div className="grid md:grid-cols-2 gap-5">
                  <label className="block">
                    <span className="eyebrow text-[10px] mb-2 block">Minimum Order Value (₹)</span>

                    <input
                      type="number"
                      value={form.min_order_value}
                      onChange={(e) => setField("min_order_value", parseFloat(e.target.value) || 0)}
                      min={0}
                      className={inp}
                    />
                  </label>

                  <label className="block">
                    <span className="eyebrow text-[10px] mb-2 block">Maximum Discount (₹)</span>

                    <input
                      type="number"
                      value={form.max_discount_value || ""}
                      onChange={(e) =>
                        setField("max_discount_value", parseFloat(e.target.value) || null)
                      }
                      min={0}
                      placeholder="No limit"
                      className={inp}
                    />
                  </label>
                </div>

                {/* Usage / Expiry */}
                <div className="grid md:grid-cols-2 gap-5">
                  <label className="block">
                    <span className="eyebrow text-[10px] mb-2 block">Usage Limit</span>

                    <input
                      type="number"
                      value={form.usage_limit || ""}
                      onChange={(e) => setField("usage_limit", parseInt(e.target.value) || null)}
                      min={1}
                      placeholder="Unlimited"
                      className={inp}
                    />
                  </label>

                  <label className="block">
                    <span className="eyebrow text-[10px] mb-2 block">Expiry Date</span>

                    <input
                      type="date"
                      value={form.expires_at || ""}
                      onChange={(e) => setField("expires_at", e.target.value || null)}
                      className={inp}
                    />
                  </label>
                </div>

                {/* Status Card */}
                <div className="border border-border rounded-xl p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Coupon Status</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Enable or disable this coupon
                      </p>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={form.is_active}
                      onClick={() => setField("is_active", !form.is_active)}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 ${
                        form.is_active ? "bg-emerald-500" : "bg-muted border border-border"
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                          form.is_active ? "translate-x-7" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-8 py-6 border-t border-border bg-muted/10">
                <button
                  type="button"
                  onClick={resetForm}
                  className="border border-border px-6 py-3 text-xs uppercase tracking-widest hover:bg-muted transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={createMut.isPending || updateMut.isPending}
                  className="bg-foreground text-background px-8 py-3 text-xs uppercase tracking-[0.25em] font-semibold hover:bg-gold hover:text-gold-foreground transition-all disabled:opacity-50"
                >
                  {createMut.isPending || updateMut.isPending
                    ? "Saving..."
                    : editId
                      ? "Update Coupon"
                      : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

const inp =
  "w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors";
