"use client";

import { useState, useEffect, useRef } from "react";
import type { Order } from "@/types/order";
import { useSettingsStore } from "@/stores/settings-store";
import { usePipeline } from "@/hooks/use-pipeline";
import { useT } from "@/hooks/use-t";
import { cn } from "@/lib/cn";
import { OrderCard } from "./order-card";
import { OrderCardExpanded } from "./order-card-expanded";

interface OrderGridProps {
  orders: Order[];
}

export function OrderGrid({ orders }: OrderGridProps) {
  const sortOrder = useSettingsStore((s) => s.sortOrder);
  const { stages } = usePipeline();
  const t = useT();
  const [expandedOrder, setExpandedOrder] = useState<Order | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());
  const [animatingOrderIds, setAnimatingOrderIds] = useState<Map<string, string>>(new Map());
  const prevOrderIdsRef = useRef<Set<string>>(new Set());
  const prevStageMapRef = useRef<Map<string, string>>(new Map());

  // Auto-deselect after 3 seconds
  useEffect(() => {
    if (!selectedOrderId) return;
    const timer = setTimeout(() => setSelectedOrderId(null), 3000);
    return () => clearTimeout(timer);
  }, [selectedOrderId]);

  // Track new orders for flash animation
  useEffect(() => {
    const currentIds = new Set(orders.map((o) => o.id));
    const prevIds = prevOrderIdsRef.current;

    const newIds = new Set<string>();
    currentIds.forEach((id) => {
      if (!prevIds.has(id)) newIds.add(id);
    });

    if (newIds.size > 0) {
      setNewOrderIds(newIds);
      const timer = setTimeout(() => setNewOrderIds(new Set()), 1500);
      prevOrderIdsRef.current = currentIds;
      return () => clearTimeout(timer);
    }

    prevOrderIdsRef.current = currentIds;
  }, [orders]);

  // Track stage changes for pulse animation
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
      const timer = setTimeout(() => {
        setAnimatingOrderIds(newAnimating);
        setSelectedOrderId(null); // Clear selection after advancing
      }, 0);
      const clearTimer = setTimeout(() => setAnimatingOrderIds(new Map()), 600);
      prevStageMapRef.current = currentMap;
      return () => {
        clearTimeout(timer);
        clearTimeout(clearTimer);
      };
    }

    prevStageMapRef.current = currentMap;
  }, [orders, stages]);

  const sortedOrders = [...orders].sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();
    if (timeA !== timeB) {
      return sortOrder === "oldest" ? timeA - timeB : timeB - timeA;
    }
    // Tie-break on order number, following the selected sort direction.
    return sortOrder === "oldest"
      ? a.orderNumber - b.orderNumber
      : b.orderNumber - a.orderNumber;
  });

  // Drop stale selection during render — no effect needed
  const effectiveSelectedId =
    selectedOrderId && orders.some((o) => o.id === selectedOrderId)
      ? selectedOrderId
      : null;

  const currentExpanded = expandedOrder
    ? orders.find((o) => o.id === expandedOrder.id) ?? null
    : null;

  if (sortedOrders.length === 0) {
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
      <div className="flex-1 p-4 overflow-y-auto grid gap-4 content-start grid-cols-[repeat(auto-fill,minmax(min(100%,350px),1fr))]">
        {sortedOrders.map((order) => (
          <div
            key={order.id}
            className={cn("min-w-0", animatingOrderIds.has(order.id) && "stage-change-pulse")}
            style={
              animatingOrderIds.has(order.id)
                ? ({ "--pulse-color": animatingOrderIds.get(order.id) } as React.CSSProperties)
                : undefined
            }
          >
            <OrderCard
              order={order}
              isSelected={effectiveSelectedId === order.id}
              onSelect={() => setSelectedOrderId(prev => prev === order.id ? null : order.id)}
              onExpand={() => setExpandedOrder(order)}
              isNew={newOrderIds.has(order.id)}
            />
          </div>
        ))}
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
