"use client";

import { useEffect, useRef } from "react";
import { useOrdersStore } from "@/stores/orders-store";
import { usePipelineStore } from "@/stores/pipeline-store";
import type { Order } from "@/types/order";

const POLL_INTERVAL = 8000; // 8 seconds

export function useOrderPolling(enabled: boolean) {
  const { orders, addOrder, setOrders } = useOrdersStore();
  const { getFirstStageId } = usePipelineStore();
  const knownOrderIdsRef = useRef<Set<string>>(new Set());
  const dismissedIdsRef = useRef<Set<string>>(new Set());

  // Track dismissed orders to avoid re-adding them
  const { dismissedOrders } = useOrdersStore();
  useEffect(() => {
    dismissedIdsRef.current = new Set(dismissedOrders.map((o) => o.id));
  }, [dismissedOrders]);

  // Track known orders
  useEffect(() => {
    knownOrderIdsRef.current = new Set(orders.map((o) => o.id));
  }, [orders]);

  useEffect(() => {
    if (!enabled) return;

    async function pollOrders() {
      try {
        const response = await fetch("/api/orders");
        if (!response.ok) return;

        const data = await response.json();
        const fetchedOrders: Order[] = data.orders ?? [];
        const firstStageId = getFirstStageId();

        for (const order of fetchedOrders) {
          // Skip dismissed and already-known orders
          if (dismissedIdsRef.current.has(order.id)) continue;
          if (knownOrderIdsRef.current.has(order.id)) continue;

          // Assign to first pipeline stage if not set
          if (!order.currentStageId && firstStageId) {
            order.currentStageId = firstStageId;
          }

          addOrder(order);
        }
      } catch (error) {
        console.error("Order polling error:", error);
      }
    }

    // Initial fetch
    pollOrders();

    const interval = setInterval(pollOrders, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [enabled, getFirstStageId, addOrder]);
}
