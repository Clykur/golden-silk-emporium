"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** /settings — redirects to /account/security (profile & security settings) */
export default function SettingsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/account/security");
  }, [router]);
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
    </div>
  );
}
