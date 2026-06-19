import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { authApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";
import { supabase } from "@/lib/supabase";
import { z } from "zod";
import { Phone, Mail, Eye, EyeOff } from "lucide-react";

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
  message: z.string().optional(),
});

export const Route = createFileRoute("/auth/login")({
  validateSearch: loginSearchSchema,
  head: () => ({
    meta: [
      { title: "Sign In — Drapeva" },
      { name: "description", content: "Access your Drapeva account." },
    ],
  }),
  component: Login,
});

function Login() {
  const [tab, setTab] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuth((s) => s.setAuth);
  const { redirect, message } = Route.useSearch();

  useEffect(() => {
    if (message) {
      toast.info(message, { id: "auth-gate-message" });
    }
  }, [message]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { session } = await authApi.login(email, password);
      if (!session) throw new Error("Login failed — please try again");

      const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
      if (profile) {
        setAuth(profile, { access_token: session.access_token, refresh_token: session.refresh_token });
      }

      toast.success("Welcome back to the atelier");
      if (redirect) {
        router.navigate({ to: redirect as any });
      } else if (profile?.role === "admin") {
        router.navigate({ to: "/admin" });
      } else {
        router.navigate({ to: "/dashboard" });
      }
    } catch (err: any) {
      toast.error(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100svh] items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="eyebrow text-gold">The Atelier</p>
          <h1 className="mt-3 font-display text-3xl md:text-4xl">Welcome Back</h1>
          <span className="gold-divider mt-4 block mx-auto" />
        </div>

        <div className="border border-border bg-champagne/30 shadow-soft">
          {/* Tab switcher */}
          <div className="grid grid-cols-2 border-b border-border">
            <button
              onClick={() => setTab("email")}
              className={`flex items-center justify-center gap-2 py-4 text-xs uppercase tracking-widest font-medium transition-colors ${
                tab === "email" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Mail className="h-3.5 w-3.5" />
              Email & Password
            </button>
            <button
              onClick={() => setTab("phone")}
              className={`flex items-center justify-center gap-2 py-4 text-xs uppercase tracking-widest font-medium transition-colors ${
                tab === "phone" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Phone className="h-3.5 w-3.5" />
              Mobile OTP
            </button>
          </div>

          <div className="p-8 md:p-10">
            {message && (
              <div className="mb-6 border border-gold/30 bg-gold/5 p-4 text-center text-xs tracking-wider text-gold-foreground uppercase">
                {message}
              </div>
            )}

            {tab === "email" ? (
              <form onSubmit={handleEmailLogin} className="space-y-6">
                <label className="block">
                  <span className="eyebrow mb-2 block">Email Address</span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-border bg-background px-4 py-3 text-sm focus:border-foreground focus:outline-none"
                    placeholder="e.g. bride@drapeva.com"
                    autoComplete="email"
                  />
                </label>

                <label className="block">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="eyebrow">Password</span>
                    <Link
                      to="/auth/forgot-password"
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
                  to="/auth/otp"
                  className="block w-full text-center bg-foreground py-4 text-xs font-medium tracking-[0.25em] uppercase text-background transition-colors hover:bg-gold hover:text-gold-foreground"
                >
                  Continue with Mobile OTP
                </Link>
              </div>
            )}

            <p className="mt-8 text-center text-xs text-muted-foreground">
              New to the atelier?{" "}
              <Link
                to="/auth/register"
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
