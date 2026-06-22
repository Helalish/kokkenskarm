"use client";

import { useCallback, useEffect, useRef } from "react";
import type { Order } from "@/types/order";
import type { StationConfig } from "@/types/station";
import { useOrdersStore } from "@/stores/orders-store";
import { usePipeline } from "@/hooks/use-pipeline";
import { useSettingsStore } from "@/stores/settings-store";
import { useOrderTimer } from "@/hooks/use-order-timer";
import { getStationItems } from "@/lib/category-filter";
import { OrderItemRow } from "./order-item-row";
import { SourceBadge } from "./source-badge";
import { PaymentBadge } from "./payment-badge";
import { CustomerInfo } from "./customer-info";
import { sendOrderSms } from "@/services/sms-service";
import { useModeStore } from "@/stores/mode-store";
import { useT } from "@/hooks/use-t";
import { cn } from "@/lib/cn";

interface OrderCardProps {
  order: Order;
  activeStation?: StationConfig | null;
  isSelected?: boolean;
  onSelect?: () => void;
  onExpand?: () => void;
  isNew?: boolean;
  viewMode?: "grid" | "kanban";
  onKanbanClick?: () => void;
  onKanbanBack?: () => void;
}

export function OrderCard({
  order,
  activeStation,
  isSelected,
  onSelect,
  onExpand,
  isNew,
  viewMode = "grid",
  onKanbanClick,
  onKanbanBack,
}: OrderCardProps) {
  const { advanceStage, dismissOrder, toggleItemDone, acknowledgeChanges } = useOrdersStore();
  const { getNextStageId, stages } = usePipeline();
  const { isFullMode } = useModeStore();
  const t = useT();
  const {
    timerWarningSeconds,
    timerCriticalSeconds,
    showItemCheckmarks,
    autoAdvanceWhenAllDone,
    scrollableCards,
    smsEnabled,
  } = useSettingsStore();
  const { formatted, status } = useOrderTimer(
    order.createdAt,
    timerWarningSeconds,
    timerCriticalSeconds
  );

  // DEMO mode never scrolls inside order cards.
  const effectiveScrollableCards = isFullMode ? scrollableCards : false;

  const sortedStages = [...stages].sort((a, b) => a.sortOrder - b.sortOrder);
  const currentStage = stages.find((s) => s.id === order.currentStageId);
  const currentIndex = sortedStages.findIndex((s) => s.id === order.currentStageId);
  const nextStageId = getNextStageId(order.currentStageId);
  const nextStage = nextStageId ? stages.find((s) => s.id === nextStageId) : null;
  const prevStageId = currentIndex > 0 ? sortedStages[currentIndex - 1].id : null;

  const activeItems = order.items.filter((i) => i.changeStatus !== "removed" && i.changeStatus !== "refunded");
  const doneCount = activeItems.filter((i) => i.isDone).length;
  const totalCount = activeItems.length;
  const allDone = totalCount > 0 && doneCount === totalCount;

  const triggerAutoSms = useCallback(() => {
    if (smsEnabled && nextStage?.smsEnabled && nextStage.smsTemplate && order.customerInfo?.phone) {
      const message = nextStage.smsTemplate.replace("#{orderNumber}", String(order.orderNumber));
      sendOrderSms(order.customerInfo.phone, order.orderNumber, order.id, message);
    }
  }, [smsEnabled, nextStage, order.customerInfo, order.orderNumber, order.id]);

  // Auto-advance when all items are done (stops at terminal stage — don't dismiss)
  const prevAllDoneRef = useRef(false);
  useEffect(() => {
    if (autoAdvanceWhenAllDone && showItemCheckmarks && allDone && !prevAllDoneRef.current) {
      if (nextStageId) {
        triggerAutoSms();
        advanceStage(order.id, nextStageId);
      }
      // No dismiss here — orders in terminal stage stay until auto-dismiss timer or manual action
    }
    prevAllDoneRef.current = allDone;
  }, [allDone, autoAdvanceWhenAllDone, showItemCheckmarks, nextStageId, order.id, advanceStage, triggerAutoSms]);

  const handleClick = useCallback(() => {
    if (viewMode === "kanban") {
      onKanbanClick?.();
      return;
    }
    if (isSelected) {
      if (nextStageId) {
        triggerAutoSms();
        advanceStage(order.id, nextStageId);
      } else {
        dismissOrder(order.id);
      }
    } else {
      onSelect?.();
    }
  }, [viewMode, isSelected, nextStageId, order.id, advanceStage, dismissOrder, onSelect, onKanbanClick, triggerAutoSms]);

  return (
    <div
      className={cn(
        // Card fill, border and typography stay constant — they do NOT change
        // based on order status, duration or any other order attribute.
        "no-select order-card-enter relative flex flex-col rounded-3xl border bg-shopbox-card border-shopbox-border transition-all",
        order.isRefunded ? "cursor-default" : "cursor-pointer",
        isSelected && !order.isRefunded && "ring-2 ring-shopbox-accent border-shopbox-accent",
        isNew && "order-new-glow"
      )}
      onClick={order.isRefunded ? undefined : handleClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 rounded-t-3xl">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold">#{order.orderNumber}</span>
          <SourceBadge source={order.source} />
          <PaymentBadge status={order.paymentStatus} />
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "font-mono text-sm font-semibold tabular-nums",
              status === "normal" && "text-shopbox-text",
              status === "warning" && "text-shopbox-warning",
              status === "critical" && "text-shopbox-critical timer-pulse"
            )}
          >
            {formatted}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onExpand?.();
            }}
            className="rounded-lg p-1 text-shopbox-muted hover:text-shopbox-text hover:bg-white/10 transition-colors"
            title={t("card.showDetails")}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Changes banner — can be checked off / dismissed once reviewed */}
      {order.hasChanges && !order.isRefunded && (
        <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-shopbox-warning/15">
          <span className="text-xs font-bold uppercase tracking-wider text-shopbox-detail">
            {t("card.changes")}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              acknowledgeChanges(order.id);
            }}
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-shopbox-muted text-transparent hover:border-shopbox-text hover:text-shopbox-text transition-colors"
            title="Markér ændringer som set"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </div>
      )}

      {/* Selected action hint (grid only) */}
      {viewMode !== "kanban" && isSelected && !order.isRefunded && (
        <div className="px-3 py-1.5 bg-shopbox-accent/10 text-xs text-shopbox-accent font-medium text-center">
          {t("card.clickAgain", { next: nextStage ? nextStage.name : t("card.done") })}
        </div>
      )}

      {/* Status dot (grid only) + customer info */}
      <div className="px-3 py-1 flex items-center gap-2">
        {viewMode !== "kanban" && currentStage && (
          <span
            className="h-2.5 w-2.5 rounded-full shrink-0"
            style={{ backgroundColor: currentStage.color }}
          />
        )}
        {order.customerInfo && (
          <div className="min-w-0 flex-1">
            <CustomerInfo info={order.customerInfo} />
          </div>
        )}
      </div>

      {/* Items - only show if showItemCheckmarks is enabled */}
      {showItemCheckmarks ? (
        <div className={cn("flex-1 px-3 py-1 space-y-0.5 text-sm", effectiveScrollableCards && "overflow-y-auto max-h-48")}>
          {getStationItems(order, activeStation ?? null).map(({ item, dimmed }) => (
            <OrderItemRow
              key={item.id}
              item={item}
              dimmed={dimmed}
              onToggleDone={() => toggleItemDone(order.id, item.id)}
            />
          ))}
        </div>
      ) : (
        <div className={cn("flex-1 px-3 py-1 space-y-0.5 text-sm", effectiveScrollableCards && "overflow-y-auto max-h-48")}>
          {getStationItems(order, activeStation ?? null).map(({ item, dimmed }) => {
            const isRemoved = item.changeStatus === "removed" || item.changeStatus === "refunded";
            const isAdded = item.changeStatus === "added";
            return (
              <div
                key={item.id}
                className={cn(
                  "py-0.5 px-1",
                  dimmed && "opacity-20"
                )}
              >
                <div className="flex items-center gap-1.5">
                  {item.quantity > 1 && (
                    <span className={cn(
                      "font-bold",
                      isRemoved ? "text-red-500" : isAdded ? "text-shopbox-accent" : "text-shopbox-accent"
                    )}>
                      {item.quantity}x
                    </span>
                  )}
                  <span className={cn(
                    "font-medium",
                    isRemoved && "line-through text-red-500 font-bold",
                    isAdded && "text-shopbox-accent"
                  )}>
                    {item.name}
                  </span>
                  {isAdded && (
                    <span className="rounded bg-shopbox-accent/20 px-1 py-0.5 text-[9px] font-bold text-shopbox-accent uppercase tracking-wider">
                      {t("card.new")}
                    </span>
                  )}
                  {item.changeStatus === "refunded" && (
                    <span className="rounded bg-red-500/20 px-1 py-0.5 text-[9px] font-bold text-red-500 uppercase tracking-wider">
                      {t("card.refunded")}
                    </span>
                  )}
                </div>
                {item.variants.length > 0 && (
                  <p className={cn(
                    "text-xs mt-0.5",
                    isRemoved ? "text-red-400/60 line-through" : isAdded ? "text-shopbox-accent/70" : "text-shopbox-detail"
                  )}>
                    {item.variants.join(", ")}
                  </p>
                )}
                {item.modifications.length > 0 && (
                  <p className={cn(
                    "text-xs mt-0.5",
                    isRemoved ? "text-red-400/60 line-through" : isAdded ? "text-shopbox-accent/70" : "text-shopbox-warning"
                  )}>
                    {item.modifications.join(", ")}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-shopbox-border/50 text-xs text-shopbox-detail">
        <div className="flex items-center gap-1.5">
          {viewMode === "kanban" && onKanbanBack ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onKanbanBack();
              }}
              className="rounded-md bg-shopbox-surface px-2 py-1 text-xs font-medium text-shopbox-text-secondary hover:text-shopbox-text hover:bg-shopbox-card-hover transition-colors"
            >
              {t("card.back")}
            </button>
          ) : viewMode === "grid" && prevStageId ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                advanceStage(order.id, prevStageId);
              }}
              className="rounded-md bg-shopbox-surface px-2 py-1 text-xs font-medium text-shopbox-text-secondary hover:text-shopbox-text hover:bg-shopbox-card-hover transition-colors"
            >
              {t("card.back")}
            </button>
          ) : null}
          <span className={cn(showItemCheckmarks && allDone && "text-shopbox-accent font-semibold")}>
            {showItemCheckmarks
              ? t("card.itemsDone", { done: doneCount, total: totalCount })
              : t("card.itemsCount", { total: totalCount })}
          </span>
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          {order.notes && (
            <span className="text-shopbox-detail italic truncate" title={order.notes}>
              📝 {order.notes}
            </span>
          )}
          {smsEnabled && order.customerInfo?.phone && currentStage?.smsTemplate && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                const message = currentStage.smsTemplate!.replace(
                  "#{orderNumber}",
                  String(order.orderNumber)
                );
                sendOrderSms(order.customerInfo!.phone!, order.orderNumber, order.id, message);
              }}
              className="rounded-md bg-shopbox-accent/10 px-2 py-1 text-[10px] font-medium text-shopbox-accent hover:bg-shopbox-accent/20 transition-colors"
              title={t("card.sendSms", { phone: order.customerInfo!.phone! })}
            >
              {(order.smsSentCount ?? 0) > 0 ? `SMS (${order.smsSentCount})` : "SMS"}
            </button>
          )}
        </div>
      </div>

      {/* Refunded/deleted order overlay */}
      {order.isRefunded && (
        <div className="absolute inset-0 rounded-3xl bg-red-950/80 flex flex-col items-center justify-center z-10">
          <span className="text-6xl font-black text-red-500">✕</span>
          <span className="text-sm font-bold text-red-400 mt-2 uppercase tracking-widest">
            {t("card.deleted")}
          </span>
        </div>
      )}
    </div>
  );
}
