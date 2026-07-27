"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useOrdersStore } from "@/stores/orders-store";
import type { Order } from "@/types/order";
import { fetchOrders as shopboxFetchOrders } from "@/api/orders";

const POLL_INTERVAL = 8000;

export function useOrderPolling() {
  const setOrders = useOrdersStore((s) => s.setOrders);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const activeRef = useRef(false);

  const fetchOrders = useCallback(async () => {
    if (typeof document !== "undefined" && document.hidden) return;
    if (!activeRef.current) return;

    const requestId = ++requestIdRef.current;

    try {
      const orders = await shopboxFetchOrders();
      if (requestId !== requestIdRef.current || !activeRef.current) return;

      setOrders((orders ?? []) as Order[]);
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

  useEffect(() => {
    activeRef.current = true;

    // Defer the first fetch so React Strict Mode's mount → cleanup → remount
    // cycle clears this timeout and only the second mount fires a request.
    // No AbortController → no cancelled request in the Network tab.
    const initialTimer = window.setTimeout(() => {
      fetchOrders();
    }, 0);

    const interval = setInterval(fetchOrders, POLL_INTERVAL);

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
