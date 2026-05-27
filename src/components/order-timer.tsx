"use client";

import { useOrderTimer } from "@/hooks/use-order-timer";
import { useSettingsStore } from "@/stores/settings-store";
import { cn } from "@/lib/cn";

interface OrderTimerProps {
  createdAt: string;
}

export function OrderTimer({ createdAt }: OrderTimerProps) {
  const { timerWarningSeconds, timerCriticalSeconds } = useSettingsStore();
  const { formatted, status } = useOrderTimer(
    createdAt,
    timerWarningSeconds,
    timerCriticalSeconds
  );

  return (
    <span
      className={cn(
        "font-mono text-sm font-semibold tabular-nums",
        status === "normal" && "text-shopbox-accent",
        status === "warning" && "text-shopbox-warning",
        status === "critical" && "text-shopbox-critical timer-pulse"
      )}
    >
      {formatted}
    </span>
  );
}
