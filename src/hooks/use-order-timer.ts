"use client";

import { useState, useEffect } from "react";
import { getElapsedSeconds, getTimerStatus, formatElapsedTime, type TimerStatus } from "@/lib/time-helpers";

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
  const [elapsed, setElapsed] = useState(() => getElapsedSeconds(createdAt));

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(getElapsedSeconds(createdAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [createdAt]);

  return {
    elapsed,
    formatted: formatElapsedTime(elapsed),
    status: getTimerStatus(elapsed, warningSeconds, criticalSeconds),
  };
}
