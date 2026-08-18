"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useSettingsStore } from "@/stores/settings-store";
import { subscribeToKdsUpdates } from "@/lib/kds-updates-listener";
import {
  ORDER_REFETCH_EVENTS,
  type KdsUpdateEventType,
} from "@/types/kds-update";

const FALLBACK_POLL_INTERVAL_MS = 90_000;

type UseKdsLiveSyncOptions = {
  refresh: () => Promise<void>;
  orderEvents?: ReadonlySet<KdsUpdateEventType>;
  enabled?: boolean;
};

export type KdsLiveSyncState = {
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

/**
 * Shared Firebase + fallback polling sync for KDS and customer display.
 * Primary: Firestore → refetch. Fallback: 90s poll + refetch on tab focus.
 */
export function useKdsLiveSync({
  refresh,
  orderEvents = ORDER_REFETCH_EVENTS,
  enabled = true,
}: UseKdsLiveSyncOptions): KdsLiveSyncState {
  const branchId = useAuthStore((s) => s.selectedBranchId);
  const clientId = useAuthStore((s) => s.selectedClientId);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const activeRef = useRef(false);
  const requestIdRef = useRef(0);
  const refreshRef = useRef(refresh);

  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  const runRefresh = useCallback(async () => {
    if (typeof document !== "undefined" && document.hidden) return;
    if (!activeRef.current) return;

    const requestId = ++requestIdRef.current;

    try {
      await refreshRef.current();
      if (requestId !== requestIdRef.current || !activeRef.current) return;
      setError(null);
    } catch (err) {
      if (requestId !== requestIdRef.current || !activeRef.current) return;
      setError("Network error");
      console.error("KDS sync refresh error:", err);
    } finally {
      if (requestId === requestIdRef.current && activeRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    activeRef.current = true;

    const initialTimer = window.setTimeout(() => {
      void runRefresh();
    }, 0);

    let intervalId: number | null = null;

    const clearPoll = () => {
      if (intervalId !== null) {
        window.clearInterval(intervalId);
        intervalId = null;
      }
    };

    const startPoll = () => {
      clearPoll();
      if (typeof document !== "undefined" && document.hidden) return;
      intervalId = window.setInterval(() => {
        void runRefresh();
      }, FALLBACK_POLL_INTERVAL_MS);
    };

    startPoll();

    const handleVisibility = () => {
      if (document.hidden) {
        clearPoll();
        return;
      }
      void runRefresh();
      startPoll();
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      activeRef.current = false;
      requestIdRef.current += 1;
      clearTimeout(initialTimer);
      clearPoll();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [enabled, runRefresh]);

  useEffect(() => {
    if (!enabled || !branchId) return;

    const unsubscribe = subscribeToKdsUpdates(
      branchId,
      (actions) => {
        if (actions.refetchSettings) {
          void useSettingsStore.getState().loadFromShopbox();
        }
        if (actions.refetchOrders) {
          void runRefresh();
        }
      },
      { clientId, orderEvents }
    );

    return unsubscribe;
  }, [enabled, branchId, clientId, orderEvents, runRefresh]);

  return {
    isLoading,
    error,
    refetch: runRefresh,
  };
}
