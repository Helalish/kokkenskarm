"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLanguageStore } from "@/stores/language-store";
import { useSettingsStore } from "@/stores/settings-store";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const language = useLanguageStore((s) => s.language);
  const theme = useSettingsStore((s) => s.theme);
  const textScale = useSettingsStore((s) => s.textScale);
  const loadFromShopbox = useSettingsStore((s) => s.loadFromShopbox);
  const hasHydrated = useSettingsStore((s) => s.hasHydrated);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--shopbox-surface", theme.surface);
    root.style.setProperty("--shopbox-primary", theme.primary);
    root.style.setProperty("--shopbox-card", theme.card);
    root.style.setProperty("--shopbox-card-hover", theme.cardHover);
    root.style.setProperty("--shopbox-border", theme.border);
    root.style.setProperty("--shopbox-accent", theme.accent);
    root.style.setProperty("--shopbox-text", theme.text);
    root.style.setProperty("--shopbox-text-secondary", theme.textSecondary);
    root.style.setProperty("--shopbox-muted", theme.muted);
    root.style.setProperty("--background", theme.surface);
    root.style.setProperty("--foreground", theme.text);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${textScale * 100}%`;
    return () => {
      document.documentElement.style.fontSize = "";
    };
  }, [textScale]);

  // After localStorage rehydrate, refresh settings from Shopbox.
  // Cached values are used immediately so KDS can render correctly.
  useEffect(() => {
    if (!hasHydrated || isLoginPage) return;
    void loadFromShopbox();
  }, [hasHydrated, isLoginPage, loadFromShopbox]);

  return <>{children}</>;
}
