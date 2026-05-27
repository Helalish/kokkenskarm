"use client";

import { useCountdown } from "@/hooks/use-countdown";
import { cn } from "@/lib/cn";

interface PreOrderCountdownProps {
  scheduledTime: string;
}

export function PreOrderCountdown({ scheduledTime }: PreOrderCountdownProps) {
  const { formatted, isOverdue, remaining } = useCountdown(scheduledTime);
  const isUrgent = remaining > 0 && remaining <= 600; // under 10 min

  return (
    <div className="flex flex-col items-center">
      <span className="text-[10px] text-shopbox-muted uppercase tracking-wider">
        {isOverdue ? "Overskredet" : "Afhentning om"}
      </span>
      <span
        className={cn(
          "font-mono text-sm font-bold tabular-nums",
          isOverdue && "text-shopbox-critical timer-pulse",
          isUrgent && !isOverdue && "text-shopbox-warning",
          !isOverdue && !isUrgent && "text-shopbox-accent"
        )}
      >
        {formatted}
      </span>
      <span className="text-[10px] text-shopbox-text-secondary">
        {new Date(scheduledTime).toLocaleTimeString("da-DK", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    </div>
  );
}
