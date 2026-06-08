"use client";

import { useCallback, useEffect, useState } from "react";
import type { Order } from "@/types/order";
import { useOrdersStore } from "@/stores/orders-store";
import { usePipeline } from "@/hooks/use-pipeline";
import { useSettingsStore } from "@/stores/settings-store";
import { useT } from "@/hooks/use-t";
import { useOrderTimer } from "@/hooks/use-order-timer";
import { sendOrderSms } from "@/services/sms-service";
import { SourceBadge } from "./source-badge";
import { cn } from "@/lib/cn";

interface OrderCardExpandedProps {
  order: Order;
  onClose: () => void;
}

export function OrderCardExpanded({ order, onClose }: OrderCardExpandedProps) {
  const { advanceStage, dismissOrder, toggleItemDone, toggleAllItemsDone } = useOrdersStore();
  const { getNextStageId, stages } = usePipeline();
  const { timerWarningSeconds, timerCriticalSeconds, smsEnabled } = useSettingsStore();
  const t = useT();
  const { formatted, status } = useOrderTimer(
    order.createdAt,
    timerWarningSeconds,
    timerCriticalSeconds
  );

  const currentStage = stages.find((s) => s.id === order.currentStageId);
  const sortedStages = [...stages].sort((a, b) => a.sortOrder - b.sortOrder);
  const currentIndex = sortedStages.findIndex((s) => s.id === order.currentStageId);
  const prevStageId = currentIndex > 0 ? sortedStages[currentIndex - 1].id : null;
  const nextStageId = getNextStageId(order.currentStageId);
  const nextStage = nextStageId ? stages.find((s) => s.id === nextStageId) : null;
  const terminalStageId = sortedStages.length > 0 ? sortedStages[sortedStages.length - 1].id : null;
  const doneCount = order.items.filter((i) => i.isDone).length;
  const totalCount = order.items.length;
  const [noteReviewed, setNoteReviewed] = useState(false);

  // Close on escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const sendStageSms = useCallback(
    (stageId: string) => {
      const stage = stages.find((s) => s.id === stageId);
      if (smsEnabled && stage?.smsEnabled && stage.smsTemplate && order.customerInfo?.phone) {
        const message = stage.smsTemplate.replace("#{orderNumber}", String(order.orderNumber));
        sendOrderSms(order.customerInfo.phone, order.orderNumber, order.id, message);
      }
    },
    [stages, smsEnabled, order.customerInfo, order.orderNumber, order.id]
  );

  const handleMoveToStage = useCallback(
    (stageId: string) => {
      sendStageSms(stageId);
      advanceStage(order.id, stageId);
    },
    [sendStageSms, advanceStage, order.id]
  );

  const handleMoveBack = useCallback(() => {
    if (prevStageId) advanceStage(order.id, prevStageId);
  }, [prevStageId, advanceStage, order.id]);

  const handleRemove = useCallback(() => {
    dismissOrder(order.id);
    onClose();
  }, [dismissOrder, order.id, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl border bg-shopbox-card border-shopbox-border overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3">
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
              className="rounded-lg p-1.5 text-shopbox-muted hover:text-shopbox-text hover:bg-shopbox-surface transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Customer info */}
        {order.customerInfo && (
          <div className="mx-5 mb-2 rounded-lg bg-shopbox-surface p-3">
            <p className="text-xs text-shopbox-muted mb-1">{t("expanded.customer")}</p>
            <p className="text-sm font-medium">{order.customerInfo.name}</p>
            {order.customerInfo.phone && (
              <p className="text-sm text-shopbox-text-secondary">{order.customerInfo.phone}</p>
            )}
            {order.customerInfo.email && (
              <p className="text-sm text-shopbox-text-secondary">{order.customerInfo.email}</p>
            )}
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
              {t("expanded.items", { done: doneCount, total: totalCount })}
            </p>
            <button
              onClick={() => toggleAllItemsDone(order.id)}
              className="text-xs text-shopbox-accent hover:underline"
            >
              {totalCount > 0 && doneCount === totalCount
                ? t("expanded.unmarkAll")
                : t("expanded.markAllDone")}
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
                      {t("expanded.variant")}: {item.variants.join(", ")}
                    </p>
                  )}
                  {item.modifications.length > 0 && (
                    <p className="text-xs text-shopbox-warning mt-0.5">
                      {t("expanded.mod")}: {item.modifications.join(", ")}
                    </p>
                  )}
                  {item.ingredients.length > 0 && (
                    <p className="text-xs text-shopbox-text-secondary mt-0.5">
                      {t("expanded.ingredients")}: {item.ingredients.join(", ")}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions — context-dependent: remove · back · advance/ready */}
        <div className="flex items-center gap-2 px-5 py-3 border-t border-shopbox-border/50">
          <button
            onClick={handleRemove}
            className="rounded-lg bg-shopbox-surface px-4 py-2.5 text-sm font-medium text-shopbox-critical hover:bg-shopbox-card-hover transition-colors"
          >
            ✕ {t("expanded.remove")}
          </button>
          <div className="flex items-center gap-2 ml-auto">
            {prevStageId && (
              <button
                onClick={handleMoveBack}
                className="rounded-lg bg-shopbox-surface px-4 py-2.5 text-sm font-medium text-shopbox-text-secondary hover:bg-shopbox-card-hover transition-colors"
              >
                {nextStageId ? t("expanded.moveBack") : t("expanded.goBack")}
              </button>
            )}
            {nextStageId && nextStageId !== terminalStageId && (
              <button
                onClick={() => handleMoveToStage(nextStageId)}
                className="rounded-lg bg-shopbox-surface px-4 py-2.5 text-sm font-medium text-shopbox-text hover:bg-shopbox-card-hover transition-colors"
              >
                {t("expanded.moveTo", { next: nextStage?.name ?? "" })}
              </button>
            )}
            {nextStageId && terminalStageId && (
              <button
                onClick={() => handleMoveToStage(terminalStageId)}
                className="rounded-lg bg-shopbox-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-shopbox-accent/80 transition-colors"
              >
                {sortedStages[sortedStages.length - 1]?.name}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
