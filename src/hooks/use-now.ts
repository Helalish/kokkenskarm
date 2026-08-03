"use client";

import { useEffect, useState } from "react";

/**
 * Single shared 1s clock for the whole app.
 * All useNow() subscribers share one interval instead of one per component.
 */
let sharedNow = Date.now();
const listeners = new Set<() => void>();
let intervalId: number | null = null;

function ensureTicking() {
  if (intervalId !== null || typeof window === "undefined") return;
  intervalId = window.setInterval(() => {
    sharedNow = Date.now();
    for (const listener of listeners) listener();
  }, 1000);
}

function stopIfIdle() {
  if (listeners.size > 0 || intervalId === null) return;
  window.clearInterval(intervalId);
  intervalId = null;
}

export function useNow(): number {
  const [now, setNow] = useState(sharedNow);

  useEffect(() => {
    const onTick = () => setNow(sharedNow);
    listeners.add(onTick);
    ensureTicking();
    return () => {
      listeners.delete(onTick);
      stopIfIdle();
    };
  }, []);

  return now;
}
