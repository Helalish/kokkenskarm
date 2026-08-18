"use client";

import Image from "next/image";
import { LanguageToggle } from "@/components/language-toggle";
import { LogoutButton } from "@/components/logout-button";

export function SetupShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-dvh overflow-x-hidden bg-shopbox-surface px-4 pb-6 pt-14 sm:px-6 sm:pb-8 sm:pt-16">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(circle at 50% 18%, color-mix(in srgb, var(--shopbox-accent) 16%, transparent), transparent 46%)",
        }}
      />

      <div className="fixed right-4 top-4 z-20 flex items-center gap-2 sm:right-6 sm:top-6">
        <LanguageToggle />
        <LogoutButton />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col">
        <div className="mb-4 shrink-0 text-center sm:mb-5">
          <Image
            src="/shopbox-logo.svg"
            alt="Shopbox"
            width={234}
            height={40}
            priority
            className="mx-auto h-8 w-auto sm:h-9"
          />
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-shopbox-text sm:mt-4 sm:text-4xl">
            {title}
          </h1>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-shopbox-text-secondary">
            {subtitle}
          </p>
        </div>

        <section className="flex min-h-88 flex-col overflow-hidden rounded-3xl border border-shopbox-border bg-shopbox-card/95 p-4 shadow-2xl shadow-black/40 backdrop-blur-sm sm:min-h-112 max-h-[calc(100dvh-16rem)] sm:p-6">
          {children}
        </section>
      </div>
    </main>
  );
}
