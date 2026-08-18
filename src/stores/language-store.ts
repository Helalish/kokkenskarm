"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Language = "da" | "en";

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: "en",
      setLanguage: (language) => set({ language }),
    }),
    { name: "kds-language" }
  )
);
