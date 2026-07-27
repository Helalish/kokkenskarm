"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { useAuthStore } from "@/stores/auth-store";
import { useAuthHydration } from "@/hooks/use-auth-hydration";
import { getSessionDestination } from "@/lib/session-destination";

function LoginShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-shopbox-surface px-4 py-10">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(circle at 50% 18%, color-mix(in srgb, var(--shopbox-accent) 16%, transparent), transparent 46%)",
        }}
      />
      {children}
    </main>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const selectedClientId = useAuthStore((s) => s.selectedClientId);
  const selectedBranchId = useAuthStore((s) => s.selectedBranchId);
  const isHydrated = useAuthHydration();

  useEffect(() => {
    if (isHydrated && accessToken) {
      router.replace(
        getSessionDestination({ accessToken, selectedClientId, selectedBranchId })
      );
    }
  }, [isHydrated, accessToken, selectedClientId, selectedBranchId, router]);

  // Wait for localStorage, and keep the form hidden while redirecting an
  // already-authenticated session so it doesn't flash briefly.
  if (!isHydrated || accessToken) {
    return (
      <LoginShell>
        <div className="text-shopbox-text-secondary">Loading...</div>
      </LoginShell>
    );
  }

  return (
    <LoginShell>
      <LoginForm />
    </LoginShell>
  );
}
