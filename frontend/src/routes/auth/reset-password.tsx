import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "@/lib/api";

const searchSchema = z.object({
  token: z.string().catch(""),
});

export const Route = createFileRoute("/auth/reset-password")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Reset Password — Drapeva" },
      { name: "description", content: "Reset your Drapeva account password." },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const { token } = Route.useSearch();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      return toast.error("Passwords do not match");
    }
    setLoading(true);

    try {
      await api.auth.resetPassword({ token, password });
      toast.success("Password reset successfully");
      router.navigate({ to: "/auth/login" });
    } catch (err: any) {
      toast.error(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[75svh] items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-md border border-border bg-champagne/30 p-8 md:p-10 shadow-soft">
        <div className="text-center">
          <p className="eyebrow text-gold">Security</p>
          <h1 className="mt-3 font-display text-3xl">Reset Password</h1>
          <span className="gold-divider mt-4 block mx-auto" />
        </div>

        {!token ? (
          <div className="mt-8 text-center space-y-4">
            <p className="text-sm text-destructive">
              Reset token is invalid or has expired. Please request a new link.
            </p>
            <Link
              to="/auth/forgot-password"
              className="inline-block border border-border px-5 py-2.5 text-xs uppercase tracking-widest"
            >
              Request New Link
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block">
              <span className="eyebrow mb-2 block">New Password</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-border bg-background px-4 py-3 text-sm focus:border-foreground focus:outline-none"
                placeholder="••••••••"
              />
            </label>

            <label className="block">
              <span className="eyebrow mb-2 block">Confirm Password</span>
              <input
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full border border-border bg-background px-4 py-3 text-sm focus:border-foreground focus:outline-none"
                placeholder="••••••••"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-foreground py-4 text-xs font-medium tracking-[0.25em] uppercase text-background transition-colors hover:bg-gold hover:text-gold-foreground disabled:opacity-50"
            >
              {loading ? "Saving password..." : "Save Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
