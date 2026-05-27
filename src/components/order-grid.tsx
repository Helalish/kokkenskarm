"use client";

import { useState, useEffect, useRef } from "react";
import type { Order } from "@/types/order";
import type { StationConfig } from "@/types/station";
import { useSettingsStore } from "@/stores/settings-store";
import { useMvpStore } from "@/stores/mvp-store";
import { usePipeline } from "@/hooks/use-pipeline";
import { OrderCard } from "./order-card";
import { OrderCardExpanded } from "./order-card-expanded";

interface OrderGridProps {
  orders: Order[];
  activeStation?: StationConfig | null;
}

export function OrderGrid({ orders, activeStation }: OrderGridProps) {
  const { gridColumns, sortOrder } = useSettingsStore();
  const isMvpMode = useMvpStore((s) => s.isMvpMode);
  const { stages } = usePipeline();
  // DEMO mode is locked to a 4-column grid.
  const effectiveGridColumns = isMvpMode ? gridColumns : 4;
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
      setAnimatingOrderIds(newAnimating);
      setSelectedOrderId(null); // Clear selection after advancing
      const timer = setTimeout(() => setAnimatingOrderIds(new Map()), 600);
      prevStageMapRef.current = currentMap;
      return () => clearTimeout(timer);
    }

    prevStageMapRef.current = currentMap;
  }, [orders, stages]);

  // Clear selection if the selected order was removed
  useEffect(() => {
    if (selectedOrderId && !orders.find((o) => o.id === selectedOrderId)) {
      setSelectedOrderId(null);
    }
  }, [orders, selectedOrderId]);

  const sortedOrders = [...orders].sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();
    return sortOrder === "oldest" ? timeA - timeB : timeB - timeA;
  });

  const currentExpanded = expandedOrder
    ? orders.find((o) => o.id === expandedOrder.id) ?? null
    : null;

  if (sortedOrders.length === 0) {
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
      <div
        className="flex-1 p-4 overflow-y-auto"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${effectiveGridColumns}, 1fr)`,
          gap: "1rem",
          alignContent: "start",
        }}
      >
        {sortedOrders.map((order) => (
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
              isSelected={selectedOrderId === order.id}
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
