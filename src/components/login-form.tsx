"use client";

import Image from "next/image";
import { useState, type SubmitEvent } from "react";
import { LanguageToggle } from "@/components/language-toggle";
import { useT } from "@/hooks/use-t";
import { useAuthStore } from "@/stores/auth-store";
import { authenticateCredentials } from "@/lib/shopbox-api";

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="size-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 3l18 18" />
        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
        <path d="M9.9 5.1A10.5 10.5 0 0 1 12 5c5 0 9.3 3.1 10.5 7.5a10.8 10.8 0 0 1-1.7 3.2" />
        <path d="M6.1 6.1A10.8 10.8 0 0 0 1.5 12.5C2.7 16.9 7 20 12 20a10.5 10.5 0 0 0 4.2-.9" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function LoginForm() {
  const t = useT();
  const login = useAuthStore((s) => s.login);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const username = formData.get("email") as string;
    const password = formData.get("password") as string;
    const rememberMe = formData.get("remember_me") === "on";

    try {
      const response = await authenticateCredentials(username, password, rememberMe);

      // The login page sends the user to the next incomplete setup step.
      login(response.accessToken, {
        uid: response.account.uid,
        username: response.account.username,
        firstName: response.account.first_name,
        lastName: response.account.last_name,
        lang: response.account.lang,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("login.error.generic"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className="fixed right-4 top-4 z-20 sm:right-6 sm:top-6">
        <LanguageToggle />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <Image
            src="/shopbox-logo.svg"
            alt="Shopbox"
            width={234}
            height={40}
            priority
            className="mx-auto h-10 w-auto"
          />
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-shopbox-text sm:text-4xl">
            {t("login.title")}
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-shopbox-text-secondary">
            {t("login.subtitle")}
          </p>
        </div>

        <div className="rounded-3xl border border-shopbox-border bg-shopbox-card/95 p-6 shadow-2xl shadow-black/40 backdrop-blur-sm sm:p-8">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-shopbox-text" htmlFor="email">
                {t("login.email")}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                required
                autoFocus
                className="login-input w-full rounded-xl border border-shopbox-border bg-shopbox-surface px-4 py-3 text-shopbox-text outline-none transition focus:border-shopbox-accent focus:ring-2 focus:ring-shopbox-accent/20"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-shopbox-text" htmlFor="password">
                {t("login.password")}
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="login-input w-full rounded-xl border border-shopbox-border bg-shopbox-surface px-4 py-3 pr-12 text-shopbox-text outline-none transition focus:border-shopbox-accent focus:ring-2 focus:ring-shopbox-accent/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute inset-y-0 right-0 flex cursor-pointer items-center px-3 text-shopbox-text-secondary transition-colors hover:text-shopbox-text"
                  aria-label={showPassword ? t("login.hidePassword") : t("login.showPassword")}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-3 text-sm text-shopbox-text-secondary">
              <input
                type="checkbox"
                name="remember_me"
                className="size-4 cursor-pointer rounded border-shopbox-border bg-shopbox-surface accent-shopbox-accent"
              />
              <span>{t("login.rememberMe")}</span>
            </label>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-shopbox-critical/40 bg-shopbox-critical/10 px-4 py-3 text-sm text-shopbox-critical"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full cursor-pointer rounded-xl bg-shopbox-accent px-4 py-3.5 font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? t("login.submitting") : t("login.submit")}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
