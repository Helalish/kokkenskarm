"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useAuthHydration } from "@/hooks/use-auth-hydration";

export default function Home() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const isHydrated = useAuthHydration();

  useEffect(() => {
    if (isHydrated) {
      router.replace(accessToken ? "/kds" : "/login");
    }
  }, [isHydrated, accessToken, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-shopbox-surface">
      <div className="text-shopbox-text-secondary">Loading...</div>
    </div>
  );
}
