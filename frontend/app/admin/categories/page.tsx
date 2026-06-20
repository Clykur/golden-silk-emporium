"use client";

import Link from "next/link";
import { useRouter, usePathname, useSearchParams, useParams } from "next/navigation";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/admin-layout";
import { categoriesApi } from "@/lib/api";
import { uploadCollectionImage } from "@/lib/storage";
import type { Category } from "@/lib/types";
import { Plus, Edit, Trash2, Image, Tag } from "lucide-react";

const empty = { name: "", slug: "", description: "", image: "" };
function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function AdminCategories() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(empty);
  const [uploading, setUploading] = useState(false);

  const { data: cats = [], isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: categoriesApi.adminList,
  });

  const createMut = useMutation({
    mutationFn: (d: typeof empty) => categoriesApi.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Category created");
      resetForm();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, d }: { id: string; d: Partial<typeof empty> }) =>
      categoriesApi.update(id, d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Category updated");
      resetForm();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: categoriesApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Category deleted");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const resetForm = () => {
    setForm(empty);
    setEditId(null);
    setShowForm(false);
  };
  const startEdit = (c: Category) => {
    setForm({ name: c.name, slug: c.slug, description: c.description || "", image: c.image || "" });
    setEditId(c.id);
    setShowForm(true);
  };
  const setField = (k: keyof typeof empty, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadCollectionImage(file, editId || "new-category");
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
      title={showForm ? (editId ? "Edit Category" : "New Category") : "Categories"}
      subtitle={showForm ? "" : `${cats.length} categories`}
      actions={
        showForm ? (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={resetForm}
              className="border border-border px-5 py-2.5 text-xs uppercase tracking-widest hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="bg-foreground text-background px-6 py-2.5 text-xs uppercase tracking-widest hover:bg-gold hover:text-gold-foreground transition-colors"
            >
              {editId ? "Update" : "Create"}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-foreground text-background px-5 py-2.5 text-xs uppercase tracking-widest hover:bg-gold hover:text-gold-foreground transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Category
          </button>
        )
      }
    >
      {showForm ? (
        <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
          <div className="border border-border p-6 space-y-4 bg-background">
            <label className="block">
              <span className="eyebrow text-[10px] mb-1.5 block">Category Name *</span>
              <input
                value={form.name}
                onChange={(e) => {
                  setField("name", e.target.value);
                  if (!editId) setField("slug", slugify(e.target.value));
                }}
                required
                className={input}
                placeholder="Kanjivaram Sarees"
              />
            </label>
            <label className="block">
              <span className="eyebrow text-[10px] mb-1.5 block">Slug</span>
              <input
                value={form.slug}
                onChange={(e) => setField("slug", e.target.value)}
                className={input}
                placeholder="kanjivaram-sarees"
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
            <label className="block">
              <span className="eyebrow text-[10px] mb-1.5 block">Category Image</span>
              {form.image && (
                <img
                  src={form.image}
                  className="h-32 w-full object-cover border border-border mb-2"
                />
              )}
              <div className="flex gap-2">
                <input
                  value={form.image}
                  onChange={(e) => setField("image", e.target.value)}
                  className={input + " flex-1"}
                  placeholder="https://... or upload"
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
            </label>
          </div>
        </form>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <div className="col-span-full py-16 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
            </div>
          ) : (
            cats.map((c: Category) => (
              <div
                key={c.id}
                className="border border-border bg-background hover:shadow-[var(--shadow-card)] transition-shadow"
              >
                {c.image && <img src={c.image} className="h-32 w-full object-cover" />}
                {!c.image && (
                  <div className="h-32 bg-champagne/20 flex items-center justify-center">
                    <Tag className="h-8 w-8 text-muted-foreground/40" />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold">{c.name}</h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">/{c.slug}</p>
                  {c.description && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                      {c.description}
                    </p>
                  )}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => startEdit(c)}
                      className="flex-1 border border-border py-2 text-xs hover:bg-muted transition-colors flex items-center justify-center gap-1"
                    >
                      <Edit className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${c.name}"?`)) deleteMut.mutate(c.id);
                      }}
                      className="flex-1 border border-border py-2 text-xs hover:bg-destructive/5 hover:border-destructive hover:text-destructive transition-colors flex items-center justify-center gap-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </AdminLayout>
  );
}

const input =
  "w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors";
