"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { initAuthListener } from "@/lib/auth-store";
import { Toaster } from "sonner";
import { OfflineDetector } from "@/components/offline-detector";
import MaintenancePage from "./maintenance/page";

const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  const pathname = usePathname();

  useEffect(() => {
    initAuthListener();
  }, []);

  const isAdminPath = pathname?.startsWith("/admin");
  const isMaintenancePage = pathname === "/maintenance";

  // Check if global maintenance mode is enabled, except for admin routes
  if (isMaintenanceMode && !isAdminPath && !isMaintenancePage) {
    return (
      <QueryClientProvider client={queryClient}>
        <MaintenancePage />
        <Toaster position="top-right" richColors />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <OfflineDetector>{children}</OfflineDetector>
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}
