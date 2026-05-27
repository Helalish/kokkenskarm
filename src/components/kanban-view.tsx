"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Order } from "@/types/order";
import type { StationConfig } from "@/types/station";
import { usePipelineStore } from "@/stores/pipeline-store";
import { useOrdersStore } from "@/stores/orders-store";
import { useSettingsStore } from "@/stores/settings-store";
import { useMvpStore } from "@/stores/mvp-store";
import { sendOrderSms } from "@/services/sms-service";
import { OrderCard } from "./order-card";
import { OrderCardExpanded } from "./order-card-expanded";

interface KanbanViewProps {
  orders: Order[];
  activeStation?: StationConfig | null;
}

export function KanbanView({ orders, activeStation }: KanbanViewProps) {
  const { stages } = usePipelineStore();
  const { sortOrder, smsEnabled } = useSettingsStore();
  const { isMvpMode } = useMvpStore();
  const { advanceStage, dismissOrder } = useOrdersStore();
  const [expandedOrder, setExpandedOrder] = useState<Order | null>(null);
  const [animatingOrderIds, setAnimatingOrderIds] = useState<Map<string, string>>(new Map());

  const prevStageMapRef = useRef<Map<string, string>>(new Map());
  const sortedStages = [...stages].sort((a, b) => a.sortOrder - b.sortOrder);

  // Detect stage changes for pulse animation
  useEffect(() => {
    const newAnimating = new Map<string, string>();
    const currentMap = new Map(orders.map((o) => [o.id, o.currentStageId]));

    currentMap.forEach((stageId, orderId) => {
      const prevStageId = prevStageMapRef.current.get(orderId);
      if (prevStageId && prevStageId !== stageId) {
        const stage = stages.find((s) => s.id === stageId);
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
  }, [orders, stages]);

  const handleKanbanClick = useCallback(
    (order: Order) => {
      const idx = sortedStages.findIndex((s) => s.id === order.currentStageId);
      if (idx < sortedStages.length - 1) {
        const nextStage = sortedStages[idx + 1];
        advanceStage(order.id, nextStage.id);

        // Per-stage auto-SMS
        if (
          smsEnabled &&
          nextStage.smsEnabled &&
          nextStage.smsTemplate &&
          order.customerInfo?.phone
        ) {
          const message = nextStage.smsTemplate.replace("#{orderNumber}", String(order.orderNumber));
          sendOrderSms(order.customerInfo.phone, order.orderNumber, order.id, message);
        }
      } else {
        dismissOrder(order.id);
      }
    },
    [sortedStages, advanceStage, dismissOrder, smsEnabled]
  );

  const handleKanbanBack = useCallback(
    (order: Order) => {
      const idx = sortedStages.findIndex((s) => s.id === order.currentStageId);
      if (idx > 0) {
        advanceStage(order.id, sortedStages[idx - 1].id);
      }
    },
    [sortedStages, advanceStage]
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
          <p className="text-2xl mb-2">Ingen aktive ordrer</p>
          <p className="text-sm">Nye ordrer vises automatisk her</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 flex overflow-hidden">
        {sortedStages.map((stage, stageIndex) => {
          const columnOrders = orders
            .filter((o) => o.currentStageId === stage.id)
            .sort(sortFn);
          const isFirstStage = stageIndex === 0;

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
                      activeStation={activeStation}
                      viewMode="kanban"
                      onKanbanClick={() => handleKanbanClick(order)}
                      onKanbanBack={!isFirstStage ? () => handleKanbanBack(order) : undefined}
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
