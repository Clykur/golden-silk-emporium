"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { toast } from "sonner";
import { authApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff } from "lucide-react";

export const dynamic = "force-dynamic";

function LoginContent() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuth((s) => s.setAuth);
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "";
  const message = searchParams.get("message") || "";

  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      if (redirect) {
        router.push(redirect);
      } else if (user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    }
  }, [user, authLoading, router, redirect]);

  useEffect(() => {
    if (message) {
      toast.info(message, { id: "auth-gate-message" });
    }
  }, [message]);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { session } = await authApi.login(identifier, password);
      if (!session) throw new Error("Login failed — please try again");

      let { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (!profile) {
        const metadata = session.user.user_metadata || {};
        const { data: newProfile } = await supabase
          .from("profiles")
          .insert({
            id: session.user.id,
            email: session.user.email || "",
            name:
              metadata.name || metadata.full_name || session.user.email?.split("@")[0] || "User",
            phone: session.user.phone || metadata.phone || null,
            role: metadata.role || "customer",
          })
          .select()
          .maybeSingle();
        if (newProfile) {
          profile = newProfile;
        }
      }

      if (profile) {
        setAuth(profile, {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        });
      }

      toast.success(
        profile?.name
          ? `Welcome back, ${profile.name.split(" ")[0]}!`
          : "Welcome back to the Maison",
      );

      if (redirect) {
        router.push(redirect);
      } else if (profile?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      toast.error(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[100svh] overflow-hidden items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="eyebrow text-gold">The Maison</p>
          <h1 className="mt-3 font-display text-3xl md:text-4xl">Welcome Back</h1>
          <span className="gold-divider mt-4 block mx-auto" />
        </div>

        <div>
          <div className="p-0">
            {message && (
              <div className="mb-6 border border-gold/30 bg-gold/5 p-4 text-center text-xs tracking-wider text-gold-foreground uppercase">
                {message}
              </div>
            )}

            <form onSubmit={handlePasswordLogin} className="space-y-6">
              <label className="block">
                <span className="eyebrow mb-2 block">Email or Mobile Number</span>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full border border-border bg-background px-4 py-3 text-sm focus:border-foreground focus:outline-none"
                  placeholder="e.g. bride@drapeva.com or 9876543210"
                  autoComplete="username"
                />
              </label>

              <label className="block">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="eyebrow">Password</span>
                  <Link
                    href="/forgot-password"
                    className="text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-border bg-background px-4 py-3 pr-12 text-sm focus:border-foreground focus:outline-none"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-foreground py-4 text-xs font-medium tracking-[0.25em] uppercase text-background transition-colors hover:bg-gold hover:text-gold-foreground disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <p className="mt-8 text-center text-xs text-muted-foreground">
              New to the Drapeva?{" "}
              <Link
                href="/register"
                className="border-b border-muted-foreground pb-0.5 text-foreground hover:border-foreground"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">Loading login...</div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
