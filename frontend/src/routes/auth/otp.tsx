import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { authApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";
import { supabase } from "@/lib/supabase";
import { Phone, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/auth/otp")({
  head: () => ({
    meta: [
      { title: "Mobile OTP Login — Drapeva" },
      { name: "description", content: "Sign in with your mobile number using a one-time passcode." },
    ],
  }),
  component: OtpVerification,
});

function OtpVerification() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuth((s) => s.setAuth);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return toast.error("Please enter your phone number");
    setLoading(true);

    try {
      await authApi.sendOtp(phone);
      setStep(2);
      toast.success("OTP sent to your mobile number");
    } catch (err: any) {
      // Provide helpful error for unconfigured SMS
      if (err.message?.includes("Phone") || err.message?.includes("SMS") || err.message?.includes("provider")) {
        toast.error("Phone login is not yet configured. Please use Email & Password to sign in.");
      } else {
        toast.error(err.message || "Failed to send OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return toast.error("Please enter the 6-digit OTP");
    setLoading(true);

    try {
      const data = await authApi.verifyOtp(phone, code);

      if (data.session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.session.user.id)
          .single();

        if (profile) {
          setAuth(profile, {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          });
        }
        toast.success("Verified! Welcome to the atelier.");
        if (profile?.role === "admin") {
          router.navigate({ to: "/admin" });
        } else {
          router.navigate({ to: "/dashboard" });
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Invalid OTP code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Format phone for display
  const displayPhone = phone.replace(/\D/g, "");

  return (
    <div className="flex min-h-[100svh] items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-gold/10 grid place-items-center">
            <Phone className="h-6 w-6 text-gold" />
          </div>
          <p className="eyebrow text-gold">Verification</p>
          <h1 className="mt-3 font-display text-3xl">
            {step === 1 ? "Mobile Login" : "Enter OTP"}
          </h1>
          <span className="gold-divider mt-4 block mx-auto" />
        </div>

        <div className="border border-border bg-champagne/30 p-8 md:p-10 shadow-soft">
          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <p className="text-xs text-muted-foreground leading-relaxed text-center">
                Enter your registered mobile number and we'll send you a one-time passcode.
              </p>

              <label className="block">
                <span className="eyebrow mb-2 block">Mobile Number</span>
                <div className="flex border border-border bg-background">
                  <div className="flex items-center px-3 border-r border-border bg-champagne/30">
                    <span className="text-sm text-muted-foreground">🇮🇳 +91</span>
                  </div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="flex-1 bg-transparent px-4 py-3 text-sm focus:outline-none"
                    placeholder="98765 43210"
                    maxLength={15}
                    autoComplete="tel"
                  />
                </div>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-foreground py-4 text-xs font-medium tracking-[0.25em] uppercase text-background transition-colors hover:bg-gold hover:text-gold-foreground disabled:opacity-50"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>

              <p className="text-center text-xs text-muted-foreground">
                <a
                  href="/auth/login"
                  className="flex items-center justify-center gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Back to Email Login
                </a>
              </p>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <p className="text-xs text-muted-foreground leading-relaxed text-center">
                A 6-digit code has been sent to <strong>+91 {displayPhone.slice(-10)}</strong>
              </p>

              <label className="block">
                <span className="eyebrow mb-3 block text-center">6-Digit OTP</span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full border border-border bg-background px-6 py-4 text-center text-2xl tracking-[0.6em] font-mono focus:border-foreground focus:outline-none"
                  placeholder="——————"
                  autoComplete="one-time-code"
                />
              </label>

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full bg-foreground py-4 text-xs font-medium tracking-[0.25em] uppercase text-background transition-colors hover:bg-gold hover:text-gold-foreground disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify & Sign In"}
              </button>

              <div className="flex justify-between text-xs text-muted-foreground">
                <button
                  type="button"
                  onClick={() => { setStep(1); setCode(""); }}
                  className="hover:text-foreground flex items-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Change Number
                </button>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="hover:text-foreground disabled:opacity-50"
                >
                  Resend OTP
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
