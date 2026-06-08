"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// isFullMode === true → "Full feature" build (everything: stations,
// pre-orders, view-switcher, configurable pipeline, full settings).
// isFullMode === false (default) → "MVP" build (stripped customer-facing
// version with the fixed 3-stage pipeline and minimal settings).
interface ModeState {
  isFullMode: boolean;
  toggleFullMode: () => void;
}

export const useModeStore = create<ModeState>()(
  persist(
    (set) => ({
      isFullMode: false,
      toggleFullMode: () => set((state) => ({ isFullMode: !state.isFullMode })),
    }),
    { name: "kds-mode" }
  )
);
