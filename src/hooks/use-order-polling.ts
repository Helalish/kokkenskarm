"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useOrdersStore } from "@/stores/orders-store";
import { fetchOrders as shopboxFetchOrders } from "@/api/orders";

/** Slow safety net if Firebase misses an update. Primary sync is Firebase → refetch(). */
const FALLBACK_POLL_INTERVAL_MS = 90_000;

export function useOrderPolling() {
  const setOrders = useOrdersStore((s) => s.setOrders);
  const pendingMutations = useOrdersStore((s) => s.pendingMutations);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const activeRef = useRef(false);
  const queuedRefetchRef = useRef(false);

  const fetchOrders = useCallback(async () => {
    if (typeof document !== "undefined" && document.hidden) return;
    if (!activeRef.current) return;

    // Don't replace optimistic UI mid-write (e.g. mark-all-done PATCHes).
    // Queue one refetch for when pendingMutations returns to 0.
    if (useOrdersStore.getState().pendingMutations > 0) {
      queuedRefetchRef.current = true;
      return;
    }

    const requestId = ++requestIdRef.current;

    try {
      const orders = await shopboxFetchOrders();
      if (requestId !== requestIdRef.current || !activeRef.current) return;

      // A mutation may have started while the GET was in flight — discard stale snapshot.
      if (useOrdersStore.getState().pendingMutations > 0) {
        queuedRefetchRef.current = true;
        return;
      }

      setOrders(orders ?? []);
      setError(null);
    } catch (err) {
      if (requestId !== requestIdRef.current || !activeRef.current) return;
      setError("Network error");
      console.error("Order polling error:", err);
    } finally {
      if (requestId === requestIdRef.current && activeRef.current) {
        setIsLoading(false);
      }
    }
  }, [setOrders]);

  // Flush any refetch that was deferred while writes were in flight.
  useEffect(() => {
    if (pendingMutations > 0 || !queuedRefetchRef.current) return;
    queuedRefetchRef.current = false;
    void fetchOrders();
  }, [pendingMutations, fetchOrders]);

  useEffect(() => {
    activeRef.current = true;

    // Defer so React Strict Mode's mount → cleanup → remount doesn't double-fetch.
    const initialTimer = window.setTimeout(() => {
      fetchOrders();
    }, 0);

    const interval = window.setInterval(fetchOrders, FALLBACK_POLL_INTERVAL_MS);

    const handleVisibility = () => {
      if (!document.hidden) fetchOrders();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      activeRef.current = false;
      requestIdRef.current += 1;
      clearTimeout(initialTimer);
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchOrders]);

  return { isLoading, error, refetch: fetchOrders };
}
