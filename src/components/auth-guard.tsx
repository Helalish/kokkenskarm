"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useAuthHydration } from "@/hooks/use-auth-hydration";

function FullScreenLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-shopbox-surface">
      <div className="text-shopbox-text-secondary">Loading...</div>
    </div>
  );
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const isHydrated = useAuthHydration();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (!isHydrated || accessToken || hasRedirected.current) return;
    hasRedirected.current = true;
    window.location.replace("/login");
  }, [isHydrated, accessToken]);

  if (!isHydrated || !accessToken) return <FullScreenLoading />;

  return <>{children}</>;
}
