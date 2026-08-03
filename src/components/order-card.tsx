"use client";

import { useEffect, useRef } from "react";
import type { Order } from "@/types/order";
import { useOrdersStore } from "@/stores/orders-store";
import { getNextStageId, getStage } from "@/lib/pipeline";
import { useSettingsStore } from "@/stores/settings-store";
import { useOrderTimer } from "@/hooks/use-order-timer";
import { OrderItemRow } from "./order-item-row";
import { OrderItemExtras } from "./order-item-extras";
import { SourceBadge } from "./source-badge";
import { PaymentBadge } from "./payment-badge";
import { CustomerInfo } from "./customer-info";
import { useT } from "@/hooks/use-t";
import { cn } from "@/lib/cn";

interface OrderCardProps {
  order: Order;
  isSelected?: boolean;
  onSelect?: () => void;
  onExpand?: () => void;
  isNew?: boolean;
  viewMode?: "grid" | "kanban";
  onKanbanClick?: () => void;
}

export function OrderCard({
  order,
  isSelected,
  onSelect,
  onExpand,
  isNew,
  viewMode = "grid",
  onKanbanClick,
}: OrderCardProps) {
  const updateOrderStatus = useOrdersStore((s) => s.updateOrderStatus);
  const toggleItemDone = useOrdersStore((s) => s.toggleItemDone);
  const acknowledgeChanges = useOrdersStore((s) => s.acknowledgeChanges);
  const t = useT();
  const {
    timerWarningSeconds,
    timerCriticalSeconds,
    showItemCheckmarks,
    autoAdvanceWhenAllDone,
  } = useSettingsStore((s) => s.remote) ?? {
    timerWarningSeconds: 0,
    timerCriticalSeconds: 0,
    showItemCheckmarks: false,
    autoAdvanceWhenAllDone: false,
  };
  const { formatted, status } = useOrderTimer(
    order.createdAt,
    timerWarningSeconds,
    timerCriticalSeconds
  );

  const currentStage = getStage(order.currentStageId);
  const nextStageId = getNextStageId(order.currentStageId);
  const nextStage = nextStageId ? getStage(nextStageId) : null;

  const activeItems = order.items.filter((i) => i.changeStatus !== "removed" && i.changeStatus !== "refunded");
  const doneCount = activeItems.filter((i) => i.isDone).length;
  const totalCount = activeItems.length;
  const allDone = totalCount > 0 && doneCount === totalCount;

  // Auto-advance when all items are done (stops when there is no next stage)
  const prevAllDoneRef = useRef(false);
  useEffect(() => {
    if (autoAdvanceWhenAllDone && showItemCheckmarks && allDone && !prevAllDoneRef.current) {
      if (nextStageId) {
        updateOrderStatus(order.id, nextStageId);
      }
    }
    prevAllDoneRef.current = allDone;
  }, [allDone, autoAdvanceWhenAllDone, showItemCheckmarks, nextStageId, order.id, updateOrderStatus]);

  function handleClick() {
    if (viewMode === "kanban") {
      onKanbanClick?.();
      return;
    }
    if (isSelected) {
      if (nextStageId) {
        updateOrderStatus(order.id, nextStageId);
      } else {
        updateOrderStatus(order.id, "done");
      }
    } else {
      onSelect?.();
    }
  }

  return (
    <div
      className={cn(
        // Card fill, border and typography stay constant — they do NOT change
        // based on order status, duration or any other order attribute.
        "no-select order-card-enter relative flex flex-col rounded-3xl border border-sb-border-tertiary bg-shopbox-card transition-all",
        order.isRefunded ? "cursor-default" : "cursor-pointer",
        isSelected && !order.isRefunded && "ring-2 ring-shopbox-accent border-shopbox-accent",
        isNew && "order-new-glow"
      )}
      onClick={order.isRefunded ? undefined : handleClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 rounded-t-3xl bg-shopbox-card-header">
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
            title={t("card.acknowledgeChanges")}
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
        <div className="flex-1 px-3 py-1 space-y-0.5 text-sm">
          {order.items.map((item) => (
            <OrderItemRow
              key={item.id}
              item={item}
              onToggleDone={() => toggleItemDone(order.id, item.id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex-1 px-3 py-1 space-y-0.5 text-sm">
          {order.items.map((item) => {
            const isRemoved = item.changeStatus === "removed" || item.changeStatus === "refunded";
            const isAdded = item.changeStatus === "added";
            return (
              <div
                key={item.id}
                className="py-0.5 px-1"
              >
                <div className="flex items-center gap-1.5">
                  {item.quantity > 1 && (
                    <span className={cn(
                      "font-bold",
                      isRemoved ? "text-red-500" : isAdded ? "text-green-500" : "text-shopbox-accent"
                    )}>
                      {item.quantity}x
                    </span>
                  )}
                  <span className={cn(
                    "font-medium",
                    isRemoved && "line-through text-red-500 font-bold",
                    isAdded && "text-green-500"
                  )}>
                    {item.name}
                  </span>
                  {isAdded && (
                    <span className="rounded bg-green-500/20 px-1 py-0.5 text-[9px] font-bold text-green-500 uppercase tracking-wider">
                      {t("card.new")}
                    </span>
                  )}
                  {item.changeStatus === "refunded" && (
                    <span className="rounded bg-red-500/20 px-1 py-0.5 text-[9px] font-bold text-red-500 uppercase tracking-wider">
                      {t("card.refunded")}
                    </span>
                  )}
                </div>
                <OrderItemExtras item={item} compact isRemoved={isRemoved} isAdded={isAdded} />
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-sb-border-tertiary text-xs text-shopbox-detail">
        <div className="flex items-center gap-1.5">
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
