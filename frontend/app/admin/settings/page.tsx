"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/admin-layout";
import { settingsApi } from "@/lib/api";
import { Settings, Save, RefreshCw, ShieldAlert } from "lucide-react";

export default function AdminSettings() {
  const qc = useQueryClient();
  const [storeName, setStoreName] = useState("");
  const [storeTagline, setStoreTagline] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number>(0);
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(0);

  const {
    data: settings = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: settingsApi.getSettings,
  });

  const updateSettingsMut = useMutation({
    mutationFn: (data: Record<string, any>) => settingsApi.updateSettings(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-settings"] });
      toast.success("Store settings updated successfully");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update settings");
    },
  });

  // Load values into local state when query completes
  useEffect(() => {
    if (settings.length > 0) {
      const getVal = (key: string, fallback: any) => {
        const item = settings.find((s) => s.key === key);
        return item && item.value !== undefined ? item.value : fallback;
      };

      setStoreName(getVal("store_name", ""));
      setStoreTagline(getVal("store_tagline", ""));
      setWhatsappNumber(getVal("whatsapp_number", ""));
      setFreeShippingThreshold(Number(getVal("free_shipping_threshold", 0)));
      setShippingCost(Number(getVal("shipping_cost", 0)));
      setTaxRate(Number(getVal("tax_rate", 0)));
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName) return toast.error("Store Name is required");

    updateSettingsMut.mutate({
      store_name: storeName,
      store_tagline: storeTagline,
      whatsapp_number: whatsappNumber,
      free_shipping_threshold: Number(freeShippingThreshold),
      shipping_cost: Number(shippingCost),
      tax_rate: Number(taxRate),
    });
  };

  return (
    <AdminLayout
      title="Store Settings"
      subtitle="Configure global parameters, checkout settings, and WhatsApp connections"
      actions={
        <button
          onClick={handleSubmit}
          disabled={updateSettingsMut.isPending || isLoading}
          className="inline-flex items-center gap-2 bg-foreground text-background px-5 py-2.5 text-xs uppercase tracking-widest hover:bg-gold hover:text-gold-foreground transition-all cursor-pointer disabled:opacity-50"
        >
          {updateSettingsMut.isPending ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          {updateSettingsMut.isPending ? "Saving..." : "Save Settings"}
        </button>
      }
    >
      {isLoading ? (
        <div className="flex justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
          {/* Brand Settings */}
          <div className="border border-border bg-background">
            <div className="border-b border-border bg-champagne/10 px-6 py-4 flex items-center gap-2">
              <Settings className="h-4 w-4 text-gold" />
              <h3 className="eyebrow text-xs">General Branding</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="eyebrow text-[10px] mb-1.5 block">Store Name *</span>
                  <input
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    required
                    className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground"
                    placeholder="e.g. Drapeva"
                  />
                </label>
                <label className="block">
                  <span className="eyebrow text-[10px] mb-1.5 block">WhatsApp Number</span>
                  <input
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground"
                    placeholder="e.g. +919949740776"
                  />
                </label>
              </div>
              <label className="block">
                <span className="eyebrow text-[10px] mb-1.5 block">Store Tagline</span>
                <input
                  value={storeTagline}
                  onChange={(e) => setStoreTagline(e.target.value)}
                  className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground"
                  placeholder="e.g. Heirloom Indian Silk Sarees"
                />
              </label>
            </div>
          </div>

          {/* Pricing & Checkout Rules */}
          <div className="border border-border bg-background">
            <div className="border-b border-border bg-champagne/10 px-6 py-4 flex items-center gap-2">
              <Settings className="h-4 w-4 text-gold" />
              <h3 className="eyebrow text-xs">Shipping & Taxes</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="block">
                  <span className="eyebrow text-[10px] mb-1.5 block">Flat Shipping Cost (₹)</span>
                  <input
                    type="number"
                    value={shippingCost}
                    onChange={(e) => setShippingCost(Number(e.target.value))}
                    min={0}
                    className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground"
                    placeholder="e.g. 299"
                  />
                </label>
                <label className="block">
                  <span className="eyebrow text-[10px] mb-1.5 block">
                    Free Shipping Threshold (₹)
                  </span>
                  <input
                    type="number"
                    value={freeShippingThreshold}
                    onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                    min={0}
                    className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground"
                    placeholder="e.g. 5000"
                  />
                </label>
                <label className="block">
                  <span className="eyebrow text-[10px] mb-1.5 block">GST / Tax Rate (0 to 1)</span>
                  <input
                    type="number"
                    step="0.01"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    min={0}
                    max={1}
                    className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground"
                    placeholder="e.g. 0.18"
                  />
                </label>
              </div>
              <p className="text-xs text-muted-foreground bg-champagne/10 p-3 border border-border/60">
                💡 <strong>GST Tip:</strong> A value of <code>0.18</code> corresponds to a 18% Goods
                and Services Tax added at checkout. Set to <code>0</code> if pricing is
                tax-inclusive.
              </p>
            </div>
          </div>

          {/* Security Banner */}
          <div className="border border-amber-200 bg-amber-50 p-4 text-amber-800 text-xs flex gap-3 items-start">
            <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Caution: System Configuration</p>
              <p className="mt-1">
                Updating these settings affects live calculations on the checkout page, WhatsApp
                widgets, and invoice receipts immediately. Ensure values are accurate.
              </p>
            </div>
          </div>
        </form>
      )}
    </AdminLayout>
  );
}
