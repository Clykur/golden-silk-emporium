"use client";

import { useState, useEffect } from "react";
import { Sparkles, PhoneCall, Mail } from "lucide-react";

export default function MaintenancePage() {
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 32, seconds: 15 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        clearInterval(timer);
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNum = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="bg-background min-h-screen flex flex-col items-center justify-center px-6 text-center select-none relative overflow-hidden">
      {/* Decorative Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(0.91_0.012_80/0.05)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.91_0.012_80/0.05)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Luxury Frame */}
      <div className="absolute inset-8 border border-gold/10 pointer-events-none" />
      <div className="absolute inset-10 border border-gold/5 pointer-events-none" />

      <div className="relative z-10 max-w-lg w-full border border-gold/20 bg-champagne/10 backdrop-blur-md p-10 md:p-14 shadow-soft space-y-8 animate-rise">
        <div className="h-16 w-16 mx-auto rounded bg-gold/10 grid place-items-center text-gold border border-gold/20">
          <Sparkles className="h-7 w-7" />
        </div>

        <div className="space-y-3">
          <p className="eyebrow text-gold text-center">Atelier Maintenance</p>
          <h1 className="font-display text-3.5xl md:text-4xl text-ink font-semibold tracking-wide leading-tight">
            We're making Drapeva even better
          </h1>
          <span className="gold-divider mx-auto block" />
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
            Our digital showroom is undergoing brief curation and refinements. We shall reopen
            shortly.
          </p>
        </div>

        {/* Countdown Timer */}
        <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto border-y border-border/80 py-6">
          <div className="text-center">
            <span className="font-display text-3xl text-ink font-bold">
              {formatNum(timeLeft.hours)}
            </span>
            <p className="text-[10px] eyebrow mt-1">Hours</p>
          </div>
          <div className="text-center border-x border-border/80">
            <span className="font-display text-3xl text-ink font-bold">
              {formatNum(timeLeft.minutes)}
            </span>
            <p className="text-[10px] eyebrow mt-1">Minutes</p>
          </div>
          <div className="text-center">
            <span className="font-display text-3xl text-ink font-bold">
              {formatNum(timeLeft.seconds)}
            </span>
            <p className="text-[10px] eyebrow mt-1">Seconds</p>
          </div>
        </div>

        {/* Concierge Contact Info */}
        <div className="space-y-4 pt-4 border-t border-border/60">
          <p className="text-xs text-muted-foreground">
            For urgent collection inquiries, please contact our concierge:
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-xs font-semibold uppercase tracking-wider text-ink mt-2">
            <a
              href="https://wa.me/918123045318"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 hover:text-gold transition-colors"
            >
              <PhoneCall className="h-4 w-4 text-gold" />
              +91 81230 45318
            </a>
            <span className="hidden sm:inline text-muted-foreground/50">|</span>
            <a
              href="mailto:drapeva2026@gmail.com"
              className="inline-flex items-center gap-2 hover:text-gold transition-colors"
            >
              <Mail className="h-4 w-4 text-gold" />
              drapeva2026@gmail.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
