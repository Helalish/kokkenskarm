"use client";

import type { CustomerInfo as CustomerInfoType } from "@/types/order";

interface CustomerInfoProps {
  info: CustomerInfoType;
}

export function CustomerInfo({ info }: CustomerInfoProps) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-shopbox-text-secondary">
      <span className="truncate">{info.name}</span>
      {info.phone && (
        <>
          <span className="text-shopbox-border">·</span>
          <span className="tabular-nums">{info.phone}</span>
        </>
      )}
    </div>
  );
}
