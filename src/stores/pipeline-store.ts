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

// Stage IDs match the Shopbox KDS API statuses 1:1 (incoming, in_progress,
// ready) so no id <-> status translation layer is needed elsewhere.
const DEFAULT_STAGES: PipelineStage[] = [
  { id: "incoming", name: "Incoming", sortOrder: 0, color: "#6792F4", isTerminal: false },
  { id: "in_progress", name: "In Progress", sortOrder: 1, color: "#F79009", isTerminal: false, smsEnabled: true, smsTemplate: "We've started preparing your order #{orderNumber}!" },
  { id: "ready", name: "Ready", sortOrder: 2, color: "#00AE66", isTerminal: true, smsEnabled: true, smsTemplate: "Your order #{orderNumber} is ready for pickup!" },
];

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
      version: 6,
      migrate: () => ({ stages: DEFAULT_STAGES }),
    }
  )
);
