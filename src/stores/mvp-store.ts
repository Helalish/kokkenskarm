"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface MvpState {
  isMvpMode: boolean;
  toggleMvpMode: () => void;
}

export const useMvpStore = create<MvpState>()(
  persist(
    (set) => ({
      isMvpMode: false,
      toggleMvpMode: () => set((state) => ({ isMvpMode: !state.isMvpMode })),
    }),
    { name: "kds-mvp-mode" }
  )
);
