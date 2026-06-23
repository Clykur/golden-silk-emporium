"use client";

import { useEffect, useState } from "react";
import { User, Camera } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-store";
import { authApi } from "@/lib/api";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function ProfileSettings() {
  const { user, setAuth } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [loading, setLoading] = useState(false);

  const [profilePreview, setProfilePreview] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  const handleProfileImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const preview = URL.createObjectURL(file);
    setProfilePreview(preview);

    toast.success("Profile image selected. Storage upload can be added next.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      await authApi.updateProfile({
        name,
        phone: phone || undefined,
      });

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (profile) {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session) {
            setAuth(profile, {
              access_token: session.access_token,
              refresh_token: session.refresh_token,
            });
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
    <DashboardLayout>
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8 md:mb-12 text-center">
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight">
            My Account
          </h1>

          <p className="mt-3 text-muted-foreground text-sm sm:text-base md:text-lg">
            Manage your profile information
          </p>
        </div>

        {/* Profile Section */}
        <div className="border border-border rounded-xl bg-background p-5 sm:p-6 md:p-8 mb-6 md:mb-8">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              {profilePreview ? (
                <img
                  src={profilePreview}
                  alt="Profile"
                  className="h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 rounded-full object-cover border"
                />
              ) : (
                <div className="h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 rounded-full bg-gradient-to-br from-gold/20 to-gold/40 flex items-center justify-center text-3xl md:text-4xl font-display text-gold">
                  {initials}
                </div>
              )}

              <label className="absolute bottom-0 right-0 h-8 w-8 md:h-10 md:w-10 rounded-full bg-black text-white flex items-center justify-center cursor-pointer hover:bg-gold hover:text-black transition-colors">
                <Camera className="h-4 w-4" />

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfileImage}
                />
              </label>
            </div>

            <h2 className="mt-5 text-xl sm:text-2xl font-semibold break-words text-center">
              {user.name}
            </h2>

            <p className="mt-2 text-sm sm:text-base text-muted-foreground break-all">
              {user.email}
            </p>

            <span className="mt-4 px-4 py-1 rounded-full bg-gold/10 text-gold text-xs uppercase tracking-wider">
              {user.role}
            </span>
          </div>
        </div>

        {/* Personal Information */}
        <div className="border border-border rounded-xl bg-background p-5 sm:p-6 md:p-8">
          <h2 className="text-xl sm:text-2xl font-display mb-6">Personal Information</h2>

          <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>

              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-12 border border-border rounded-lg px-4 bg-background focus:outline-none focus:ring-2 focus:ring-gold/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>

              <input
                type="email"
                disabled
                value={user.email}
                className="w-full h-12 border border-border rounded-lg px-4 bg-muted/30 text-muted-foreground"
              />

              <p className="text-xs text-muted-foreground mt-2">Email cannot be changed.</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>

              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-12 border border-border rounded-lg px-4 bg-background focus:outline-none focus:ring-2 focus:ring-gold/20"
                placeholder="+91 98765 43210"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto h-12 px-8 bg-black text-white rounded-lg hover:bg-gold hover:text-black transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        {/* Security Note */}
        <div className="mt-6 flex items-start gap-3 text-sm text-muted-foreground">
          <User className="h-4 w-4 shrink-0 mt-0.5" />

          <p>
            Need to change your password? Visit the{" "}
            <Link href="/account/security" className="text-gold hover:underline">
              Security Settings
            </Link>
            .
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
