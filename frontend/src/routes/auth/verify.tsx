import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "@/lib/api";

const searchSchema = z.object({
  token: z.string().catch(""),
});

export const Route = createFileRoute("/auth/verify")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Verify Email — Drapeva" },
      { name: "description", content: "Verify your email address." },
    ],
  }),
  component: VerifyEmail,
});

function VerifyEmail() {
  const { token } = Route.useSearch();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

    api.auth
      .verifyEmail(token)
      .then(() => {
        setStatus("success");
        toast.success("Email verified successfully");
      })
      .catch((err) => {
        console.error(err);
        setStatus("error");
        toast.error("Failed to verify email. Token might be invalid or expired.");
      });
  }, [token]);

  return (
    <div className="flex min-h-[75svh] items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-md border border-border bg-champagne/30 p-8 md:p-10 text-center shadow-soft">
        <p className="eyebrow text-gold">Verification</p>
        <h1 className="mt-3 font-display text-3xl">Email Verification</h1>
        <span className="gold-divider mt-4 block mx-auto" />

        <div className="mt-8 space-y-4">
          {status === "verifying" && (
            <p className="text-sm text-muted-foreground animate-pulse">
              Verifying your email credentials with our registry...
            </p>
          )}

          {status === "success" && (
            <>
              <p className="text-sm text-muted-foreground">
                Thank you. Your email address has been successfully verified. You now have full
                access to our online atelier services.
              </p>
              <Link
                to="/auth/login"
                className="mt-6 inline-block bg-foreground px-6 py-3 text-xs uppercase tracking-widest text-background"
              >
                Proceed to Login
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <p className="text-sm text-destructive">
                The verification token is invalid or has expired.
              </p>
              <Link to="/" className="mt-6 inline-block border-b border-foreground pb-0.5 eyebrow">
                Return to home
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
