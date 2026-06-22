"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { authApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff, CheckCircle, Mail, Phone } from "lucide-react";

export default function Register() {
  const [tab, setTab] = useState<"email" | "phone">("email");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const router = useRouter();
  const setAuth = useAuth((s) => s.setAuth);

  const passwordStrength = () => {
    if (password.length === 0) return null;
    if (password.length < 6) return { label: "Too short", color: "bg-red-400", width: "33%" };
    if (password.length < 10 || !/[A-Z]/.test(password))
      return { label: "Moderate", color: "bg-amber-400", width: "66%" };
    return { label: "Strong", color: "bg-emerald-400", width: "100%" };
  };

  const strength = passwordStrength();

  const { user, loading: authLoading } = useAuth();
  useEffect(() => {
    if (!authLoading && user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);

    try {
      let data;
      if (tab === "email") {
        data = await authApi.register({
          email,
          password,
          name,
          phone: phone || undefined,
        });
      } else {
        data = await authApi.register({
          phone,
          password,
          name,
        });
      }

      toast.success("Account created successfully! Please sign in.");
      router.push("/login");
    } catch (err: any) {
      const msg =
        err.message && err.message !== "{}" && err.message !== "[object Object]"
          ? err.message
          : "Registration failed";

      if (msg.includes("already registered") || msg.includes("already exists")) {
        toast.error("This identifier is already registered. Please sign in instead.");
      } else {
        toast.error(
          `${msg}. Note: Ensure provider confirmations are set up in your Supabase Dashboard, and the database SQL schema has been applied.`,
          { duration: 6000 },
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (registered) {
    return (
      <div className="flex h-[100svh] overflow-hidden items-center justify-center bg-background px-4">
        <div className="w-full max-w-md text-center p-0">
          <CheckCircle className="h-12 w-12 text-gold mx-auto mb-4" />
          <p className="eyebrow text-gold">Check Verification</p>
          <h1 className="mt-3 font-display text-3xl">
            {tab === "email" ? "Confirm Your Email" : "Confirm Your Phone"}
          </h1>
          <span className="gold-divider mt-4 block mx-auto" />
          <p className="mt-6 text-sm text-muted-foreground leading-relaxed">
            {tab === "email" ? (
              <>
                We've sent a confirmation link to <strong>{email}</strong>. Please check your inbox
                and click the link to activate your account.
              </>
            ) : (
              <>
                We've sent a verification code to <strong>{phone}</strong>. Please check your
                messages and verify your account to proceed.
              </>
            )}
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            Already confirmed?{" "}
            <Link href="/login" className="border-b border-foreground pb-0.5 text-foreground">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[100svh] overflow-hidden items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="eyebrow text-gold">The Maison</p>
          <h1 className="mt-3 font-display text-3xl md:text-4xl">Create Account</h1>
          <span className="gold-divider mt-4 block mx-auto" />
        </div>

        <div>
          {/* Tab switcher */}
          <div className="flex justify-center gap-8 border-b border-border/40 mb-8">
            <button
              onClick={() => {
                setTab("email");
                setPhone("");
              }}
              className={`flex items-center justify-center gap-2 pb-4 text-xs uppercase tracking-widest font-medium transition-colors border-b-2 ${
                tab === "email"
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Mail className="h-3.5 w-3.5" />
              Email & Password
            </button>
            <button
              onClick={() => {
                setTab("phone");
                setPhone("");
              }}
              className={`flex items-center justify-center gap-2 pb-4 text-xs uppercase tracking-widest font-medium transition-colors border-b-2 ${
                tab === "phone"
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Phone className="h-3.5 w-3.5" />
              Mobile & Password
            </button>
          </div>

          <div className="p-0">
            <form onSubmit={handleSubmit} className="space-y-5">
              <label className="block">
                <span className="eyebrow mb-2 block">Full Name</span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-border bg-background px-4 py-3 text-sm focus:border-foreground focus:outline-none"
                  placeholder="e.g. Aishwarya Sen"
                  autoComplete="name"
                />
              </label>

              {tab === "email" ? (
                <>
                  <label className="block">
                    <span className="eyebrow mb-2 block">Email Address</span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-border bg-background px-4 py-3 text-sm focus:border-foreground focus:outline-none"
                      placeholder="e.g. aishwarya@example.com"
                      autoComplete="email"
                    />
                  </label>

                  <label className="block">
                    <span className="eyebrow mb-2 block">
                      Phone Number{" "}
                      <span className="normal-case text-muted-foreground text-[10px]">
                        (optional)
                      </span>
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full border border-border bg-background px-4 py-3 text-sm focus:border-foreground focus:outline-none"
                      placeholder="e.g. +91 98765 43210"
                      autoComplete="tel"
                    />
                  </label>
                </>
              ) : (
                <label className="block">
                  <span className="eyebrow mb-2 block">Mobile Number</span>
                  <div className="flex border border-border bg-background">
                    <div className="flex items-center px-3 border-r border-border bg-champagne/30">
                      <span className="text-sm text-muted-foreground">🇮🇳 +91</span>
                    </div>
                    <input
                      type="tel"
                      required
                      value={phone.replace(/^\+91/, "")}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setPhone(val ? `+91${val}` : "");
                      }}
                      className="flex-1 bg-transparent px-4 py-3 text-sm focus:outline-none"
                      placeholder="98765 43210"
                      maxLength={10}
                      autoComplete="tel"
                    />
                  </div>
                </label>
              )}

              <label className="block">
                <span className="eyebrow mb-2 block">Password</span>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-border bg-background px-4 py-3 pr-12 text-sm focus:border-foreground focus:outline-none"
                    placeholder="Min. 6 characters"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {strength && (
                  <div className="mt-2">
                    <div className="h-1 w-full bg-border rounded-full overflow-hidden">
                      <div
                        className={`h-full ${strength.color} transition-all duration-300`}
                        style={{ width: strength.width }}
                      />
                    </div>
                    <p className="text-[10px] mt-1 text-muted-foreground">{strength.label}</p>
                  </div>
                )}
              </label>

              <label className="block">
                <span className="eyebrow mb-2 block">Confirm Password</span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full border bg-background px-4 py-3 text-sm focus:outline-none ${
                    confirmPassword && confirmPassword !== password
                      ? "border-red-400 focus:border-red-400"
                      : "border-border focus:border-foreground"
                  }`}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                />
                {confirmPassword && confirmPassword !== password && (
                  <p className="text-[10px] text-red-500 mt-1">Passwords do not match</p>
                )}
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-foreground py-4 text-xs font-medium tracking-[0.25em] uppercase text-background transition-colors hover:bg-gold hover:text-gold-foreground disabled:opacity-50"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Already registered?{" "}
              <Link
                href="/login"
                className="border-b border-muted-foreground pb-0.5 text-foreground hover:border-foreground"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
