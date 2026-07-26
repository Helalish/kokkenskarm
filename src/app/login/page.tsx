"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { useAuthStore } from "@/stores/auth-store";
import { useAuthHydration } from "@/hooks/use-auth-hydration";

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
  const isHydrated = useAuthHydration();

  useEffect(() => {
    if (isHydrated && accessToken) {
      router.replace("/kds");
    }
  }, [isHydrated, accessToken, router]);

  // Wait for localStorage before deciding — otherwise a logged-in session
  // briefly looks logged-out and the form flashes.
  if (!isHydrated) {
    return (
      <LoginShell>
        <div className="text-shopbox-text-secondary">Loading...</div>
      </LoginShell>
    );
  }

  if (accessToken) {
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
