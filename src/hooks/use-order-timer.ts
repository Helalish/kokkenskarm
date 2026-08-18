"use client";

import { getElapsedSeconds, getTimerStatus, formatElapsedTime, type TimerStatus } from "@/lib/time-helpers";
import { useLanguageStore } from "@/stores/language-store";
import { useNow } from "@/hooks/use-now";

interface TimerResult {
  elapsed: number;
  formatted: string;
  status: TimerStatus;
}

export function useOrderTimer(
  createdAt: string,
  warningSeconds: number,
  criticalSeconds: number
): TimerResult {
  const language = useLanguageStore((s) => s.language);
  const now = useNow();
  const elapsed = getElapsedSeconds(createdAt, now);

  return {
    elapsed,
    formatted: formatElapsedTime(elapsed, language),
    status: getTimerStatus(elapsed, warningSeconds, criticalSeconds),
  };
}
