"use client";

import { useEffect, useRef, useState } from "react";
import { useOrdersStore } from "@/stores/orders-store";
import { usePipeline } from "@/hooks/use-pipeline";
import { useStationStore } from "@/stores/station-store";
import { useSettingsStore } from "@/stores/settings-store";
import { filterOrdersByStation } from "@/lib/category-filter";
import { playNewOrderSound } from "@/services/audio-service";
import { useOrderPolling } from "@/hooks/use-order-polling";
import { useT } from "@/hooks/use-t";
import { OrderGrid } from "@/components/order-grid";
import { KanbanView } from "@/components/kanban-view";
import { SummaryView } from "@/components/summary-view";
import { PipelineBar } from "@/components/pipeline-bar";
import { KdsHeader } from "@/components/kds-header";

export default function KdsPage() {
  const { orders, dismissOrder } = useOrdersStore();
  const { stages } = usePipeline();
  const { getActiveStation } = useStationStore();
  const { soundEnabled, viewMode, autoDismissReadySeconds } = useSettingsStore();
  const t = useT();
  const [activeStageFilter, setActiveStageFilter] = useState<string | null>(null);
  const prevOrderCountRef = useRef(orders.length);

  const { isLoading } = useOrderPolling();

  // Play sound when new orders arrive
  useEffect(() => {
    if (isLoading) return;
    if (orders.length > prevOrderCountRef.current && soundEnabled) {
      playNewOrderSound();
    }
    prevOrderCountRef.current = orders.length;
  }, [orders.length, isLoading, soundEnabled]);

  // Auto-dismiss orders in terminal stage after configured time
  useEffect(() => {
    if (autoDismissReadySeconds <= 0) return;
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
  }, [autoDismissReadySeconds, stages, orders, dismissOrder]);

  // Apply filters
  const activeStation = getActiveStation();
  let filteredOrders = filterOrdersByStation(orders, activeStation);
  if (activeStation?.lockedStageId) {
    filteredOrders = filteredOrders.filter((o) => o.currentStageId === activeStation.lockedStageId);
  } else if (activeStageFilter && viewMode !== "kanban") {
    filteredOrders = filteredOrders.filter((o) => o.currentStageId === activeStageFilter);
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen">
        <KdsHeader />
        <div className="flex-1 flex items-center justify-center text-shopbox-muted">
          <div className="text-center">
            <div className="h-8 w-8 border-2 border-shopbox-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-lg">{t("loading.orders")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <KdsHeader />
      {viewMode === "grid" && (
        <PipelineBar
          activeStageId={activeStageFilter}
          onStageSelect={setActiveStageFilter}
        />
      )}
      {viewMode === "kanban" ? (
        <KanbanView orders={filteredOrders} activeStation={activeStation} />
      ) : viewMode === "summary" ? (
        <SummaryView orders={filteredOrders} activeStation={activeStation} />
      ) : (
        <OrderGrid orders={filteredOrders} activeStation={activeStation} />
      )}
    </div>
  );
}
