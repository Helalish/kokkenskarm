"use client";

import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  parseKdsUpdateEvent,
  ORDER_REFETCH_EVENTS,
  type KdsSyncActions,
  type KdsUpdateEventType,
} from "@/types/kds-update";

const DEBOUNCE_MS = 400;

export type SubscribeToKdsUpdatesOptions = {
  /** When set, ignore events whose client_id doesn't match. */
  clientId?: string | null;
  /** Which order-related events should trigger an orders refetch. */
  orderEvents?: ReadonlySet<KdsUpdateEventType>;
};

function clientIdMatches(
  eventClientId: number | undefined,
  expectedClientId: string | null | undefined
): boolean {
  if (expectedClientId == null || expectedClientId === "") return true;
  if (eventClientId === undefined) return true;
  return String(eventClientId) === String(expectedClientId);
}

/**
 * Subscribe to branch KDS update signals.
 * Debounce coalesces into { refetchOrders, refetchSettings }.
 * Path: database/{FIRESTORE_ENV}/webSocket/kdsUpdates/branch/{branchId}
 */
export function subscribeToKdsUpdates(
  branchId: string,
  onActions: (actions: KdsSyncActions) => void,
  options?: SubscribeToKdsUpdatesOptions
) {
  const env = process.env.NEXT_PUBLIC_FIRESTORE_ENV!;
  const ref = doc(db, "database", env, "webSocket", "kdsUpdates", "branch", branchId);
  const orderEvents = options?.orderEvents ?? ORDER_REFETCH_EVENTS;

  let isFirst = true;
  let pending: KdsSyncActions = { refetchOrders: false, refetchSettings: false };
  let timer: number | null = null;

  const flush = () => {
    const actions = pending;
    pending = { refetchOrders: false, refetchSettings: false };
    if (!actions.refetchOrders && !actions.refetchSettings) return;
    onActions(actions);
  };

  const unsub = onSnapshot(
    ref,
    (snap) => {
      // Ignore the initial snapshot so mount doesn't trigger a redundant refetch.
      if (isFirst) {
        isFirst = false;
        return;
      }

      const parsed = parseKdsUpdateEvent(snap.data());
      if (!parsed) return;
      if (!clientIdMatches(parsed.client_id, options?.clientId)) return;

      if (parsed.event === "settings_updated") {
        pending.refetchSettings = true;
      } else if (orderEvents.has(parsed.event)) {
        pending.refetchOrders = true;
      } else {
        return;
      }

      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(flush, DEBOUNCE_MS);
    },
    (err) => {
      console.error("KDS Firestore listener error:", err);
    }
  );

  return () => {
    if (timer) window.clearTimeout(timer);
    unsub();
  };
}
