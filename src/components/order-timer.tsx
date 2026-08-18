"use client";

import { useOrderTimer } from "@/hooks/use-order-timer";
import { useSettingsStore } from "@/stores/settings-store";
import { cn } from "@/lib/cn";

interface OrderTimerProps {
  createdAt: string;
}

export function OrderTimer({ createdAt }: OrderTimerProps) {
  const remote = useSettingsStore((s) => s.remote);
  const { formatted, status } = useOrderTimer(
    createdAt,
    remote?.timerWarningSeconds ?? 0,
    remote?.timerCriticalSeconds ?? 0
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
