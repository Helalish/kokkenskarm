"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/stores/settings-store";
import { useMvpStore } from "@/stores/mvp-store";

/**
 * Syncs Zustand theme colors + text scale to CSS custom properties on :root.
 * This makes all Tailwind classes using var(--shopbox-*) update in realtime.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, textScale } = useSettingsStore();
  const isMvpMode = useMvpStore((s) => s.isMvpMode);
  // DEMO mode is locked to 100% text size.
  const effectiveTextScale = isMvpMode ? textScale : 1;

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
    document.documentElement.style.fontSize = `${effectiveTextScale * 100}%`;
    return () => {
      document.documentElement.style.fontSize = "";
    };
  }, [effectiveTextScale]);

  return <>{children}</>;
}
