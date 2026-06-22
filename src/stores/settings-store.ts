"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DisplaySettings, ThemeColors } from "@/types/settings";
import {
  DEFAULT_GRID_COLUMNS,
  DEFAULT_TEXT_SCALE,
  DEFAULT_TIMER_WARNING_SECONDS,
  DEFAULT_TIMER_CRITICAL_SECONDS,
} from "@/lib/constants";

export const DEFAULT_THEME: ThemeColors = {
  surface: "#000000",
  primary: "#111111",
  card: "#1A1A1A",
  cardHover: "#252525",
  border: "#333333",
  accent: "#00AE66",
  text: "#FFFFFF",
  textSecondary: "#B0B0B0",
  muted: "#707070",
};

interface SettingsState extends DisplaySettings {
  updateSettings: (updates: Partial<DisplaySettings>) => void;
  updateTheme: (updates: Partial<ThemeColors>) => void;
  resetTheme: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      gridColumns: DEFAULT_GRID_COLUMNS,
      textScale: DEFAULT_TEXT_SCALE,
      timerWarningSeconds: DEFAULT_TIMER_WARNING_SECONDS,
      timerCriticalSeconds: DEFAULT_TIMER_CRITICAL_SECONDS,
      warningColor: "#F59E0B",
      criticalColor: "#EF4444",
      sortOrder: "oldest",
      soundEnabled: true,
      theme: { ...DEFAULT_THEME },
      viewMode: "grid",
      showItemCheckmarks: true,
      autoAdvanceWhenAllDone: false,
      scrollableCards: false,
      autoDismissReadySeconds: 0,
      smsEnabled: true,

      updateSettings: (updates) => set((state) => ({ ...state, ...updates })),

      updateTheme: (updates) =>
        set((state) => ({
          theme: { ...state.theme, ...updates },
        })),

      resetTheme: () => set({ theme: { ...DEFAULT_THEME } }),
    }),
    { name: "kds-settings" }
  )
);
