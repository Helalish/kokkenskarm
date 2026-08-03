"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Order } from "@/types/order";
import { fetchOrders } from "@/api/orders";

/** Slow safety net if Firebase misses an update. Primary sync is Firebase → refetch(). */
const FALLBACK_POLL_INTERVAL_MS = 90_000;

export function useCustomerDisplayPolling() {
  const [inProgressOrders, setInProgressOrders] = useState<Order[]>([]);
  const [readyOrders, setReadyOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const activeRef = useRef(false);

  const refresh = useCallback(async () => {
    if (typeof document !== "undefined" && document.hidden) return;
    if (!activeRef.current) return;

    const requestId = ++requestIdRef.current;

    try {
      const [inProgress, ready] = await Promise.all([
        fetchOrders("in_progress"),
        fetchOrders("ready"),
      ]);

      if (requestId !== requestIdRef.current || !activeRef.current) return;

      setInProgressOrders(inProgress);
      setReadyOrders(ready);
      setError(null);
    } catch (err) {
      if (requestId !== requestIdRef.current || !activeRef.current) return;
      setError("Network error");
      console.error("Customer display polling error:", err);
    } finally {
      if (requestId === requestIdRef.current && activeRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    activeRef.current = true;

    // Defer so React Strict Mode's mount → cleanup → remount doesn't double-fetch.
    const initialTimer = window.setTimeout(() => {
      refresh();
    }, 0);

    const interval = window.setInterval(refresh, FALLBACK_POLL_INTERVAL_MS);

    const handleVisibility = () => {
      if (!document.hidden) refresh();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      activeRef.current = false;
      requestIdRef.current += 1;
      clearTimeout(initialTimer);
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [refresh]);

  return { inProgressOrders, readyOrders, isLoading, error, refetch: refresh };
}
