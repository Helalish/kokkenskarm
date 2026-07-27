"use client";

import { PIPELINE_STAGES } from "@/lib/pipeline";
import { useOrdersStore } from "@/stores/orders-store";
import { useT } from "@/hooks/use-t";
import { cn } from "@/lib/cn";

interface PipelineBarProps {
  activeStageId: string | null;
  onStageSelect: (stageId: string | null) => void;
}

export function PipelineBar({ activeStageId, onStageSelect }: PipelineBarProps) {
  const { orders } = useOrdersStore();
  const t = useT();

  const totalOrders = orders.length;

  return (
    <div className="flex flex-wrap items-center gap-2 px-4 py-2 bg-shopbox-primary border-b border-shopbox-border overflow-x-auto">
      <button
        className={cn(
          "shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
          activeStageId === null
            ? "bg-white/10 text-white"
            : "text-shopbox-text-secondary hover:bg-shopbox-card"
        )}
        onClick={() => onStageSelect(null)}
      >
        {t("pipelineBar.all")} ({totalOrders})
      </button>

      {PIPELINE_STAGES.map((stage) => {
        const count = orders.filter((o) => o.currentStageId === stage.id).length;
        return (
          <button
            key={stage.id}
            className={cn(
              "shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              activeStageId === stage.id
                ? "text-white"
                : "text-shopbox-text-secondary hover:bg-shopbox-card"
            )}
            style={
              activeStageId === stage.id
                ? { backgroundColor: stage.color }
                : undefined
            }
            onClick={() => onStageSelect(stage.id)}
          >
            {stage.name} ({count})
          </button>
        );
      })}
    </div>
  );
}
