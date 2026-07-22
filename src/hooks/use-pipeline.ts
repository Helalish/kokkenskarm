"use client";

import { useMemo } from "react";
import { usePipelineStore } from "@/stores/pipeline-store";

export function usePipeline() {
  const stages = usePipelineStore((s) => s.stages);

  return useMemo(() => {
    const sorted = [...stages].sort((a, b) => a.sortOrder - b.sortOrder);
    return {
      stages,
      getNextStageId: (id: string) => {
        const i = sorted.findIndex((s) => s.id === id);
        if (i === -1 || i >= sorted.length - 1) return null;
        return sorted[i + 1].id;
      },
    };
  }, [stages]);
}
