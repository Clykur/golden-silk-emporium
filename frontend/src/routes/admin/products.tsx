import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-store";
import { api } from "@/lib/api";
import { PRODUCTS, formatINR } from "@/lib/products";
import { toast } from "sonner";
import { ShoppingBag, Users, Activity, FileText, Plus, Trash2, Edit } from "lucide-react";

export const Route = createFileRoute("/admin/products")({
  head: () => ({
    meta: [{ title: "Admin Product Management — Maaya Couture" }],
  }),
  component: AdminProducts,
});

function AdminProducts() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [fabric, setFabric] = useState("Silk");
  const [occasion, setOccasion] = useState("Bridal");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) {
      router.navigate({ to: "/auth/login" });
      return;
    }
    // For local simulation, we can query our mock product list or REST endpoints
    api.products
      .list()
      .then((data) => setItems(data))
      .catch(() => {
        // Fallback to local static copy if backend isn't listening yet
        setItems(PRODUCTS);
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const handleDelete = async (id: string) => {
    try {
      await api.products.delete(id);
      setItems(items.filter((p) => p.id !== id));
      toast.success("Product deleted successfully");
    } catch {
      // Local fallback simulation
      setItems(items.filter((p) => p.id !== id));
      toast.success("Product removed (simulated)");
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProduct) {
      // Edit
      const updated = items.map((p) =>
        p.id === selectedProduct.id
          ? { ...p, name, price: parseFloat(price), fabric, occasion, description }
          : p,
      );
      setItems(updated);
      toast.success("Product updated successfully");
    } else {
      // Add
      const newP = {
        id: "prod-" + Math.random().toString(36).substring(4),
        name,
        price: parseFloat(price),
        fabric,
        occasion,
        description,
        collection: "Vivah Couture",
        image:
          "https://images.unsplash.com/photo-1610189012906-4c0aa9b9781e?w=600&q=80",
        images: [
          "https://images.unsplash.com/photo-1610189012906-4c0aa9b9781e?w=600&q=80",
        ],
        details: ["Hand finished", "Silk fabric"],
        variants: [{ size: "M", stock: 10 }],
      };
      setItems([newP, ...items]);
      toast.success("New product registered");
    }

    setShowForm(false);
    setSelectedProduct(null);
    setName("");
    setPrice("");
    setDescription("");
  };

  const startEdit = (p: any) => {
    setSelectedProduct(p);
    setName(p.name);
    setPrice(p.price.toString());
    setFabric(p.fabric);
    setOccasion(p.occasion);
    setDescription(p.description);
    setShowForm(true);
  };

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div className="container-luxe py-12">
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="border-r border-border pr-8 space-y-6">
          <div className="pb-6 border-b border-border">
            <span className="font-display text-xl tracking-wider text-gold">ATELIER CMS</span>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
              Atelier Console
            </p>
          </div>

          <nav className="space-y-1 text-xs uppercase tracking-widest font-semibold text-muted-foreground">
            <Link
              to="/admin"
              className="flex items-center gap-3 px-3 py-2.5 hover:text-foreground transition-colors"
            >
              <Activity className="h-4 w-4" /> Analytics Overview
            </Link>
            <Link
              to="/admin/products"
              className="flex items-center gap-3 px-3 py-2.5 bg-champagne text-foreground"
            >
              <ShoppingBag className="h-4 w-4" /> Products CRUD
            </Link>
            <Link
              to="/admin/orders"
              className="flex items-center gap-3 px-3 py-2.5 hover:text-foreground transition-colors"
            >
              <FileText className="h-4 w-4" /> Order Book
            </Link>
            <Link
              to="/admin/customers"
              className="flex items-center gap-3 px-3 py-2.5 hover:text-foreground transition-colors"
            >
              <Users className="h-4 w-4" /> Customer List
            </Link>
          </nav>
        </aside>

        <main className="space-y-8">
          <div className="flex justify-between items-center flex-wrap gap-4 border-b border-border pb-5">
            <div>
              <p className="eyebrow text-gold">Registry</p>
              <h1 className="mt-1 font-display text-3xl">Manage Products</h1>
            </div>
            {!showForm && (
              <button
                onClick={() => {
                  setShowForm(true);
                  setSelectedProduct(null);
                }}
                className="inline-flex items-center gap-2 border border-foreground px-5 py-3 text-xs uppercase tracking-wider font-semibold hover:bg-foreground hover:text-background transition-colors"
              >
                <Plus className="h-4 w-4" /> Add Product
              </button>
            )}
          </div>

          {showForm ? (
            <form
              onSubmit={handleSave}
              className="max-w-xl border border-border p-6 bg-champagne/10 space-y-4"
            >
              <h2 className="font-display text-xl border-b border-border pb-2">
                {selectedProduct ? "Edit Product Details" : "Register New Couture Sizing"}
              </h2>

              <label className="block">
                <span className="eyebrow mb-1 block">Product Name</span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-3">
                <label className="block">
                  <span className="eyebrow mb-1 block">Price (INR)</span>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="eyebrow mb-1 block">Fabric Type</span>
                  <select
                    value={fabric}
                    onChange={(e) => setFabric(e.target.value)}
                    className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none"
                  >
                    <option value="Silk">Silk</option>
                    <option value="Kanjivaram">Kanjivaram</option>
                    <option value="Banarasi">Banarasi</option>
                    <option value="Organza">Organza</option>
                    <option value="Chiffon">Chiffon</option>
                    <option value="Linen">Linen</option>
                    <option value="Cotton">Cotton</option>
                    <option value="Designer">Designer</option>
                    <option value="Handloom">Handloom</option>
                    <option value="Contemporary">Contemporary</option>
                  </select>
                </label>
                <label className="block">
                  <span className="eyebrow mb-1 block">Occasion</span>
                  <select
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value)}
                    className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none"
                  >
                    <option value="Bridal">Bridal</option>
                    <option value="Festive">Festive</option>
                    <option value="Reception">Reception</option>
                    <option value="Casual">Casual</option>
                    <option value="Formal">Formal</option>
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="eyebrow mb-1 block">Description</span>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none"
                />
              </label>

              <div className="flex gap-3 pt-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-3 text-xs uppercase tracking-wider text-muted-foreground border border-transparent hover:border-border transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-foreground text-background px-6 py-3 text-xs uppercase tracking-widest font-medium transition-colors hover:bg-gold hover:text-gold-foreground"
                >
                  Save Product
                </button>
              </div>
            </form>
          ) : (
            <div className="overflow-x-auto border border-border">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-champagne/10">
                    <th className="p-4 eyebrow text-[9px]">Name</th>
                    <th className="p-4 eyebrow text-[9px]">Category/Fabric</th>
                    <th className="p-4 eyebrow text-[9px]">Occasion</th>
                    <th className="p-4 eyebrow text-[9px]">Price</th>
                    <th className="p-4 eyebrow text-[9px] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.map((p) => (
                    <tr key={p.id} className="hover:bg-champagne/5">
                      <td className="p-4 font-medium flex items-center gap-3">
                        <img src={p.image} className="h-10 w-8 object-cover border border-border" />
                        <span>{p.name}</span>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {p.collection} · {p.fabric}
                      </td>
                      <td className="p-4">{p.occasion}</td>
                      <td className="p-4 font-semibold text-gold">{formatINR(p.price)}</td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => startEdit(p)}
                          className="p-1 hover:text-gold transition-colors inline-block"
                          aria-label="Edit product"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1 hover:text-destructive transition-colors inline-block"
                          aria-label="Delete product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
