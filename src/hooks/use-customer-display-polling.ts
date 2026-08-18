"use client";

import { useCallback, useState } from "react";
import type { Order } from "@/types/order";
import { fetchOrders } from "@/api/orders";
import { useKdsLiveSync, type KdsLiveSyncState } from "@/hooks/use-kds-live-sync";
import { CUSTOMER_DISPLAY_ORDER_EVENTS } from "@/types/kds-update";

function splitCustomerOrders(orders: Order[]) {
  const inProgress: Order[] = [];
  const ready: Order[] = [];
  for (const order of orders) {
    if (order.currentStageId === "in_progress") inProgress.push(order);
    else if (order.currentStageId === "ready") ready.push(order);
  }
  return { inProgress, ready };
}

export function useCustomerDisplayPolling(): KdsLiveSyncState & {
  inProgressOrders: Order[];
  readyOrders: Order[];
} {
  const [inProgressOrders, setInProgressOrders] = useState<Order[]>([]);
  const [readyOrders, setReadyOrders] = useState<Order[]>([]);

  const refresh = useCallback(async () => {
    const orders = (await fetchOrders()) ?? [];
    const { inProgress, ready } = splitCustomerOrders(orders);
    setInProgressOrders(inProgress);
    setReadyOrders(ready);
  }, []);

  const sync = useKdsLiveSync({
    refresh,
    orderEvents: CUSTOMER_DISPLAY_ORDER_EVENTS,
  });

  return {
    ...sync,
    inProgressOrders,
    readyOrders,
  };
}
