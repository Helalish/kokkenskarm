"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuid } from "uuid";
import type { StationConfig } from "@/types/station";

interface StationState {
  stations: StationConfig[];
  activeStationId: string | null;
  addStation: (name: string, categoryFilters: string[], showAllItems: boolean, lockedStageId?: string | null) => void;
  removeStation: (id: string) => void;
  updateStation: (id: string, updates: Partial<Omit<StationConfig, "id">>) => void;
  setActiveStation: (id: string | null) => void;
  getActiveStation: () => StationConfig | null;
}

export const useStationStore = create<StationState>()(
  persist(
    (set, get) => ({
      stations: [],
      activeStationId: null,

      addStation: (name, categoryFilters, showAllItems, lockedStageId = null) => {
        const newStation: StationConfig = {
          id: uuid(),
          name,
          categoryFilters,
          showAllItems,
          lockedStageId,
        };
        set((state) => ({ stations: [...state.stations, newStation] }));
      },

      removeStation: (id) => {
        set((state) => ({
          stations: state.stations.filter((s) => s.id !== id),
          activeStationId: state.activeStationId === id ? null : state.activeStationId,
        }));
      },

      updateStation: (id, updates) => {
        set((state) => ({
          stations: state.stations.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        }));
      },

      setActiveStation: (id) => set({ activeStationId: id }),

      getActiveStation: () => {
        const { stations, activeStationId } = get();
        if (!activeStationId) return null;
        return stations.find((s) => s.id === activeStationId) ?? null;
      },
    }),
    { name: "kds-stations" }
  )
);
