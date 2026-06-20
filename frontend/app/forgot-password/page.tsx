"use client";

import Link from "next/link";
import { useRouter, usePathname, useSearchParams, useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.auth.forgotPassword(email);
      setSubmitted(true);
      toast.success("Recovery instructions sent if account exists");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit recovery request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[75svh] items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-md border border-border bg-champagne/30 p-8 md:p-10 shadow-soft">
        <div className="text-center">
          <p className="eyebrow text-gold">Security</p>
          <h1 className="mt-3 font-display text-3xl">Recover Password</h1>
          <span className="gold-divider mt-4 block mx-auto" />
        </div>

        {submitted ? (
          <div className="mt-8 text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Please check your inbox. If the email is registered, we have sent instructions to
              reset your password.
            </p>
            <Link
              href="/login"
              className="inline-block bg-foreground px-6 py-3 text-xs uppercase tracking-widest text-background"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Enter your email address and we'll send you an link to reset your account password.
            </p>
            <label className="block">
              <span className="eyebrow mb-2 block">Email Address</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-border bg-background px-4 py-3 text-sm focus:border-foreground focus:outline-none"
                placeholder="e.g. customer@example.com"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-foreground py-4 text-xs font-medium tracking-[0.25em] uppercase text-background transition-colors hover:bg-gold hover:text-gold-foreground disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <div className="text-center mt-4">
              <Link href="/login" className="text-xs text-muted-foreground hover:text-foreground">
                Cancel
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
