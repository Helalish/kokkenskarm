"use client";

import { useEffect, useRef, useState } from "react";
import { useOrdersStore } from "@/stores/orders-store";
import { useSettingsStore } from "@/stores/settings-store";
import { playNewOrderSound } from "@/services/audio-service";
import { useOrderPolling } from "@/hooks/use-order-polling";
import { useT } from "@/hooks/use-t";
import { OrderGrid } from "@/components/order-grid";
import { KanbanView } from "@/components/kanban-view";
import { SummaryView } from "@/components/summary-view";
import { PipelineBar } from "@/components/pipeline-bar";
import { KdsHeader } from "@/components/kds-header";
import { SessionGuard } from "@/components/session-guard";

export default function KdsPage() {
  return (
    <SessionGuard>
      <KdsPageContent />
    </SessionGuard>
  );
}

function KdsPageContent() {
  const { orders, updateOrderStatus } = useOrdersStore();
  const viewMode = useSettingsStore((s) => s.viewMode);
  const remote = useSettingsStore((s) => s.remote);
  const soundEnabled = remote?.soundEnabled ?? false;
  const autoDismissReadySeconds = remote?.autoDismissReadySeconds ?? 0;
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

  useEffect(() => {
    if (autoDismissReadySeconds <= 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      for (const order of orders) {
        if (
          order.currentStageId === "ready" &&
          order.stageEnteredAt &&
          now - new Date(order.stageEnteredAt).getTime() >= autoDismissReadySeconds * 1000
        ) {
          void updateOrderStatus(order.id, "done");
        }
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [autoDismissReadySeconds, orders, updateOrderStatus]);

  const filteredOrders =
    activeStageFilter && viewMode !== "kanban"
      ? orders.filter((o) => o.currentStageId === activeStageFilter)
      : orders;

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
        <KanbanView orders={filteredOrders} />
      ) : viewMode === "summary" ? (
        <SummaryView orders={filteredOrders} />
      ) : (
        <OrderGrid orders={filteredOrders} />
      )}
    </div>
  );
}
