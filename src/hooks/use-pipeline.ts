"use client";

import { useMemo } from "react";
import { useMvpStore } from "@/stores/mvp-store";
import { usePipelineStore } from "@/stores/pipeline-store";
import {
  getEffectiveStages,
  getNextStageId,
  getFirstStageId,
} from "@/lib/demo-pipeline";

// Facade over pipeline-store: returns the fixed DEMO stages in DEMO mode and
// the user-configurable store stages in MVP mode. Drop-in for the
// `usePipelineStore()` destructure in stage-consuming components.
export function usePipeline() {
  const isMvpMode = useMvpStore((s) => s.isMvpMode);
  const storeStages = usePipelineStore((s) => s.stages);
  const stages = getEffectiveStages(isMvpMode, storeStages);

  return useMemo(
    () => ({
      stages,
      getNextStageId: (id: string) => getNextStageId(stages, id),
      getFirstStageId: () => getFirstStageId(stages),
    }),
    [stages]
  );
}
