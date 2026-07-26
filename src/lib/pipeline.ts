import type { PipelineStage } from "@/types/pipeline";

/** Visible KDS stages — IDs match Shopbox API statuses 1:1. */
export const PIPELINE_STAGES: PipelineStage[] = [
  { id: "incoming", name: "Incoming", sortOrder: 0, color: "#6792F4" },
  { id: "in_progress", name: "In Progress", sortOrder: 1, color: "#F79009" },
  { id: "ready", name: "Ready", sortOrder: 2, color: "#00AE66" },
];

export function getStage(id: string): PipelineStage | undefined {
  return PIPELINE_STAGES.find((s) => s.id === id);
}

export function getNextStageId(currentStageId: string): string | null {
  const currentIndex = PIPELINE_STAGES.findIndex((s) => s.id === currentStageId);
  if (currentIndex === -1 || currentIndex >= PIPELINE_STAGES.length - 1) return null;
  return PIPELINE_STAGES[currentIndex + 1].id;
}
