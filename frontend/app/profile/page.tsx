"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** /profile — redirects to /account/profile */
export default function ProfileRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/account/profile");
  }, [router]);
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
    </div>
  );
}
