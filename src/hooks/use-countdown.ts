"use client";

import { useState, useEffect } from "react";

export function useCountdown(targetTime: string): {
  remaining: number;
  formatted: string;
  isOverdue: boolean;
} {
  const [remaining, setRemaining] = useState(() =>
    Math.floor((new Date(targetTime).getTime() - Date.now()) / 1000)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(Math.floor((new Date(targetTime).getTime() - Date.now()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetTime]);

  const isOverdue = remaining <= 0;
  const absSeconds = Math.abs(remaining);
  const hours = Math.floor(absSeconds / 3600);
  const mins = Math.floor((absSeconds % 3600) / 60);
  const secs = absSeconds % 60;

  let formatted: string;
  if (hours > 0) {
    formatted = `${hours}t ${mins.toString().padStart(2, "0")}m`;
  } else {
    formatted = `${mins}:${secs.toString().padStart(2, "0")}`;
  }
  if (isOverdue) formatted = `-${formatted}`;

  return { remaining, formatted, isOverdue };
}
