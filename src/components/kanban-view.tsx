"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Order } from "@/types/order";
import { PIPELINE_STAGES, getNextStageId, getStage } from "@/lib/pipeline";
import { useOrdersStore } from "@/stores/orders-store";
import { useSettingsStore } from "@/stores/settings-store";
import { useT } from "@/hooks/use-t";
import { OrderCard } from "./order-card";
import { OrderCardExpanded } from "./order-card-expanded";

interface KanbanViewProps {
  orders: Order[];
}

export function KanbanView({ orders }: KanbanViewProps) {
  const sortOrder = useSettingsStore((s) => s.sortOrder);
  const updateOrderStatus = useOrdersStore((s) => s.updateOrderStatus);
  const t = useT();
  const [expandedOrder, setExpandedOrder] = useState<Order | null>(null);
  const [animatingOrderIds, setAnimatingOrderIds] = useState<Map<string, string>>(new Map());

  const prevStageMapRef = useRef<Map<string, string>>(new Map());

  // Detect stage changes for pulse animation
  useEffect(() => {
    const newAnimating = new Map<string, string>();
    const currentMap = new Map(orders.map((o) => [o.id, o.currentStageId]));

    currentMap.forEach((stageId, orderId) => {
      const prevStageId = prevStageMapRef.current.get(orderId);
      if (prevStageId && prevStageId !== stageId) {
        const stage = getStage(stageId);
        if (stage) newAnimating.set(orderId, stage.color);
      }
    });

    if (newAnimating.size > 0) {
      setAnimatingOrderIds(newAnimating);
      const timer = setTimeout(() => setAnimatingOrderIds(new Map()), 600);
      prevStageMapRef.current = currentMap;
      return () => clearTimeout(timer);
    }

    prevStageMapRef.current = currentMap;
  }, [orders]);

  const handleKanbanClick = useCallback(
    (order: Order) => {
      const nextId = getNextStageId(order.currentStageId);
      updateOrderStatus(order.id, nextId ?? "done");
    },
    [updateOrderStatus]
  );

  const sortFn = (a: Order, b: Order) => {
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();
    return sortOrder === "oldest" ? timeA - timeB : timeB - timeA;
  };

  const currentExpanded = expandedOrder
    ? orders.find((o) => o.id === expandedOrder.id) ?? null
    : null;

  if (orders.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-shopbox-muted">
        <div className="text-center">
          <p className="text-2xl mb-2">{t("grid.empty.title")}</p>
          <p className="text-sm">{t("grid.empty.subtitle")}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 flex overflow-hidden">
        {PIPELINE_STAGES.map((stage) => {
          const columnOrders = orders
            .filter((o) => o.currentStageId === stage.id)
            .sort(sortFn);
          return (
            <div
              key={stage.id}
              className="flex-1 flex flex-col min-w-0 border-r border-shopbox-border/30 last:border-r-0"
            >
              {/* Column header */}
              <div
                className="shrink-0 px-3 py-2.5 text-white flex items-center justify-between"
                style={{ backgroundColor: stage.color }}
              >
                <span className="uppercase tracking-wider text-xs font-semibold">
                  {stage.name}
                </span>
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold">
                  {columnOrders.length}
                </span>
              </div>

              {/* Scrollable order list */}
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {columnOrders.map((order) => (
                  <div
                    key={order.id}
                    className={animatingOrderIds.has(order.id) ? "stage-change-pulse" : ""}
                    style={
                      animatingOrderIds.has(order.id)
                        ? ({ "--pulse-color": animatingOrderIds.get(order.id) } as React.CSSProperties)
                        : undefined
                    }
                  >
                    <OrderCard
                      order={order}
                      viewMode="kanban"
                      onKanbanClick={() => handleKanbanClick(order)}
                      onExpand={() => setExpandedOrder(order)}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {currentExpanded && (
        <OrderCardExpanded
          order={currentExpanded}
          onClose={() => setExpandedOrder(null)}
        />
      )}
    </>
  );
}
