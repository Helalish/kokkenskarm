"use client";

import type { OrderSource } from "@/types/order";

const sourceLabels: Record<OrderSource, string> = {
  pos: "POS",
  weorder: "WEB",
  kiosk: "KIOSK",
  qr: "QR",
};

interface SourceBadgeProps {
  source: OrderSource;
}

export function SourceBadge({ source }: SourceBadgeProps) {
  return (
    <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-shopbox-text-secondary">
      {sourceLabels[source]}
    </span>
  );
}
