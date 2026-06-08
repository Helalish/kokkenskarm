"use client";

import { useCallback } from "react";
import { useModeStore } from "@/stores/mode-store";
import { useLanguageStore } from "@/stores/language-store";
import { translations } from "@/lib/translations";

// useT returns a t(key, params?) function. MVP mode is Danish-only — the full
// version is the Danish base for development. DEMO mode follows the language
// toggle (defaults to Danish, switchable to English for non-Danish readers).
export function useT() {
  const isFullMode = useModeStore((s) => s.isFullMode);
  const language = useLanguageStore((s) => s.language);
  const effective = isFullMode ? "da" : language;

  return useCallback(
    (key: string, params?: Record<string, string | number>) => {
      let s = translations[effective][key] ?? translations.da[key] ?? key;
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          s = s.replace(`{${k}}`, String(v));
        }
      }
      return s;
    },
    [effective]
  );
}
