import type { PipelineStage } from "@/types/pipeline";

// Fixed, non-configurable pipeline used in DEMO mode (the stripped version).
// Same stage IDs as the default MVP pipeline so order.currentStageId works
// across a mode toggle.
export const DEMO_STAGES: PipelineStage[] = [
  { id: "stage-1", name: "Incoming", sortOrder: 0, color: "#3B82F6", isTerminal: false },
  { id: "stage-2", name: "In Progress", sortOrder: 1, color: "#F59E0B", isTerminal: false },
  {
    id: "stage-3",
    name: "Ready for Pick up",
    sortOrder: 2,
    color: "#10B981",
    isTerminal: true,
    smsEnabled: true,
    smsTemplate: "Din ordre #{orderNumber} er klar til afhentning!",
  },
];

export function getEffectiveStages(
  isMvpMode: boolean,
  storeStages: PipelineStage[]
): PipelineStage[] {
  return isMvpMode ? storeStages : DEMO_STAGES;
}

export function getNextStageId(
  stages: PipelineStage[],
  currentStageId: string
): string | null {
  const sorted = [...stages].sort((a, b) => a.sortOrder - b.sortOrder);
  const i = sorted.findIndex((s) => s.id === currentStageId);
  if (i === -1 || i >= sorted.length - 1) return null;
  return sorted[i + 1].id;
}

export function getFirstStageId(stages: PipelineStage[]): string | null {
  const sorted = [...stages].sort((a, b) => a.sortOrder - b.sortOrder);
  return sorted.length > 0 ? sorted[0].id : null;
}
