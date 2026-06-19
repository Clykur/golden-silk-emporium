import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { User } from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import { authApi } from "@/lib/api";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/dashboard/profile")({
  head: () => ({
    meta: [
      { title: "Profile Settings — Drapeva" },
      { name: "description", content: "Edit your Drapeva profile settings." },
    ],
  }),
  component: ProfileSettings,
});

function ProfileSettings() {
  const { user, setAuth } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.updateProfile({ name, phone: phone || undefined });
      // Re-fetch profile to update local state
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        if (profile) {
          // Refresh auth store with updated profile
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            setAuth(profile, { access_token: session.access_token, refresh_token: session.refresh_token });
          }
        }
      }
      toast.success("Profile updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const initials = (user.name || user.email || "?").charAt(0).toUpperCase();

  return (
    <DashboardLayout title="Profile Settings" subtitle="My Profile">
      <div className="max-w-lg space-y-8">
        {/* Avatar */}
        <div className="flex items-center gap-5">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-gold/20 to-gold/40 grid place-items-center text-gold font-display text-3xl ring-2 ring-gold/20 shrink-0">
            {initials}
          </div>
          <div>
            <p className="font-display text-lg">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="text-xs text-muted-foreground mt-1 capitalize">{user.role} account</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="border border-border p-6 space-y-5">
          <h2 className="font-display text-lg border-b border-border pb-4">Personal Information</h2>

          <label className="block">
            <span className="eyebrow mb-2 block">Full Name</span>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-border bg-background px-4 py-3 text-sm focus:border-foreground focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="eyebrow mb-2 block">Email Address</span>
            <input
              type="email"
              disabled
              value={user.email}
              className="w-full border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground cursor-not-allowed"
            />
            <p className="text-[10px] text-muted-foreground mt-1">Email cannot be changed. Contact support if needed.</p>
          </label>

          <label className="block">
            <span className="eyebrow mb-2 block">Phone Number</span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-border bg-background px-4 py-3 text-sm focus:border-foreground focus:outline-none"
              placeholder="+91 98765 43210"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="bg-foreground text-background px-8 py-3 text-xs font-medium tracking-[0.25em] uppercase transition-colors hover:bg-gold hover:text-gold-foreground disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>

        {/* Info note */}
        <div className="text-xs text-muted-foreground flex gap-2 items-start">
          <User className="h-4 w-4 shrink-0 mt-0.5" />
          <p>
            To change your password, visit the{" "}
            <a href="/dashboard/security" className="border-b border-muted-foreground hover:text-foreground">
              Security page
            </a>
            .
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
