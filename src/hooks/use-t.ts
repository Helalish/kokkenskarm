"use client";

import { useCallback } from "react";
import { useLanguageStore } from "@/stores/language-store";
import { translations } from "@/lib/translations";

export function useT() {
  const language = useLanguageStore((s) => s.language);

  return useCallback(
    (key: string, params?: Record<string, string | number>) => {
      let s = translations[language][key] ?? translations.en[key] ?? key;
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          s = s.replace(`{${k}}`, String(v));
        }
      }
      return s;
    },
    [language]
  );
}
