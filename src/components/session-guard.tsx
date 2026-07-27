"use client";

import { useEffect, useRef } from "react";
import { useAuthHydration } from "@/hooks/use-auth-hydration";
import { useAuthStore } from "@/stores/auth-store";

function FullScreenLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-shopbox-surface">
      <div
        aria-label="Loading"
        className="size-8 animate-spin rounded-full border-2 border-shopbox-accent border-t-transparent"
      />
    </div>
  );
}

export function SessionGuard({
  children,
  requireClient = true,
  requireBranch = true,
}: {
  children: React.ReactNode;
  requireClient?: boolean;
  requireBranch?: boolean;
}) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const selectedClientId = useAuthStore((state) => state.selectedClientId);
  const selectedBranchId = useAuthStore((state) => state.selectedBranchId);
  const isHydrated = useAuthHydration();
  const redirectTarget =
    !accessToken
      ? "/login"
      : requireClient && !selectedClientId
        ? "/select-client"
        : requireBranch && !selectedBranchId
          ? "/select-branch"
          : null;
  const lastRedirectRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isHydrated || !redirectTarget || lastRedirectRef.current === redirectTarget) return;
    lastRedirectRef.current = redirectTarget;
    window.location.replace(redirectTarget);
  }, [isHydrated, redirectTarget]);

  if (!isHydrated || redirectTarget) return <FullScreenLoading />;

  return <>{children}</>;
}
