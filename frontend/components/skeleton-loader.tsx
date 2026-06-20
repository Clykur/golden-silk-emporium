"use client";

import { cn } from "@/lib/utils";

interface SkeletonLoaderProps {
  variant?:
    | "product-card"
    | "product-detail"
    | "collection"
    | "dashboard"
    | "orders"
    | "wishlist"
    | "cart";
  className?: string;
  count?: number;
}

export function SkeletonLoader({
  variant = "product-card",
  className,
  count = 1,
}: SkeletonLoaderProps) {
  const renderItems = () => {
    switch (variant) {
      case "product-card":
        return Array.from({ length: count }).map((_, idx) => (
          <div key={idx} className={cn("animate-pulse space-y-4", className)}>
            <div className="aspect-[3/4] w-full bg-champagne/40" />
            <div className="space-y-2">
              <div className="h-3 w-1/4 bg-champagne/60 rounded" />
              <div className="h-4 w-3/4 bg-champagne/40 rounded" />
              <div className="h-3 w-1/3 bg-champagne/50 rounded" />
            </div>
          </div>
        ));

      case "product-detail":
        return (
          <div
            className={cn(
              "animate-pulse grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16 py-10",
              className,
            )}
          >
            {/* Gallery Skeleton */}
            <div className="grid gap-4 md:grid-cols-[100px_1fr] h-fit">
              <div className="flex flex-row md:flex-col gap-3 overflow-x-auto">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] w-16 md:w-24 shrink-0 bg-champagne/30" />
                ))}
              </div>
              <div className="aspect-[3/4] w-full bg-champagne/40" />
            </div>
            {/* Content Skeleton */}
            <div className="space-y-6">
              <div className="h-4 w-1/4 bg-gold/30 rounded" />
              <div className="h-10 w-3/4 bg-champagne/50 rounded" />
              <div className="h-6 w-1/3 bg-champagne/40 rounded" />
              <div className="space-y-2 pt-4 border-t border-border">
                <div className="h-3 w-full bg-champagne/30 rounded" />
                <div className="h-3 w-full bg-champagne/30 rounded" />
                <div className="h-3 w-5/6 bg-champagne/30 rounded" />
              </div>
              <div className="h-14 w-full bg-champagne/50 rounded mt-8" />
              <div className="h-10 w-full bg-champagne/30 rounded mt-4" />
            </div>
          </div>
        );

      case "collection":
        return (
          <div className={cn("animate-pulse space-y-12", className)}>
            {/* Hero banner skeleton */}
            <div className="h-[40svh] min-h-[300px] w-full bg-ink/10 flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="h-3 w-24 bg-gold/40 mx-auto rounded" />
                <div className="h-8 w-48 bg-champagne/40 mx-auto rounded" />
              </div>
            </div>
            <div className="container-luxe">
              <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <div key={idx} className="space-y-4">
                    <div className="aspect-[3/4] w-full bg-champagne/40" />
                    <div className="h-3 w-1/2 bg-champagne/50 rounded" />
                    <div className="h-4 w-3/4 bg-champagne/40 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "dashboard":
        return (
          <div className={cn("animate-pulse space-y-8", className)}>
            {/* Banner skeleton */}
            <div className="h-48 w-full bg-champagne/20 border border-border p-6 space-y-4">
              <div className="h-3 w-20 bg-gold/30 rounded" />
              <div className="h-8 w-64 bg-champagne/40 rounded" />
              <div className="h-4 w-96 bg-champagne/30 rounded" />
            </div>
            {/* Stats Cards */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="border border-border p-5 h-24 flex flex-col justify-between"
                >
                  <div className="h-3 w-1/2 bg-champagne/40 rounded" />
                  <div className="h-6 w-1/3 bg-champagne/50 rounded" />
                </div>
              ))}
            </div>
            {/* List skeleton */}
            <div className="space-y-4 pt-6">
              <div className="h-5 w-32 bg-champagne/50 rounded" />
              <div className="border border-border p-6 space-y-4">
                <div className="h-4 w-2/3 bg-champagne/40 rounded" />
                <div className="h-4 w-1/2 bg-champagne/30 rounded" />
              </div>
            </div>
          </div>
        );

      case "orders":
        return (
          <div className={cn("animate-pulse space-y-4", className)}>
            {Array.from({ length: count }).map((_, idx) => (
              <div key={idx} className="border border-border p-6 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="h-4 w-36 bg-champagne/50 rounded" />
                    <div className="h-3 w-48 bg-champagne/30 rounded" />
                  </div>
                  <div className="h-6 w-20 bg-champagne/40 rounded" />
                </div>
                <div className="h-1 bg-border rounded-full" />
                <div className="flex gap-4">
                  <div className="h-14 w-10 bg-champagne/40" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-1/3 bg-champagne/40 rounded" />
                    <div className="h-3 w-1/4 bg-champagne/30 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case "wishlist":
        return (
          <div className={cn("animate-pulse space-y-8", className)}>
            <div className="h-16 border-b border-border pb-6">
              <div className="h-3 w-20 bg-champagne/30 rounded mb-2" />
              <div className="h-6 w-48 bg-champagne/50 rounded" />
            </div>
            <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4">
              {Array.from({ length: count * 4 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="aspect-[3/4] w-full bg-champagne/40" />
                  <div className="h-3 w-1/2 bg-champagne/50 rounded" />
                  <div className="h-4 w-3/4 bg-champagne/40 rounded" />
                </div>
              ))}
            </div>
          </div>
        );

      case "cart":
        return (
          <div className={cn("animate-pulse space-y-6", className)}>
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="flex gap-4 py-4 border-b border-border">
                <div className="h-28 w-20 bg-champagne/40 shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-3 w-16 bg-champagne/40 rounded" />
                  <div className="h-5 w-2/3 bg-champagne/50 rounded" />
                  <div className="h-3 w-12 bg-champagne/30 rounded" />
                  <div className="flex justify-between items-center pt-2">
                    <div className="h-8 w-24 bg-champagne/30 rounded" />
                    <div className="h-4 w-12 bg-champagne/40 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
    }
  };

  return <>{renderItems()}</>;
}
