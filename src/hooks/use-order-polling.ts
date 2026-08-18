"use client";

import { useCallback, useEffect, useRef } from "react";
import { useOrdersStore } from "@/stores/orders-store";
import { fetchOrders as shopboxFetchOrders } from "@/api/orders";
import { useKdsLiveSync, type KdsLiveSyncState } from "@/hooks/use-kds-live-sync";

export function useOrderPolling(): KdsLiveSyncState {
  const setOrders = useOrdersStore((s) => s.setOrders);
  const pendingMutations = useOrdersStore((s) => s.pendingMutations);
  const queuedRefetchRef = useRef(false);

  const refresh = useCallback(async () => {
    // Don't replace optimistic UI mid-write — queue one refetch instead.
    if (useOrdersStore.getState().pendingMutations > 0) {
      queuedRefetchRef.current = true;
      return;
    }

    const orders = (await shopboxFetchOrders()) ?? [];

    if (useOrdersStore.getState().pendingMutations > 0) {
      queuedRefetchRef.current = true;
      return;
    }

    setOrders(orders);
  }, [setOrders]);

  const { isLoading, error, refetch } = useKdsLiveSync({ refresh });

  // Flush any refetch deferred while writes were in flight.
  useEffect(() => {
    if (pendingMutations > 0 || !queuedRefetchRef.current) return;
    queuedRefetchRef.current = false;
    void refetch();
  }, [pendingMutations, refetch]);

  return { isLoading, error, refetch };
}
