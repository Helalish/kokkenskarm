"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useAuthHydration } from "@/hooks/use-auth-hydration";
import { getSessionDestination } from "@/lib/session-destination";

export default function Home() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const selectedClientId = useAuthStore((s) => s.selectedClientId);
  const selectedBranchId = useAuthStore((s) => s.selectedBranchId);
  const isHydrated = useAuthHydration();

  useEffect(() => {
    if (isHydrated) {
      router.replace(
        getSessionDestination({ accessToken, selectedClientId, selectedBranchId })
      );
    }
  }, [isHydrated, accessToken, selectedClientId, selectedBranchId, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-shopbox-surface">
      <div className="text-shopbox-text-secondary">Loading...</div>
    </div>
  );
}
