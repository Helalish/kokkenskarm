"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuid } from "uuid";
import type { PipelineStage } from "@/types/pipeline";

function recalcTerminal(stages: PipelineStage[]): PipelineStage[] {
  const sorted = [...stages].sort((a, b) => a.sortOrder - b.sortOrder);
  const lastId = sorted.length > 0 ? sorted[sorted.length - 1].id : null;
  return stages.map((s) => ({ ...s, isTerminal: s.id === lastId }));
}

const DEFAULT_STAGES: PipelineStage[] = [
  { id: "stage-1", name: "Modtaget", sortOrder: 0, color: "#6792F4", isTerminal: false },
  { id: "stage-2", name: "I gang", sortOrder: 1, color: "#F79009", isTerminal: false, smsEnabled: true, smsTemplate: "Vi er begyndt på din ordre #{orderNumber}!" },
  { id: "stage-3", name: "Klar", sortOrder: 2, color: "#00AE66", isTerminal: true, smsEnabled: true, smsTemplate: "Din ordre #{orderNumber} er klar til afhentning!" },
];

const STAGE_COLORS: Record<string, string> = {
  "stage-1": "#6792F4",
  "stage-2": "#F79009",
  "stage-3": "#00AE66",
};

interface PipelineState {
  stages: PipelineStage[];
  addStage: (name: string, color: string) => void;
  removeStage: (id: string) => void;
  updateStage: (id: string, updates: Partial<Omit<PipelineStage, "id">>) => void;
  reorderStages: (stages: PipelineStage[]) => void;
  getNextStageId: (currentStageId: string) => string | null;
  getFirstStageId: () => string | null;
}

export const usePipelineStore = create<PipelineState>()(
  persist(
    (set, get) => ({
      stages: DEFAULT_STAGES,

      addStage: (name, color) => {
        const stages = get().stages;
        const newStage: PipelineStage = {
          id: uuid(),
          name,
          sortOrder: stages.length,
          color,
          isTerminal: false,
        };
        set({ stages: recalcTerminal([...stages, newStage]) });
      },

      removeStage: (id) => {
        set((state) => {
          const filtered = state.stages
            .filter((s) => s.id !== id)
            .map((s, i) => ({ ...s, sortOrder: i }));
          return { stages: recalcTerminal(filtered) };
        });
      },

      updateStage: (id, updates) => {
        set((state) => ({
          stages: state.stages.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        }));
      },

      reorderStages: (stages) => {
        const reordered = stages.map((s, i) => ({ ...s, sortOrder: i }));
        set({ stages: recalcTerminal(reordered) });
      },

      getNextStageId: (currentStageId) => {
        const stages = get().stages.sort((a, b) => a.sortOrder - b.sortOrder);
        const currentIndex = stages.findIndex((s) => s.id === currentStageId);
        if (currentIndex === -1 || currentIndex >= stages.length - 1) return null;
        return stages[currentIndex + 1].id;
      },

      getFirstStageId: () => {
        const stages = get().stages.sort((a, b) => a.sortOrder - b.sortOrder);
        return stages.length > 0 ? stages[0].id : null;
      },
    }),
    {
      name: "kds-pipeline",
      version: 5,
      migrate: (persistedState) => {
        const state = persistedState as { stages?: PipelineStage[] } | undefined;
        if (!state?.stages?.length) {
          return { stages: DEFAULT_STAGES };
        }
        return {
          stages: state.stages.map((stage) =>
            STAGE_COLORS[stage.id] ? { ...stage, color: STAGE_COLORS[stage.id] } : stage
          ),
        };
      },
    }
  )
);
