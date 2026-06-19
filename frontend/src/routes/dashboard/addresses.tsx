import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MapPin, Plus, Trash2, Star, Navigation, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import { addressesApi } from "@/lib/api";
import type { CustomerAddress } from "@/lib/types";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

export const Route = createFileRoute("/dashboard/addresses")({
  head: () => ({
    meta: [
      { title: "Saved Addresses — Drapeva" },
      { name: "description", content: "Manage your delivery addresses." },
    ],
  }),
  component: AddressBook,
});

const INDIA_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu & Kashmir", "Ladakh", "Puducherry", "Chandigarh",
];

const emptyForm = {
  label: "Home",
  name: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postal_code: "",
  country: "India",
  is_default: false,
  latitude: null as number | null,
  longitude: null as number | null,
};

function AddressBook() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [locating, setLocating] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);

  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ["my-addresses", user?.id],
    queryFn: () => user ? addressesApi.list(user.id) : Promise.resolve([]),
    enabled: !!user,
  });

  const createMut = useMutation({
    mutationFn: (addr: Omit<CustomerAddress, "id" | "created_at" | "updated_at">) => addressesApi.create(addr),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-addresses"] });
      toast.success("Address saved successfully");
      resetForm();
    },
    onError: (e: any) => toast.error(e.message || "Failed to save address"),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CustomerAddress> }) => addressesApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-addresses"] });
      toast.success("Address updated");
      resetForm();
    },
    onError: (e: any) => toast.error(e.message || "Failed to update address"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => addressesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-addresses"] });
      toast.success("Address removed");
    },
    onError: (e: any) => toast.error(e.message || "Failed to remove address"),
  });

  const setDefaultMut = useMutation({
    mutationFn: (id: string) => addressesApi.setDefault(id, user!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-addresses"] });
      toast.success("Default address updated");
    },
  });

  const resetForm = () => {
    setForm({ ...emptyForm });
    setShowForm(false);
    setEditId(null);
  };

  const handleEdit = (addr: CustomerAddress) => {
    setForm({
      label: addr.label || "Home",
      name: addr.name,
      phone: addr.phone,
      line1: addr.line1,
      line2: addr.line2 || "",
      city: addr.city,
      state: addr.state,
      postal_code: addr.postal_code,
      country: addr.country,
      is_default: addr.is_default,
      latitude: addr.latitude,
      longitude: addr.longitude,
    });
    setEditId(addr.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // GPS location detection
  const detectLocation = () => {
    if (!navigator.geolocation) {
      return toast.error("Geolocation is not supported by your browser");
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setForm((f) => ({ ...f, latitude, longitude }));

        try {
          // Use Open Street Map Nominatim for reverse geocoding (free, no API key)
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          const addr = data.address;
          setForm((f) => ({
            ...f,
            city: addr.city || addr.town || addr.village || addr.county || "",
            state: addr.state || "",
            postal_code: addr.postcode || "",
          }));
          toast.success("Location detected! Please verify the fields.");
        } catch {
          toast.info("Location coordinates captured. Please fill city/state manually.");
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        toast.error("Could not access location: " + err.message);
      }
    );
  };

  // PIN code auto-fill (India Post API)
  const lookupPin = async (pin: string) => {
    if (pin.length !== 6) return;
    setPinLoading(true);
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();
      if (data[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
        const po = data[0].PostOffice[0];
        setForm((f) => ({
          ...f,
          city: po.Division || po.Name || f.city,
          state: po.State || f.state,
        }));
        toast.success(`Auto-filled: ${po.Division || po.Name}, ${po.State}`);
      }
    } catch {
      // Silently fail — user can fill manually
    } finally {
      setPinLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const addressData = {
      user_id: user.id,
      ...form,
      line2: form.line2 || null,
    };

    if (editId) {
      updateMut.mutate({ id: editId, data: addressData });
    } else {
      createMut.mutate(addressData as Omit<CustomerAddress, "id" | "created_at" | "updated_at">);
    }
  };

  const saving = createMut.isPending || updateMut.isPending;

  return (
    <DashboardLayout title="Address Book" subtitle="Saved Addresses">
      {/* Add button */}
      {!showForm && (
        <div className="flex justify-end">
          <button
            onClick={() => { setShowForm(true); setEditId(null); setForm({ ...emptyForm }); }}
            className="inline-flex items-center gap-2 border border-foreground px-5 py-3 text-xs uppercase tracking-wider font-medium hover:bg-foreground hover:text-background transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add New Address
          </button>
        </div>
      )}

      {/* Address Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="border border-border p-6 bg-champagne/10 space-y-5">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="font-display text-xl">
              {editId ? "Edit Address" : "New Address"}
            </h2>
            <button
              type="button"
              onClick={resetForm}
              className="text-muted-foreground hover:text-foreground text-xs uppercase tracking-wider"
            >
              Cancel
            </button>
          </div>

          {/* Label + Location Detect */}
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-2">
              {["Home", "Work", "Other"].map((lbl) => (
                <button
                  key={lbl}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, label: lbl }))}
                  className={`px-4 py-2 text-[10px] uppercase tracking-widest border transition-colors ${
                    form.label === lbl
                      ? "bg-foreground text-background border-foreground"
                      : "border-border text-muted-foreground hover:border-foreground"
                  }`}
                >
                  {lbl}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={detectLocation}
              disabled={locating}
              className="inline-flex items-center gap-2 border border-gold/40 text-gold px-4 py-2 text-[10px] uppercase tracking-widest hover:bg-gold/5 transition-colors disabled:opacity-50"
            >
              {locating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Navigation className="h-3.5 w-3.5" />}
              {locating ? "Detecting..." : "Use My Location"}
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="eyebrow mb-1 block">Recipient Name</span>
              <input type="text" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground" />
            </label>
            <label className="block">
              <span className="eyebrow mb-1 block">Phone Number</span>
              <input type="tel" required value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground"
                placeholder="+91 98765 43210" />
            </label>
          </div>

          <label className="block">
            <span className="eyebrow mb-1 block">Address Line 1</span>
            <input type="text" required value={form.line1} onChange={(e) => setForm((f) => ({ ...f, line1: e.target.value }))}
              className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground"
              placeholder="House/Flat No., Street, Locality" />
          </label>

          <label className="block">
            <span className="eyebrow mb-1 block">Address Line 2 <span className="normal-case text-muted-foreground">(optional)</span></span>
            <input type="text" value={form.line2} onChange={(e) => setForm((f) => ({ ...f, line2: e.target.value }))}
              className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground"
              placeholder="Landmark, Area" />
          </label>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block">
              <span className="eyebrow mb-1 block">
                PIN Code
                {pinLoading && <Loader2 className="h-3 w-3 animate-spin inline ml-1" />}
              </span>
              <input
                type="text"
                required
                value={form.postal_code}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setForm((f) => ({ ...f, postal_code: val }));
                  if (val.length === 6) lookupPin(val);
                }}
                className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground"
                placeholder="400001"
                maxLength={6}
              />
            </label>
            <label className="block">
              <span className="eyebrow mb-1 block">City</span>
              <input type="text" required value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground" />
            </label>
            <label className="block">
              <span className="eyebrow mb-1 block">State</span>
              <select value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} required
                className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground">
                <option value="">Select State</option>
                {INDIA_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.is_default} onChange={(e) => setForm((f) => ({ ...f, is_default: e.target.checked }))}
              className="accent-gold h-4 w-4" />
            <span className="text-sm text-muted-foreground">Set as default delivery address</span>
          </label>

          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={resetForm}
              className="px-5 py-3 text-xs uppercase tracking-wider text-muted-foreground border border-border hover:border-foreground transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="bg-foreground text-background px-8 py-3 text-xs uppercase tracking-widest font-medium transition-colors hover:bg-gold hover:text-gold-foreground disabled:opacity-50">
              {saving ? "Saving..." : editId ? "Update Address" : "Save Address"}
            </button>
          </div>
        </form>
      )}

      {/* Address List */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2].map((i) => <div key={i} className="border border-border p-6 animate-pulse h-40 bg-champagne/10" />)}
        </div>
      ) : addresses.length === 0 && !showForm ? (
        <div className="py-16 text-center border border-dashed border-border">
          <MapPin className="h-10 w-10 mx-auto text-muted-foreground stroke-1 mb-4" />
          <p className="font-display text-xl">No saved addresses</p>
          <p className="text-sm text-muted-foreground mt-2">Add an address for faster checkout</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((addr: CustomerAddress) => (
            <div key={addr.id} className="border border-border p-5 bg-champagne/10 relative hover:border-gold/30 transition-colors">
              {addr.is_default && (
                <span className="absolute top-4 right-4 bg-gold text-gold-foreground px-2 py-0.5 text-[9px] uppercase tracking-wider font-medium flex items-center gap-1">
                  <Star className="h-2.5 w-2.5 fill-current" />
                  Default
                </span>
              )}
              <div className="flex items-start gap-2 mb-3">
                <MapPin className="h-4 w-4 text-gold mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gold font-medium">{addr.label}</p>
                  <p className="font-medium text-sm mt-0.5">{addr.name}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed ml-6">
                {addr.line1}{addr.line2 && `, ${addr.line2}`}<br />
                {addr.city}, {addr.state} — {addr.postal_code}<br />
                {addr.country}
              </p>
              <p className="text-xs text-muted-foreground mt-2 ml-6">📞 {addr.phone}</p>

              <div className="mt-4 pt-4 border-t border-border flex gap-3 flex-wrap">
                <button onClick={() => handleEdit(addr)}
                  className="text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground border-b border-dashed border-muted-foreground pb-0.5">
                  Edit
                </button>
                {!addr.is_default && (
                  <button onClick={() => setDefaultMut.mutate(addr.id)}
                    className="text-xs uppercase tracking-wider text-muted-foreground hover:text-gold border-b border-dashed border-muted-foreground pb-0.5">
                    Set Default
                  </button>
                )}
                <button
                  onClick={() => {
                    if (confirm("Remove this address?")) deleteMut.mutate(addr.id);
                  }}
                  className="text-xs uppercase tracking-wider text-destructive hover:text-destructive/80 flex items-center gap-1 ml-auto"
                >
                  <Trash2 className="h-3 w-3" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
