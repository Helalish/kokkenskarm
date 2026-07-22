"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PipelineStage } from "@/types/pipeline";

// Stage IDs match the Shopbox KDS API statuses 1:1 (incoming, in_progress,
// ready) so no id <-> status translation layer is needed elsewhere.
const DEFAULT_STAGES: PipelineStage[] = [
  { id: "incoming", name: "Incoming", sortOrder: 0, color: "#6792F4", isTerminal: false },
  { id: "in_progress", name: "In Progress", sortOrder: 1, color: "#F79009", isTerminal: false, smsEnabled: true, smsTemplate: "We've started preparing your order #{orderNumber}!" },
  { id: "ready", name: "Ready", sortOrder: 2, color: "#00AE66", isTerminal: true, smsEnabled: true, smsTemplate: "Your order #{orderNumber} is ready for pickup!" },
];

interface PipelineState {
  stages: PipelineStage[];
  getNextStageId: (currentStageId: string) => string | null;
}

export const usePipelineStore = create<PipelineState>()(
  persist(
    (set, get) => ({
      stages: DEFAULT_STAGES,

      getNextStageId: (currentStageId) => {
        const stages = [...get().stages].sort((a, b) => a.sortOrder - b.sortOrder);
        const currentIndex = stages.findIndex((s) => s.id === currentStageId);
        if (currentIndex === -1 || currentIndex >= stages.length - 1) return null;
        return stages[currentIndex + 1].id;
      },
    }),
    {
      name: "kds-pipeline",
      version: 6,
      migrate: () => ({ stages: DEFAULT_STAGES }),
    }
  )
);
