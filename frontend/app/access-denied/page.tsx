"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function AccessDeniedPage() {
  const router = useRouter();

  return (
    <div className="bg-background min-h-[75vh] flex flex-col items-center justify-center px-6 text-center select-none relative overflow-hidden">
      {/* Decorative Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(0.91_0.012_80/0.05)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.91_0.012_80/0.05)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Luxury Frame */}
      <div className="absolute inset-8 border border-gold/10 pointer-events-none" />

      <div className="relative z-10 max-w-md w-full border border-gold/20 bg-champagne/10 backdrop-blur-md p-10 shadow-soft space-y-6 animate-rise">
        <div className="h-16 w-16 mx-auto rounded bg-gold/10 grid place-items-center text-gold border border-gold/20">
          <ShieldAlert className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <p className="eyebrow text-gold text-center">Security (403)</p>
          <h1 className="font-display text-3xl text-ink font-semibold tracking-wide">
            Entrance Denied
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed mt-4">
            You do not have the required clearance to access this atelier salon. Please sign in with
            an administrator account or return to the store.
          </p>
        </div>

        <div className="space-y-3 pt-4">
          <button
            onClick={() => router.back()}
            className="w-full inline-flex items-center justify-center gap-2 bg-foreground text-background px-6 py-3.5 text-xs font-semibold tracking-widest uppercase hover:bg-gold hover:text-gold-foreground transition-all duration-300"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
            Go Back
          </button>
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center border border-border bg-background px-6 py-3.5 text-xs font-semibold tracking-widest uppercase hover:border-gold hover:text-gold transition-all duration-300"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
