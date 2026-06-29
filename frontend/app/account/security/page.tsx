"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Shield, Key, AlertTriangle, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import { authApi } from "@/lib/api";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

export default function Security() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd !== confirmPwd) return toast.error("New passwords do not match");
    if (newPwd.length < 6) return toast.error("Password must be at least 6 characters");
    setPwdLoading(true);
    try {
      await authApi.updatePassword(newPwd);
      toast.success("Password updated successfully");
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
    } catch (err: any) {
      toast.error(err.message || "Failed to update password");
    } finally {
      setPwdLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        "Are you absolutely sure? This action cannot be undone and will permanently delete your account and all data.",
      )
    )
      return;
    if (!confirm("Final confirmation: Delete your Drapeva account?")) return;
    await logout();
    toast.info("Account deletion requested. Please contact support to complete the process.");
    router.push("/");
  };

  return (
    <DashboardLayout title="Security" subtitle="Account Security">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 auto-rows-fr">
        {/* Change Password */}
        <form
          onSubmit={handlePasswordChange}
          className="border border-border p-6 h-full flex flex-col"
        >
          <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
            <div className="flex items-center gap-3">
              <Key className="h-5 w-5 text-gold" />
              <h2 className="font-display text-lg">Change Password</h2>
            </div>
            <button
              type="submit"
              disabled={pwdLoading}
              className="bg-foreground text-background px-4 py-2 text-xs uppercase tracking-widest font-medium hover:bg-gold hover:text-gold-foreground transition-colors disabled:opacity-50"
            >
              {pwdLoading ? "Updating..." : "Update Password"}
            </button>
          </div>

          <div className="space-y-4 flex-1">
            <label className="block">
              <span className="eyebrow mb-1 block">New Password</span>
              <input
                type="password"
                required
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                className="w-full border border-border bg-background px-4 py-3 text-sm focus:border-foreground focus:outline-none"
                placeholder="Min. 6 characters"
                minLength={6}
              />
            </label>

            <label className="block">
              <span className="eyebrow mb-1 block">Confirm New Password</span>
              <input
                type="password"
                required
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                className={`w-full border bg-background px-4 py-3 text-sm focus:outline-none ${
                  confirmPwd && confirmPwd !== newPwd
                    ? "border-red-400"
                    : "border-border focus:border-foreground"
                }`}
                placeholder="Re-enter new password"
              />
              {confirmPwd && confirmPwd !== newPwd && (
                <p className="text-[10px] text-red-500 mt-1">Passwords do not match</p>
              )}
            </label>
          </div>
        </form>

        {/* Account Info */}
        <section className="border border-border p-6 h-full flex flex-col">
          <div className="flex items-center gap-3 border-b border-border pb-4 mb-4">
            <Shield className="h-5 w-5 text-gold" />
            <h2 className="font-display text-lg">Account Information</h2>
          </div>

          <div className="space-y-3 text-sm flex-1">
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{user?.email}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-muted-foreground">Account Role</span>
              <span className="capitalize font-medium">{user?.role}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-muted-foreground">Member Since</span>
              <span>
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString("en-IN", {
                      month: "long",
                      year: "numeric",
                    })
                  : "—"}
              </span>
            </div>
          </div>
        </section>

        {/* Sign Out All Devices */}
        <section className="border border-border p-6 h-full flex flex-col">
          <div className="flex items-center gap-3 border-b border-border pb-4 mb-4">
            <LogOut className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-display text-lg">Sessions</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Sign out from all devices and sessions.
          </p>
          <div className="mt-auto">
            <button
              onClick={async () => {
                await logout();
                router.push("/login");
              }}
              className="w-full border border-border px-5 py-3 text-xs uppercase tracking-widest text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
            >
              Sign Out of All Devices
            </button>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="border border-red-200 p-6 h-full flex flex-col">
          <div className="flex items-center gap-3 border-b border-red-200 pb-4 mb-4">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <h2 className="font-display text-lg text-red-700">Danger Zone</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <div className="mt-auto">
            <button
              onClick={handleDeleteAccount}
              className="w-full border border-red-300 bg-red-50 text-red-700 px-5 py-3 text-xs uppercase tracking-widest hover:bg-red-100 transition-colors"
            >
              Delete My Account
            </button>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
