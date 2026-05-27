"use client";

import { useCallback, useEffect } from "react";
import type { Order } from "@/types/order";
import { useOrdersStore } from "@/stores/orders-store";
import { usePipeline } from "@/hooks/use-pipeline";
import { useSettingsStore } from "@/stores/settings-store";
import { useOrderTimer } from "@/hooks/use-order-timer";
import { SourceBadge } from "./source-badge";
import { cn } from "@/lib/cn";

interface OrderCardExpandedProps {
  order: Order;
  onClose: () => void;
}

export function OrderCardExpanded({ order, onClose }: OrderCardExpandedProps) {
  const { advanceStage, dismissOrder, toggleItemDone, markAllItemsDone } = useOrdersStore();
  const { getNextStageId, stages } = usePipeline();
  const { timerWarningSeconds, timerCriticalSeconds } = useSettingsStore();
  const { formatted, status } = useOrderTimer(
    order.createdAt,
    timerWarningSeconds,
    timerCriticalSeconds
  );

  const currentStage = stages.find((s) => s.id === order.currentStageId);
  const sortedStages = [...stages].sort((a, b) => a.sortOrder - b.sortOrder);
  const doneCount = order.items.filter((i) => i.isDone).length;
  const totalCount = order.items.length;

  // Close on escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleAdvance = useCallback(() => {
    const nextStageId = getNextStageId(order.currentStageId);
    if (nextStageId) {
      advanceStage(order.id, nextStageId);
    } else {
      dismissOrder(order.id);
      onClose();
    }
  }, [order.id, order.currentStageId, getNextStageId, advanceStage, dismissOrder, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className={cn(
          "w-full max-w-lg rounded-2xl border overflow-hidden",
          status === "normal" && "bg-shopbox-card border-shopbox-border",
          status === "warning" && "bg-shopbox-card border-shopbox-warning/50",
          status === "critical" && "bg-shopbox-card border-shopbox-critical/50"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ backgroundColor: currentStage?.color ? `${currentStage.color}22` : undefined }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold">#{order.orderNumber}</span>
            <SourceBadge source={order.source} />
            {order.paymentStatus === "unpaid" && (
              <span className="rounded-md bg-shopbox-critical/20 px-2 py-0.5 text-xs font-bold text-shopbox-critical">
                IKKE BETALT
              </span>
            )}
            {order.paymentStatus === "paid" && (
              <span className="rounded-md bg-shopbox-accent/20 px-2 py-0.5 text-xs font-bold text-shopbox-accent">
                BETALT
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "font-mono text-lg font-bold tabular-nums",
                status === "normal" && "text-shopbox-accent",
                status === "warning" && "text-shopbox-warning",
                status === "critical" && "text-shopbox-critical timer-pulse"
              )}
            >
              {formatted}
            </span>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-shopbox-muted hover:text-shopbox-text hover:bg-shopbox-surface transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Pipeline progress */}
        <div className="flex items-center gap-1 px-5 py-2 overflow-x-auto">
          {sortedStages.map((stage, i) => (
            <div key={stage.id} className="flex items-center gap-1 shrink-0">
              <div
                className={cn(
                  "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider",
                  stage.id === order.currentStageId
                    ? "text-white"
                    : "opacity-40 text-white"
                )}
                style={{ backgroundColor: stage.color }}
              >
                {stage.name}
              </div>
              {i < sortedStages.length - 1 && (
                <span className="text-shopbox-muted text-xs">→</span>
              )}
            </div>
          ))}
        </div>

        {/* Customer info */}
        {order.customerInfo && (
          <div className="mx-5 mb-2 rounded-lg bg-shopbox-surface p-3">
            <p className="text-xs text-shopbox-muted mb-1">Kunde</p>
            <p className="text-sm font-medium">{order.customerInfo.name}</p>
            {order.customerInfo.phone && (
              <p className="text-sm text-shopbox-text-secondary">{order.customerInfo.phone}</p>
            )}
            {order.customerInfo.email && (
              <p className="text-sm text-shopbox-text-secondary">{order.customerInfo.email}</p>
            )}
          </div>
        )}

        {/* Notes */}
        {order.notes && (
          <div className="mx-5 mb-2 rounded-lg bg-shopbox-warning/10 border border-shopbox-warning/30 p-3">
            <p className="text-xs text-shopbox-warning font-semibold mb-0.5">Note</p>
            <p className="text-sm">{order.notes}</p>
          </div>
        )}

        {/* Items */}
        <div className="px-5 py-2 max-h-64 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-shopbox-muted">
              Varer ({doneCount}/{totalCount} færdig)
            </p>
            <button
              onClick={() => markAllItemsDone(order.id)}
              className="text-xs text-shopbox-accent hover:underline"
            >
              Markér alle færdige
            </button>
          </div>
          <div className="space-y-1">
            {order.items.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "flex items-start gap-3 rounded-lg p-2 cursor-pointer transition-colors hover:bg-white/5",
                  item.isDone && "opacity-40"
                )}
                onClick={() => toggleItemDone(order.id, item.id)}
              >
                <div
                  className={cn(
                    "mt-0.5 h-5 w-5 shrink-0 rounded border-2 flex items-center justify-center transition-colors",
                    item.isDone
                      ? "border-shopbox-accent bg-shopbox-accent"
                      : "border-shopbox-muted"
                  )}
                >
                  {item.isDone && (
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {item.quantity > 1 && (
                      <span className="font-bold text-shopbox-accent">{item.quantity}x</span>
                    )}
                    <span className={cn("font-medium", item.isDone && "line-through")}>
                      {item.name}
                    </span>
                    <span className="text-[10px] text-shopbox-muted bg-shopbox-surface rounded px-1.5 py-0.5">
                      {item.category}
                    </span>
                  </div>
                  {item.variants.length > 0 && (
                    <p className="text-xs text-shopbox-text-secondary mt-0.5">
                      Variant: {item.variants.join(", ")}
                    </p>
                  )}
                  {item.modifications.length > 0 && (
                    <p className="text-xs text-shopbox-warning mt-0.5">
                      Mod: {item.modifications.join(", ")}
                    </p>
                  )}
                  {item.ingredients.length > 0 && (
                    <p className="text-xs text-shopbox-text-secondary mt-0.5">
                      Ingredienser: {item.ingredients.join(", ")}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 px-5 py-3 border-t border-shopbox-border/50">
          <button
            onClick={handleAdvance}
            className="flex-1 rounded-lg bg-shopbox-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-shopbox-accent/80 transition-colors"
          >
            {getNextStageId(order.currentStageId)
              ? `Flyt til: ${sortedStages.find((s) => s.id === getNextStageId(order.currentStageId))?.name ?? "Næste"}`
              : "Færdig"}
          </button>
          <button
            onClick={() => {
              dismissOrder(order.id);
              onClose();
            }}
            className="rounded-lg bg-shopbox-surface px-4 py-2.5 text-sm font-medium text-shopbox-text-secondary hover:bg-shopbox-card-hover transition-colors"
          >
            Fjern
          </button>
        </div>
      </div>
    </div>
  );
}
