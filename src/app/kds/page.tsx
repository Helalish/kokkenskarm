"use client";

import { useEffect, useState, useRef } from "react";
import { useOrdersStore } from "@/stores/orders-store";
import { usePipeline } from "@/hooks/use-pipeline";
import { useStationStore } from "@/stores/station-store";
import { useSettingsStore } from "@/stores/settings-store";
import { generateInitialOrders, generateMockOrder } from "@/services/mock-data-service";
import { filterOrdersByStation } from "@/lib/category-filter";
import { playNewOrderSound } from "@/services/audio-service";
import { useModeStore } from "@/stores/mode-store";
import { useOrderPolling } from "@/hooks/use-order-polling";
import { OrderGrid } from "@/components/order-grid";
import { KanbanView } from "@/components/kanban-view";
import { SummaryView } from "@/components/summary-view";
import { PipelineBar } from "@/components/pipeline-bar";
import { KdsHeader } from "@/components/kds-header";

export default function KdsPage() {
  const { orders, setOrders, addOrder, dismissOrder } = useOrdersStore();
  const { stages, getFirstStageId } = usePipeline();
  const { getActiveStation } = useStationStore();
  const { soundEnabled, viewMode, autoDismissReadySeconds } = useSettingsStore();
  const { isFullMode } = useModeStore();
  const [activeStageFilter, setActiveStageFilter] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const prevOrderCountRef = useRef(0);

  // Clear stage filter when switching to kanban
  useEffect(() => {
    if (viewMode === "kanban") {
      setActiveStageFilter(null);
    }
  }, [viewMode]);

  // Load initial mock orders
  useEffect(() => {
    if (initialized || stages.length === 0) return;
    const firstStageId = getFirstStageId();
    if (!firstStageId) return;

    if (orders.length === 0) {
      setOrders(generateInitialOrders(firstStageId, 8));
    }
    prevOrderCountRef.current = orders.length || 8;
    setInitialized(true);
  }, [stages.length, initialized, orders.length, getFirstStageId, setOrders]);

  // Play sound when new orders arrive
  useEffect(() => {
    if (!initialized) return;
    if (orders.length > prevOrderCountRef.current && soundEnabled) {
      playNewOrderSound();
    }
    prevOrderCountRef.current = orders.length;
  }, [orders.length, initialized, soundEnabled]);

  // Simulate new orders arriving every 15-30 seconds
  useEffect(() => {
    if (!initialized) return;
    const interval = setInterval(() => {
      const firstStageId = getFirstStageId();
      if (firstStageId) {
        addOrder(generateMockOrder(firstStageId));
      }
    }, 15000 + Math.random() * 15000);
    return () => clearInterval(interval);
  }, [initialized, getFirstStageId, addOrder]);

  // Auto-dismiss orders in terminal stage after configured time
  useEffect(() => {
    if (autoDismissReadySeconds <= 0 || !initialized) return;
    const terminalStageIds = new Set(stages.filter((s) => s.isTerminal).map((s) => s.id));
    if (terminalStageIds.size === 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      for (const order of orders) {
        if (
          terminalStageIds.has(order.currentStageId) &&
          order.stageEnteredAt &&
          now - new Date(order.stageEnteredAt).getTime() >= autoDismissReadySeconds * 1000
        ) {
          dismissOrder(order.id);
        }
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [autoDismissReadySeconds, initialized, stages, orders, dismissOrder]);

  // MVP mode: also poll real orders from Shopbox API (when configured)
  useOrderPolling(isFullMode);

  // Apply filters
  const activeStation = getActiveStation();
  let filteredOrders = filterOrdersByStation(orders, activeStation);
  // Station locked to a specific stage
  if (activeStation?.lockedStageId) {
    filteredOrders = filteredOrders.filter((o) => o.currentStageId === activeStation.lockedStageId);
  } else if (activeStageFilter && viewMode !== "kanban") {
    filteredOrders = filteredOrders.filter((o) => o.currentStageId === activeStageFilter);
  }

  // DEMO mode forces grid view
  const effectiveViewMode = isFullMode ? viewMode : "grid";

  return (
    <div className="flex flex-col h-screen">
      <KdsHeader />
      {effectiveViewMode === "grid" && (
        <PipelineBar
          activeStageId={activeStageFilter}
          onStageSelect={setActiveStageFilter}
        />
      )}
      {effectiveViewMode === "kanban" ? (
        <KanbanView orders={filteredOrders} activeStation={activeStation} />
      ) : effectiveViewMode === "summary" ? (
        <SummaryView orders={filteredOrders} activeStation={activeStation} />
      ) : (
        <OrderGrid orders={filteredOrders} activeStation={activeStation} />
      )}
    </div>
  );
}
