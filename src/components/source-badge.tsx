"use client";

import type { OrderSource } from "@/types/order";
import { cn } from "@/lib/cn";

const sourceConfig: Record<OrderSource, { label: string; color: string }> = {
  pos: { label: "POS", color: "bg-blue-600" },
  weorder: { label: "WEB", color: "bg-purple-600" },
  kiosk: { label: "KIOSK", color: "bg-amber-600" },
  qr: { label: "QR", color: "bg-emerald-600" },
};

interface SourceBadgeProps {
  source: OrderSource;
}

export function SourceBadge({ source }: SourceBadgeProps) {
  const config = sourceConfig[source];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white",
        config.color
      )}
    >
      {config.label}
    </span>
  );
}
