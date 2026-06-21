"use client";

import Link from "next/link";
import { useRouter, usePathname, useSearchParams, useParams } from "next/navigation";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/admin-layout";
import { collectionsApi } from "@/lib/api";
import { uploadCollectionImage } from "@/lib/storage";
import type { Collection } from "@/lib/types";
import { Plus, Edit, Trash2, Image, Layers, Star } from "lucide-react";

const empty = {
  name: "",
  slug: "",
  tagline: "",
  description: "",
  image: "",
  is_featured: false,
  sort_order: 0,
};
function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function AdminCollections() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(empty);
  const [uploading, setUploading] = useState(false);

  const { data: collections = [], isLoading } = useQuery({
    queryKey: ["admin-collections"],
    queryFn: collectionsApi.adminList,
  });

  const createMut = useMutation({
    mutationFn: (d: typeof empty) => collectionsApi.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-collections"] });
      toast.success("Collection created");
      resetForm();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, d }: { id: string; d: Partial<typeof empty> }) =>
      collectionsApi.update(id, d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-collections"] });
      toast.success("Collection updated");
      resetForm();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: collectionsApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-collections"] });
      toast.success("Collection deleted");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const resetForm = () => {
    setForm(empty);
    setEditId(null);
    setShowForm(false);
  };
  const startEdit = (c: Collection) => {
    setForm({
      name: c.name,
      slug: c.slug,
      tagline: c.tagline || "",
      description: c.description || "",
      image: c.image || "",
      is_featured: c.is_featured,
      sort_order: c.sort_order,
    });
    setEditId(c.id);
    setShowForm(true);
  };
  const setField = <K extends keyof typeof empty>(k: K, v: (typeof empty)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadCollectionImage(file, editId || "new");
      setField("image", url);
    } catch {
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const d = { ...form, slug: form.slug || slugify(form.name) };
    if (editId) updateMut.mutate({ id: editId, d });
    else createMut.mutate(d);
  };

  return (
    <AdminLayout
      title="Collections"
      subtitle={`${collections.length} collections`}
      actions={
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 bg-foreground text-background px-5 py-2.5 text-xs uppercase tracking-widest hover:bg-gold hover:text-gold-foreground transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Collection
        </button>
      }
    >
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4">
          <div className="w-full max-w-lg bg-background border border-border max-h-[90vh] overflow-y-auto">
            <div className="border-b border-border p-6 flex items-center justify-between">
              <h2 className="font-display text-xl">
                {editId ? "Edit Collection" : "New Collection"}
              </h2>
              <button
                onClick={resetForm}
                className="text-muted-foreground hover:text-foreground text-xl leading-none"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <label className="block">
                <span className="eyebrow text-[10px] mb-1.5 block">Collection Name *</span>
                <input
                  value={form.name}
                  onChange={(e) => {
                    setField("name", e.target.value);
                    if (!editId) setField("slug", slugify(e.target.value));
                  }}
                  required
                  className={input}
                  placeholder="Heritage Weaves"
                />
              </label>
              <label className="block">
                <span className="eyebrow text-[10px] mb-1.5 block">Slug</span>
                <input
                  value={form.slug}
                  onChange={(e) => setField("slug", e.target.value)}
                  className={input}
                />
              </label>
              <label className="block">
                <span className="eyebrow text-[10px] mb-1.5 block">Tagline</span>
                <input
                  value={form.tagline}
                  onChange={(e) => setField("tagline", e.target.value)}
                  className={input}
                  placeholder="Handloom masterworks from Banaras & Kanchipuram"
                />
              </label>
              <label className="block">
                <span className="eyebrow text-[10px] mb-1.5 block">Description</span>
                <textarea
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  rows={3}
                  className={input + " resize-y"}
                />
              </label>
              <div>
                <span className="eyebrow text-[10px] mb-1.5 block">Collection Image</span>
                {form.image && (
                  <img
                    src={form.image}
                    className="h-40 w-full object-cover border border-border mb-2"
                  />
                )}
                <div className="flex gap-2">
                  <input
                    value={form.image}
                    onChange={(e) => setField("image", e.target.value)}
                    className={input + " flex-1"}
                    placeholder="https://..."
                  />
                  <label className="cursor-pointer border border-border px-3 py-2 text-xs hover:bg-muted flex items-center gap-1">
                    {uploading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gold border-t-transparent" />
                    ) : (
                      <>
                        <Image className="h-3.5 w-3.5" /> Upload
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                  </label>
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setField("is_featured", !form.is_featured)}
                  className={`relative h-5 w-9 rounded-full transition-colors ${form.is_featured ? "bg-gold" : "bg-border"}`}
                >
                  <div
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${form.is_featured ? "translate-x-4" : "translate-x-0.5"}`}
                  />
                </div>
                <span className="text-sm">Featured on Homepage</span>
              </label>
              <label className="block">
                <span className="eyebrow text-[10px] mb-1.5 block">Sort Order</span>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setField("sort_order", parseInt(e.target.value) || 0)}
                  className={input}
                  min={0}
                />
              </label>
              <div className="flex gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 border border-border px-5 py-2.5 text-xs uppercase tracking-widest hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-foreground text-background px-6 py-2.5 text-xs uppercase tracking-widest hover:bg-gold hover:text-gold-foreground transition-colors"
                >
                  {editId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {isLoading ? (
          <div className="col-span-full py-16 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
          </div>
        ) : (
          collections.map((c: Collection) => (
            <div
              key={c.id}
              className="border border-border bg-background relative hover:shadow-[var(--shadow-card)] transition-shadow"
            >
              <div className="aspect-video relative overflow-hidden">
                {c.image ? (
                  <img src={c.image} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full bg-champagne/20 flex items-center justify-center">
                    <Layers className="h-10 w-10 text-muted-foreground/30" />
                  </div>
                )}
                {c.is_featured && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-gold text-gold-foreground text-[9px] uppercase tracking-widest px-2 py-1 font-semibold">
                    <Star className="h-2.5 w-2.5" /> Featured
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-display text-lg">{c.name}</h3>
                {c.tagline && (
                  <p className="text-xs text-muted-foreground mt-1 italic">{c.tagline}</p>
                )}
                <p className="text-[10px] text-muted-foreground mt-1">
                  /{c.slug} · Order: {c.sort_order}
                </p>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => startEdit(c)}
                    className="flex-1 border border-border py-2 text-xs hover:bg-muted flex items-center justify-center gap-1"
                  >
                    <Edit className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${c.name}"?`)) deleteMut.mutate(c.id);
                    }}
                    className="flex-1 border border-border py-2 text-xs hover:text-destructive hover:border-destructive flex items-center justify-center gap-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </AdminLayout>
  );
}

const input =
  "w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors";
