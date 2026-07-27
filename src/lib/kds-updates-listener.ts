"use client";

import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { parseKdsUpdateEvent, type KdsUpdateEvent } from "@/types/kds-update";

const DEBOUNCE_MS = 400;

export function subscribeToKdsUpdates(
  branchId: string,
  onEvent: (event: KdsUpdateEvent) => void
) {
  const env = process.env.NEXT_PUBLIC_FIRESTORE_ENV!;
  const ref = doc(db, "database", env, "webSocket", "kdsUpdates", "branch", branchId);

  let isFirst = true;
  let pending: KdsUpdateEvent | null = null;
  let timer: number | null = null;

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

      pending = parsed;
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (!pending) return;
        const next = pending;
        pending = null;
        onEvent(next);
      }, DEBOUNCE_MS);
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
