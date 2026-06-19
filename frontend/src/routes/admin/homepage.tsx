import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/admin-layout";
import { homepageApi } from "@/lib/api";
import { uploadBannerImage } from "@/lib/storage";
import type { HomepageBanner } from "@/lib/types";
import { Plus, Edit, Trash2, Image, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/admin/homepage")({
  head: () => ({ meta: [{ title: "Homepage — Admin" }] }),
  component: AdminHomepage,
});

const empty = { title: "", subtitle: "", description: "", image: "", mobile_image: "", cta_text: "", cta_link: "", sort_order: 0, is_active: true };

function AdminHomepage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(empty);
  const [uploading, setUploading] = useState(false);

  const { data: banners = [], isLoading } = useQuery({ queryKey: ["admin-banners"], queryFn: homepageApi.adminListBanners });

  const createMut = useMutation({
    mutationFn: (d: typeof empty) => homepageApi.createBanner(d as any),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-banners"] }); toast.success("Banner created"); resetForm(); },
    onError: (e: any) => toast.error(e.message),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, d }: { id: string; d: Partial<typeof empty> }) => homepageApi.updateBanner(id, d as any),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-banners"] }); toast.success("Banner updated"); resetForm(); },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: homepageApi.deleteBanner,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-banners"] }); toast.success("Banner deleted"); },
    onError: (e: any) => toast.error(e.message),
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) => homepageApi.updateBanner(id, { is_active } as any),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-banners"] }),
  });

  const resetForm = () => { setForm(empty); setEditId(null); setShowForm(false); };
  const startEdit = (b: HomepageBanner) => {
    setForm({ title: b.title || "", subtitle: b.subtitle || "", description: b.description || "", image: b.image || "", mobile_image: b.mobile_image || "", cta_text: b.cta_text || "", cta_link: b.cta_link || "", sort_order: b.sort_order, is_active: b.is_active });
    setEditId(b.id); setShowForm(true);
  };
  const setField = <K extends keyof typeof empty>(k: K, v: (typeof empty)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try { const url = await uploadBannerImage(file); setField("image", url); }
    catch { toast.error("Upload failed"); }
    finally { setUploading(false); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) updateMut.mutate({ id: editId, d: form });
    else createMut.mutate(form);
  };

  return (
    <AdminLayout title="Homepage Content" subtitle="Manage banners and featured sections"
      actions={
        showForm ? (
          <div className="flex gap-3">
            <button type="button" onClick={resetForm} className="border border-border px-5 py-2.5 text-xs uppercase tracking-widest hover:bg-muted">Cancel</button>
            <button onClick={handleSubmit} className="bg-foreground text-background px-6 py-2.5 text-xs uppercase tracking-widest hover:bg-gold hover:text-gold-foreground transition-colors">
              {editId ? "Update" : "Create Banner"}
            </button>
          </div>
        ) : (
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 bg-foreground text-background px-5 py-2.5 text-xs uppercase tracking-widest hover:bg-gold hover:text-gold-foreground transition-colors">
            <Plus className="h-4 w-4" /> Add Banner
          </button>
        )
      }>
      {showForm ? (
        <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
          <div className="border border-border p-6 space-y-4 bg-background">
            <label className="block">
              <span className="eyebrow text-[10px] mb-1.5 block">Title</span>
              <input value={form.title} onChange={(e) => setField("title", e.target.value)} className={inp} placeholder="Premium Luxury Sarees" />
            </label>
            <label className="block">
              <span className="eyebrow text-[10px] mb-1.5 block">Subtitle</span>
              <input value={form.subtitle} onChange={(e) => setField("subtitle", e.target.value)} className={inp} placeholder="The Vivah Edit · AW26" />
            </label>
            <label className="block">
              <span className="eyebrow text-[10px] mb-1.5 block">Description</span>
              <textarea value={form.description} onChange={(e) => setField("description", e.target.value)} rows={2} className={inp + " resize-y"} />
            </label>
            <div>
              <span className="eyebrow text-[10px] mb-1.5 block">Banner Image</span>
              {form.image && <img src={form.image} className="h-40 w-full object-cover border border-border mb-2" />}
              <div className="flex gap-2">
                <input value={form.image} onChange={(e) => setField("image", e.target.value)} className={inp + " flex-1"} placeholder="https://..." />
                <label className="cursor-pointer border border-border px-3 py-2 text-xs hover:bg-muted flex items-center gap-1">
                  {uploading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-gold border-t-transparent" /> : <><Image className="h-3.5 w-3.5" /> Upload</>}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                </label>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="eyebrow text-[10px] mb-1.5 block">CTA Button Text</span>
                <input value={form.cta_text} onChange={(e) => setField("cta_text", e.target.value)} className={inp} placeholder="Shop the Edit" />
              </label>
              <label className="block">
                <span className="eyebrow text-[10px] mb-1.5 block">CTA Link</span>
                <input value={form.cta_link} onChange={(e) => setField("cta_link", e.target.value)} className={inp} placeholder="/shop" />
              </label>
            </div>
            <label className="block">
              <span className="eyebrow text-[10px] mb-1.5 block">Sort Order</span>
              <input type="number" value={form.sort_order} onChange={(e) => setField("sort_order", parseInt(e.target.value) || 0)} className={inp} min={0} />
            </label>
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
        ) : banners.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-border">
            <Image className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
            <p className="font-display text-xl">No banners yet</p>
            <p className="text-sm text-muted-foreground mt-2">Add a hero banner to display on the homepage.</p>
            <button onClick={() => setShowForm(true)} className="mt-6 inline-flex items-center gap-2 bg-foreground text-background px-5 py-2.5 text-xs uppercase tracking-widest">
              <Plus className="h-4 w-4" /> Add Banner
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {banners.map((b: HomepageBanner) => (
              <div key={b.id} className={`border bg-background ${!b.is_active ? "opacity-50" : "border-border"}`}>
                {b.image ? <img src={b.image} className="h-40 w-full object-cover" /> : <div className="h-40 bg-champagne/20 flex items-center justify-center"><Image className="h-10 w-10 text-muted-foreground/30" /></div>}
                <div className="p-4">
                  <h3 className="font-display text-lg">{b.title || "Untitled Banner"}</h3>
                  {b.subtitle && <p className="text-xs text-muted-foreground italic mt-1">{b.subtitle}</p>}
                  {b.cta_text && <p className="text-xs text-gold mt-1">CTA: {b.cta_text} → {b.cta_link}</p>}
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => toggleMut.mutate({ id: b.id, is_active: !b.is_active })}
                      className="flex-1 border border-border py-2 text-xs hover:bg-muted flex items-center justify-center gap-1">
                      {b.is_active ? <><EyeOff className="h-3.5 w-3.5" /> Hide</> : <><Eye className="h-3.5 w-3.5" /> Show</>}
                    </button>
                    <button onClick={() => startEdit(b)} className="flex-1 border border-border py-2 text-xs hover:bg-muted flex items-center justify-center gap-1">
                      <Edit className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button onClick={() => { if (confirm("Delete this banner?")) deleteMut.mutate(b.id); }}
                      className="flex-1 border border-border py-2 text-xs hover:text-destructive hover:border-destructive flex items-center justify-center gap-1">
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
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
