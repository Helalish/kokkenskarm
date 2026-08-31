"use client";

import { useCallback, useEffect, useState } from "react";
import type { Order } from "@/types/order";
import { useOrdersStore } from "@/stores/orders-store";
import { PIPELINE_STAGES, getNextStageId, getPreviousStageId, getStage } from "@/lib/pipeline";
import { useSettingsStore } from "@/stores/settings-store";
import { useT } from "@/hooks/use-t";
import { useOrderTimer } from "@/hooks/use-order-timer";
import { SourceBadge } from "./source-badge";
import { CustomerInfo } from "./customer-info";
import { OrderItemExtras } from "./order-item-extras";
import { cn } from "@/lib/cn";

interface OrderCardExpandedProps {
  order: Order;
  onClose: () => void;
}

export function OrderCardExpanded({ order, onClose }: OrderCardExpandedProps) {
  const updateOrderStatus = useOrdersStore((s) => s.updateOrderStatus);
  const toggleItemDone = useOrdersStore((s) => s.toggleItemDone);
  const markAllItemsDone = useOrdersStore((s) => s.markAllItemsDone);
  const remote = useSettingsStore((s) => s.remote);
  const timerWarningSeconds = remote?.timerWarningSeconds ?? 0;
  const timerCriticalSeconds = remote?.timerCriticalSeconds ?? 0;
  const showItemCheckmarks = remote?.showItemCheckmarks ?? false;
  const t = useT();
  const { formatted, status } = useOrderTimer(
    order.createdAt,
    timerWarningSeconds,
    timerCriticalSeconds
  );

  const currentStage = getStage(order.currentStageId);
  const prevStageId = getPreviousStageId(order.currentStageId);
  const nextStageId = getNextStageId(order.currentStageId);
  const nextStage = nextStageId ? getStage(nextStageId) : null;
  const readyStage = PIPELINE_STAGES[PIPELINE_STAGES.length - 1];
  const readyStageId = readyStage?.id ?? null;
  const activeItems = order.items.filter(
    (i) => i.changeStatus !== "removed" && i.changeStatus !== "refunded"
  );
  const doneCount = activeItems.filter((i) => i.isDone).length;
  const totalCount = activeItems.length;
  const allItemsDone = totalCount > 0 && doneCount === totalCount;
  const [noteReviewed, setNoteReviewed] = useState(false);

  // Close on escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleMoveToStage = useCallback(
    (stageId: string) => {
      updateOrderStatus(order.id, stageId);
    },
    [updateOrderStatus, order.id]
  );

  const handleMoveBack = useCallback(() => {
    if (prevStageId) void updateOrderStatus(order.id, prevStageId);
  }, [prevStageId, updateOrderStatus, order.id]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl border border-sb-border-tertiary bg-shopbox-card overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-shopbox-card-header">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold">#{order.orderNumber}</span>
            <SourceBadge source={order.source} />
            {order.paymentStatus === "unpaid" && (
              <span className="rounded-md bg-shopbox-critical/20 px-2 py-0.5 text-xs font-bold text-shopbox-critical">
                {t("expanded.unpaid")}
              </span>
            )}
            {order.paymentStatus === "paid" && (
              <span className="rounded-md bg-shopbox-accent/20 px-2 py-0.5 text-xs font-bold text-shopbox-accent">
                {t("expanded.paid")}
              </span>
            )}
            {/* Full status label (replaces the color dot used in the grid) */}
            {currentStage && (
              <span
                className="rounded-md px-2 py-0.5 text-xs font-bold text-white"
                style={{ backgroundColor: currentStage.color }}
              >
                {currentStage.name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "font-mono text-lg font-bold tabular-nums",
                status === "normal" && "text-shopbox-text",
                status === "warning" && "text-shopbox-warning",
                status === "critical" && "text-shopbox-critical timer-pulse"
              )}
            >
              {formatted}
            </span>
            <button
              onClick={onClose}
              className="cursor-pointer rounded-lg p-1.5 text-shopbox-muted hover:text-shopbox-text hover:bg-white/10 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Customer info */}
        {order.customerInfo && (
          <div className="px-5 py-2">
            <CustomerInfo
              info={order.customerInfo}
              spaced
              className="text-sm text-white"
            />
          </div>
        )}

        {/* Note / allergy — can be checked off once staff have reviewed it */}
        {order.notes && (
          <button
            onClick={() => setNoteReviewed((v) => !v)}
            className="mx-5 mb-2 flex w-[calc(100%-2.5rem)] items-center gap-3 rounded-lg bg-shopbox-warning/10 border border-shopbox-warning/30 p-3 text-left transition-colors hover:bg-shopbox-warning/15"
          >
            <span
              className={cn(
                "h-5 w-5 shrink-0 rounded border-2 flex items-center justify-center transition-colors",
                noteReviewed ? "border-shopbox-accent bg-shopbox-accent" : "border-shopbox-warning"
              )}
            >
              {noteReviewed && (
                <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </span>
            <span className={cn("text-sm font-medium", noteReviewed ? "text-shopbox-muted line-through" : "text-shopbox-warning")}>
              📝 {order.notes}
            </span>
          </button>
        )}

        {/* Items */}
        <div className="px-5 py-2 max-h-64 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-shopbox-muted">
              {showItemCheckmarks
                ? t("expanded.items", { done: doneCount, total: totalCount })
                : t("card.itemsCount", { total: totalCount })}
            </p>
            {showItemCheckmarks && (
              <button
                onClick={() => markAllItemsDone(order.id)}
                disabled={allItemsDone}
                className="text-xs text-shopbox-accent hover:underline disabled:cursor-not-allowed disabled:text-shopbox-muted disabled:no-underline"
              >
                {t("expanded.markAllDone")}
              </button>
            )}
          </div>
          <div className="space-y-1">
            {order.items.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "flex items-start gap-3 rounded-lg p-2 transition-colors",
                  showItemCheckmarks && "cursor-pointer hover:bg-white/5",
                  showItemCheckmarks && item.isDone && "opacity-40"
                )}
                onClick={
                  showItemCheckmarks
                    ? () => toggleItemDone(order.id, item.id)
                    : undefined
                }
              >
                {showItemCheckmarks && (
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
                )}
                <div className="flex-1">
                  <div className="flex items-start gap-2">
                    {item.quantity > 1 && (
                      <span className="shrink-0 font-bold text-shopbox-accent">{item.quantity}x</span>
                    )}
                    <span
                      className={cn(
                        "min-w-0 font-medium",
                        showItemCheckmarks && item.isDone && "line-through"
                      )}
                    >
                      {item.name}
                    </span>
                  </div>
                  <OrderItemExtras item={item} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions — back · advance/ready */}
        <div className="flex items-center gap-4 border-t border-sb-border-tertiary px-6 py-3.5">
          {prevStageId && (
            <button
              onClick={handleMoveBack}
              className="flex h-13 flex-1 cursor-pointer items-center justify-center rounded-lg border border-shopbox-detail bg-white/10 px-4 text-sm font-semibold leading-snug text-white transition-colors hover:bg-white/15"
            >
              {nextStageId ? t("expanded.moveBack") : t("expanded.goBack")}
            </button>
          )}
          {nextStageId && nextStageId !== readyStageId && (
            <button
              onClick={() => handleMoveToStage(nextStageId)}
              className="flex h-13 flex-1 cursor-pointer items-center justify-center rounded-lg border border-shopbox-warning bg-shopbox-warning/90 px-4 text-sm font-semibold leading-snug text-white transition-colors hover:bg-shopbox-warning"
            >
              {t("expanded.moveTo", { next: nextStage?.name ?? "" })}
            </button>
          )}
          {nextStageId && readyStageId && (
            <button
              onClick={() => handleMoveToStage(readyStageId)}
              className="flex h-13 flex-1 cursor-pointer items-center justify-center rounded-lg border border-[#00AE66] bg-[#00AE66] px-4 text-sm font-semibold leading-snug text-[#F0FDF6] transition-colors hover:bg-[#00AE66]/90"
            >
              {readyStage.name}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
