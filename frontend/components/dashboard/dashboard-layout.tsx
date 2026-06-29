"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/lib/auth-store";
import { toast } from "sonner";
import { ChevronRight } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  headerAction?: ReactNode;
}

export function DashboardLayout({ children, title, subtitle, headerAction }: DashboardLayoutProps) {
  const { user, loading } = useAuth();

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only redirect once loading is complete AND we've confirmed no user
    // AND we are not in the middle of an intentional logout.
    if (!loading && !user && !useAuth.getState().isLoggingOut) {
      toast.error("Please sign in to access your account");
      router.push(
        `/login?redirect=${encodeURIComponent(pathname)}&message=${encodeURIComponent("Please sign in to access your account")}`,
      );
    }
  }, [loading, user, pathname, router]);

  // Show spinner while auth is loading OR while we still have a persisted user
  // being confirmed by the auth listener
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-[80vh] bg-background">
      <main className="container-luxe pt-4 pb-8 md:pt-6 md:pb-12">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center text-sm text-muted-foreground mb-6 overflow-x-auto whitespace-nowrap hide-scrollbar">
          <Link href="/" className="hover:text-gold transition-colors font-medium">
            Home
          </Link>
          <ChevronRight className="h-4 w-4 mx-2 opacity-50 shrink-0" />
          {pathname !== "/account" ? (
            <>
              <Link href="/account" className="hover:text-gold transition-colors font-medium">
                Your Account
              </Link>
              <ChevronRight className="h-4 w-4 mx-2 opacity-50 shrink-0" />
              <span className="text-foreground font-semibold">{title}</span>
            </>
          ) : (
            <span className="text-foreground font-semibold">Your Account</span>
          )}
        </nav>

        {title && pathname !== "/account" && (
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl md:text-4xl text-ink font-semibold">{title}</h1>
              {subtitle && <p className="text-sm text-muted-foreground mt-2">{subtitle}</p>}
            </div>
            {headerAction && <div className="shrink-0">{headerAction}</div>}
          </div>
        )}

        {children}
      </main>
    </div>
  );
}
