import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/admin-layout";
import { ImageUploader } from "@/components/admin/image-uploader";
import { productsApi, categoriesApi, collectionsApi } from "@/lib/api";
import { formatINR } from "@/lib/types";
import type { Product, ProductFormData, Category, Collection, ProductStatus } from "@/lib/types";
import {
  Plus, Search, Edit, Trash2, Copy, Eye, EyeOff, Package, ChevronDown, X, Filter,
} from "lucide-react";

export const Route = createFileRoute("/admin/products")({
  head: () => ({ meta: [{ title: "Products — Admin" }] }),
  component: AdminProducts,
});

const FABRICS = ["Kanjivaram", "Banarasi", "Silk", "Organza", "Chiffon", "Linen", "Cotton", "Designer", "Handloom", "Contemporary"];
const WEAVES = ["Kanjivaram", "Banarasi", "Jamdani", "Patola", "Chanderi", "Chikankari", "Ikat", "Paithani", "None"];
const OCCASIONS = ["Bridal", "Festive", "Reception", "Casual", "Formal"];
const BADGE_OPTIONS = ["", "New", "Bestseller", "Limited"];

const emptyForm = (): ProductFormData => ({
  name: "", slug: "", sku: "", description: "", price: 0, sale_price: null, compare_at: null,
  category_id: "", collection_id: "", fabric: "Silk", color: "", occasion: "Festive",
  tags: [], details: [], stock_quantity: 0, is_featured: false, is_bestseller: false, is_new_arrival: false,
  video_url: "", seo_title: "", seo_description: "", status: "draft", weave: "None", badge: "", images: [],
});

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function AdminProducts() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormData>(emptyForm());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProductStatus | "all">("all");
  const [detailInput, setDetailInput] = useState("");
  const [tagInput, setTagInput] = useState("");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: productsApi.adminList,
  });
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: categoriesApi.adminList });
  const { data: collections = [] } = useQuery({ queryKey: ["collections"], queryFn: collectionsApi.adminList });

  const createMut = useMutation({
    mutationFn: (data: ProductFormData) => productsApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-products"] }); toast.success("Product created"); resetForm(); },
    onError: (e: any) => toast.error(e.message || "Failed to create product"),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProductFormData> }) => productsApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-products"] }); toast.success("Product updated"); resetForm(); },
    onError: (e: any) => toast.error(e.message || "Failed to update product"),
  });

  const deleteMut = useMutation({
    mutationFn: productsApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-products"] }); toast.success("Product deleted"); },
    onError: (e: any) => toast.error(e.message || "Failed to delete"),
  });

  const duplicateMut = useMutation({
    mutationFn: productsApi.duplicate,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-products"] }); toast.success("Product duplicated"); },
  });

  const toggleStatusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ProductStatus }) => productsApi.update(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-products"] }),
  });

  const resetForm = () => { setForm(emptyForm()); setEditingId(null); setShowForm(false); setDetailInput(""); setTagInput(""); };

  const startEdit = (p: Product) => {
    setForm({
      name: p.name, slug: p.slug, sku: p.sku || "", description: p.description,
      price: p.price, sale_price: p.sale_price, compare_at: p.compare_at,
      category_id: p.category_id || "", collection_id: p.collection_id || "",
      fabric: p.fabric || "Silk", color: p.color || "", occasion: p.occasion || "Festive",
      tags: p.tags || [], details: p.details || [], stock_quantity: p.stock_quantity,
      is_featured: p.is_featured, is_bestseller: p.is_bestseller, is_new_arrival: p.is_new_arrival,
      video_url: p.video_url || "", seo_title: p.seo_title || "", seo_description: p.seo_description || "",
      status: p.status, weave: p.weave || "None", badge: p.badge || "",
      images: p.images.map((i) => ({ url: i.url, alt_text: i.alt_text || "", is_featured: i.is_featured, sort_order: i.sort_order })),
    });
    setEditingId(p.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const setField = <K extends keyof ProductFormData>(k: K, v: ProductFormData[K]) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return toast.error("Product name is required");
    if (form.price <= 0) return toast.error("Price must be greater than 0");
    if (form.images.some((i) => i.uploading)) return toast.error("Please wait for images to finish uploading");
    const data = { ...form, slug: form.slug || slugify(form.name) };
    if (editingId) updateMut.mutate({ id: editingId, data });
    else createMut.mutate(data);
  };

  const filtered = products.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusBadge = (status: ProductStatus) => ({
    draft: "bg-amber-50 text-amber-700 border border-amber-200",
    published: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    archived: "bg-muted text-muted-foreground border border-border",
  }[status]);

  const formActions = (
    <div className="flex gap-3">
      <button type="button" onClick={resetForm} className="border border-border px-5 py-2.5 text-xs uppercase tracking-widest hover:bg-muted transition-colors">
        Cancel
      </button>
      <button
        onClick={handleSubmit}
        disabled={createMut.isPending || updateMut.isPending}
        className="bg-foreground text-background px-6 py-2.5 text-xs uppercase tracking-widest hover:bg-gold hover:text-gold-foreground transition-colors disabled:opacity-50"
      >
        {createMut.isPending || updateMut.isPending ? "Saving..." : editingId ? "Update Product" : "Publish Product"}
      </button>
    </div>
  );

  return (
    <AdminLayout
      title={showForm ? (editingId ? "Edit Product" : "New Product") : "Products"}
      subtitle={showForm ? "Fill in the details below" : `${products.length} total products`}
      actions={
        showForm ? formActions : (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-foreground text-background px-5 py-2.5 text-xs uppercase tracking-widest hover:bg-gold hover:text-gold-foreground transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Product
          </button>
        )
      }
    >
      {showForm ? (
        /* ── PRODUCT FORM ── */
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
          {/* Basic Info */}
          <Section title="Basic Information">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Product Name *">
                <input value={form.name} onChange={(e) => { setField("name", e.target.value); if (!editingId) setField("slug", slugify(e.target.value)); }}
                  className={inputCls} placeholder="Varanasi Heritage Katan Silk Saree" required />
              </Field>
              <Field label="SKU">
                <input value={form.sku} onChange={(e) => setField("sku", e.target.value)} className={inputCls} placeholder="SKU-0001" />
              </Field>
              <Field label="Slug">
                <input value={form.slug} onChange={(e) => setField("slug", e.target.value)} className={inputCls} placeholder="auto-generated-from-name" />
              </Field>
              <Field label="Badge">
                <select value={form.badge} onChange={(e) => setField("badge", e.target.value)} className={inputCls}>
                  {BADGE_OPTIONS.map((b) => <option key={b} value={b}>{b || "None"}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Description *">
              <textarea value={form.description} onChange={(e) => setField("description", e.target.value)}
                rows={4} className={inputCls + " resize-y"} placeholder="An exquisite..." required />
            </Field>
          </Section>

          {/* Pricing & Stock */}
          <Section title="Pricing & Inventory">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Price (₹) *">
                <input type="number" value={form.price || ""} onChange={(e) => setField("price", parseFloat(e.target.value) || 0)}
                  className={inputCls} placeholder="45000" required min={0} />
              </Field>
              <Field label="Sale Price (₹)">
                <input type="number" value={form.sale_price || ""} onChange={(e) => setField("sale_price", parseFloat(e.target.value) || null)}
                  className={inputCls} placeholder="38000" min={0} />
              </Field>
              <Field label="Compare At (₹)">
                <input type="number" value={form.compare_at || ""} onChange={(e) => setField("compare_at", parseFloat(e.target.value) || null)}
                  className={inputCls} placeholder="52000" min={0} />
              </Field>
              <Field label="Stock Quantity">
                <input type="number" value={form.stock_quantity} onChange={(e) => setField("stock_quantity", parseInt(e.target.value) || 0)}
                  className={inputCls} placeholder="10" min={0} />
              </Field>
            </div>
          </Section>

          {/* Classification */}
          <Section title="Classification">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Category">
                <select value={form.category_id} onChange={(e) => setField("category_id", e.target.value)} className={inputCls}>
                  <option value="">Select category...</option>
                  {categories.map((c: Category) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Collection">
                <select value={form.collection_id} onChange={(e) => setField("collection_id", e.target.value)} className={inputCls}>
                  <option value="">Select collection...</option>
                  {collections.map((c: Collection) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Status">
                <select value={form.status} onChange={(e) => setField("status", e.target.value as ProductStatus)} className={inputCls}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </Field>
              <Field label="Fabric Type">
                <select value={form.fabric} onChange={(e) => setField("fabric", e.target.value)} className={inputCls}>
                  {FABRICS.map((f) => <option key={f}>{f}</option>)}
                </select>
              </Field>
              <Field label="Weave Type">
                <select value={form.weave} onChange={(e) => setField("weave", e.target.value)} className={inputCls}>
                  {WEAVES.map((w) => <option key={w}>{w}</option>)}
                </select>
              </Field>
              <Field label="Occasion">
                <select value={form.occasion} onChange={(e) => setField("occasion", e.target.value)} className={inputCls}>
                  {OCCASIONS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Color">
                <input value={form.color} onChange={(e) => setField("color", e.target.value)} className={inputCls} placeholder="Crimson Red" />
              </Field>
            </div>
          </Section>

          {/* Flags */}
          <Section title="Product Flags">
            <div className="flex flex-wrap gap-6">
              {([
                ["is_featured", "Featured on Homepage"],
                ["is_bestseller", "Bestseller"],
                ["is_new_arrival", "New Arrival"],
              ] as [keyof ProductFormData, string][]).map(([k, label]) => (
                <label key={k} className="flex items-center gap-3 cursor-pointer select-none">
                  <div
                    onClick={() => setField(k, !form[k] as any)}
                    className={`relative h-5 w-9 rounded-full transition-colors ${form[k] ? "bg-gold" : "bg-border"}`}
                  >
                    <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${form[k] ? "translate-x-4" : "translate-x-0.5"}`} />
                  </div>
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </Section>

          {/* Product Details */}
          <Section title="Product Details">
            <div className="flex gap-2">
              <input value={detailInput} onChange={(e) => setDetailInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (detailInput.trim()) { setField("details", [...form.details, detailInput.trim()]); setDetailInput(""); } } }}
                className={inputCls + " flex-1"} placeholder="Add a detail (press Enter)" />
              <button type="button" onClick={() => { if (detailInput.trim()) { setField("details", [...form.details, detailInput.trim()]); setDetailInput(""); } }}
                className="border border-border px-4 py-2 text-xs hover:bg-muted transition-colors">Add</button>
            </div>
            {form.details.length > 0 && (
              <ul className="mt-3 space-y-2">
                {form.details.map((d, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold shrink-0" />
                    <span className="flex-1">{d}</span>
                    <button type="button" onClick={() => setField("details", form.details.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          {/* Tags */}
          <Section title="Tags">
            <div className="flex gap-2 flex-wrap mb-2">
              {form.tags.map((t, i) => (
                <span key={i} className="inline-flex items-center gap-1 bg-champagne/40 border border-border px-2 py-1 text-xs rounded">
                  {t}
                  <button type="button" onClick={() => setField("tags", form.tags.filter((_, j) => j !== i))}><X className="h-3 w-3" /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (tagInput.trim()) { setField("tags", [...form.tags, tagInput.trim()]); setTagInput(""); } } }}
                className={inputCls + " flex-1"} placeholder="Add tag (press Enter)" />
            </div>
          </Section>

          {/* Images */}
          <Section title="Product Images">
            <ImageUploader
              images={form.images}
              onChange={(imgs) => setField("images", imgs)}
              productId={editingId || "new"}
              maxImages={10}
            />
          </Section>

          {/* Video */}
          <Section title="Product Video (optional)">
            <Field label="Video URL">
              <input value={form.video_url} onChange={(e) => setField("video_url", e.target.value)}
                className={inputCls} placeholder="https://..." />
            </Field>
          </Section>

          {/* SEO */}
          <Section title="SEO & Meta">
            <div className="grid gap-4">
              <Field label="SEO Title">
                <input value={form.seo_title} onChange={(e) => setField("seo_title", e.target.value)}
                  className={inputCls} placeholder="Defaults to product name" maxLength={60} />
                <p className="text-[10px] text-muted-foreground mt-1">{form.seo_title.length}/60 characters</p>
              </Field>
              <Field label="SEO Description">
                <textarea value={form.seo_description} onChange={(e) => setField("seo_description", e.target.value)}
                  rows={2} className={inputCls + " resize-y"} placeholder="Product meta description..." maxLength={160} />
                <p className="text-[10px] text-muted-foreground mt-1">{form.seo_description.length}/160 characters</p>
              </Field>
            </div>
          </Section>

          {/* Submit */}
          <div className="flex items-center gap-3 pt-4 border-t border-border">
            {formActions}
          </div>
        </form>
      ) : (
        /* ── PRODUCT LIST ── */
        <div className="space-y-5">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or SKU..."
                className="w-full border border-border bg-background pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-foreground"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ProductStatus | "all")}
              className="border border-border bg-background px-3 py-2.5 text-sm focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
            <p className="text-sm text-muted-foreground ml-auto">{filtered.length} products</p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-border">
              <Package className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
              <p className="font-display text-xl">No products found</p>
              <p className="text-sm text-muted-foreground mt-2">Add your first product or adjust the filters.</p>
              <button onClick={() => setShowForm(true)} className="mt-6 inline-flex items-center gap-2 bg-foreground text-background px-5 py-2.5 text-xs uppercase tracking-widest">
                <Plus className="h-4 w-4" /> Add Product
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto border border-border">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-champagne/10">
                    <th className="p-4 eyebrow text-[9px] w-12" />
                    <th className="p-4 eyebrow text-[9px]">Product</th>
                    <th className="p-4 eyebrow text-[9px]">Fabric / Occasion</th>
                    <th className="p-4 eyebrow text-[9px]">Price</th>
                    <th className="p-4 eyebrow text-[9px]">Stock</th>
                    <th className="p-4 eyebrow text-[9px]">Status</th>
                    <th className="p-4 eyebrow text-[9px] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-champagne/5 group">
                      <td className="p-4">
                        <img
                          src={p.image || "/placeholder-saree.jpg"}
                          alt={p.name}
                          className="h-12 w-9 object-cover border border-border"
                          onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-saree.jpg"; }}
                        />
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-sm leading-snug line-clamp-2 max-w-[200px]">{p.name}</p>
                        {p.sku && <p className="text-[10px] text-muted-foreground mt-0.5">{p.sku}</p>}
                        <div className="flex gap-1 mt-1">
                          {p.is_featured && <span className="text-[9px] bg-gold/10 text-gold px-1 py-0.5 rounded">Featured</span>}
                          {p.is_bestseller && <span className="text-[9px] bg-emerald-50 text-emerald-600 px-1 py-0.5 rounded">Bestseller</span>}
                          {p.is_new_arrival && <span className="text-[9px] bg-blue-50 text-blue-600 px-1 py-0.5 rounded">New</span>}
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground text-xs">
                        {p.fabric}<br />{p.occasion}
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-gold">{formatINR(p.sale_price || p.price)}</p>
                        {p.sale_price && <p className="text-[10px] text-muted-foreground line-through">{formatINR(p.price)}</p>}
                      </td>
                      <td className="p-4">
                        <span className={`text-xs font-medium ${p.stock_quantity === 0 ? "text-destructive" : p.stock_quantity <= 5 ? "text-amber-600" : "text-foreground"}`}>
                          {p.stock_quantity === 0 ? "Out of stock" : `${p.stock_quantity} units`}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider rounded ${statusBadge(p.status)}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => toggleStatusMut.mutate({ id: p.id, status: p.status === "published" ? "draft" : "published" })}
                            className="p-1.5 hover:text-gold transition-colors" title={p.status === "published" ? "Unpublish" : "Publish"}
                          >
                            {p.status === "published" ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                          <button onClick={() => startEdit(p)} className="p-1.5 hover:text-gold transition-colors" title="Edit">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button onClick={() => duplicateMut.mutate(p.id)} className="p-1.5 hover:text-gold transition-colors" title="Duplicate">
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => { if (confirm(`Delete "${p.name}"?`)) deleteMut.mutate(p.id); }}
                            className="p-1.5 hover:text-destructive transition-colors" title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-border bg-background">
      <div className="border-b border-border bg-champagne/10 px-6 py-3">
        <h3 className="eyebrow text-[10px]">{title}</h3>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="eyebrow text-[10px] mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}

const inputCls = "w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors";
