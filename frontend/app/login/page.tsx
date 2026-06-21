"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { toast } from "sonner";
import { authApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";
import { supabase } from "@/lib/supabase";
import { Phone, Mail, Eye, EyeOff } from "lucide-react";

export const dynamic = "force-dynamic";

function LoginContent() {
  const [tab, setTab] = useState<"email" | "phone">("email");
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
      router.push("/");
    }
  }, [user, authLoading, router]);

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

      // The onAuthStateChange listener in providers.tsx will fire with SIGNED_IN
      // event and automatically update auth state + sync cart/wishlist.
      // We still set auth here for instant UI update.
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
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
      if (profile?.role === "admin") {
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
          {/* Tab switcher */}
          <div className="flex justify-center gap-8 border-b border-border/40 mb-8">
            <button
              onClick={() => setTab("email")}
              className={`flex items-center justify-center gap-2 pb-4 text-xs uppercase tracking-widest font-medium transition-colors border-b-2 ${
                tab === "email"
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Mail className="h-3.5 w-3.5" />
              Email/Mobile & Password
            </button>
            <button
              onClick={() => setTab("phone")}
              className={`flex items-center justify-center gap-2 pb-4 text-xs uppercase tracking-widest font-medium transition-colors border-b-2 ${
                tab === "phone"
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Phone className="h-3.5 w-3.5" />
              Mobile OTP
            </button>
          </div>

          <div className="p-0">
            {message && (
              <div className="mb-6 border border-gold/30 bg-gold/5 p-4 text-center text-xs tracking-wider text-gold-foreground uppercase">
                {message}
              </div>
            )}

            {tab === "email" ? (
              <form onSubmit={handlePasswordLogin} className="space-y-6">
                <label className="block">
                  <span className="eyebrow mb-2 block">Email or Mobile Number</span>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full border border-border bg-background px-4 py-3 text-sm focus:border-foreground focus:outline-none"
                    placeholder="e.g. bride@drapeva.com or +919876543210"
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
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground leading-relaxed text-center">
                  Sign in with your registered mobile number using a one-time passcode.
                </p>
                <Link
                  href="/otp"
                  className="block w-full text-center bg-foreground py-4 text-xs font-medium tracking-[0.25em] uppercase text-background transition-colors hover:bg-gold hover:text-gold-foreground"
                >
                  Continue with Mobile OTP
                </Link>
              </div>
            )}

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
