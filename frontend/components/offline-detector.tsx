"use client";

import { useState, useEffect } from "react";
import { WifiOff, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export function OfflineDetector({ children }: { children: React.ReactNode }) {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOffline(!window.navigator.onLine);

      const handleOnline = () => {
        setIsOffline(false);
        toast.success("Connection restored. Welcome back!", {
          icon: "✨",
        });
      };

      const handleOffline = () => {
        setIsOffline(true);
        toast.error("You are offline. Please check your connection.");
      };

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  const handleRetry = () => {
    if (typeof window !== "undefined") {
      const online = window.navigator.onLine;
      if (online) {
        setIsOffline(false);
        toast.success("Connection restored!");
      } else {
        toast.error("Still offline. Please check your connection.");
      }
    }
  };

  if (isOffline) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background px-6 text-center select-none animate-fade-in">
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(0.91_0.012_80/0.15)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.91_0.012_80/0.15)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

        {/* Luxury Frame */}
        <div className="absolute inset-8 border border-gold/10 pointer-events-none" />
        <div className="absolute inset-10 border border-gold/5 pointer-events-none" />

        <div className="relative z-10 max-w-md w-full border border-gold/20 bg-champagne/10 backdrop-blur-md p-10 shadow-soft space-y-6">
          <div className="h-16 w-16 mx-auto rounded bg-gold/10 grid place-items-center text-gold border border-gold/20">
            <WifiOff className="h-7 w-7" />
          </div>

          <div className="space-y-2">
            <p className="eyebrow text-gold text-center">Connection Lost</p>
            <h1 className="font-display text-3xl text-ink font-semibold tracking-wide">
              You're Offline
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed mt-4">
              Check your internet connection and try again. We will automatically reconnect you once
              your network is restored.
            </p>
          </div>

          <button
            onClick={handleRetry}
            className="w-full inline-flex items-center justify-center gap-2 bg-foreground text-background px-6 py-4 text-xs font-semibold tracking-widest uppercase hover:bg-gold hover:text-gold-foreground transition-all duration-300"
          >
            <RotateCcw className="h-4.5 w-4.5" />
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
