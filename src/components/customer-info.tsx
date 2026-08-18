"use client";

import type { CustomerInfo as CustomerInfoType } from "@/types/order";
import { cn } from "@/lib/cn";

interface CustomerInfoProps {
  info: CustomerInfoType;
  className?: string;
  spaced?: boolean;
}

export function CustomerInfo({ info, className, spaced }: CustomerInfoProps) {
  return (
    <div
      className={cn(
        "flex items-center text-xs text-shopbox-text-secondary",
        spaced ? "justify-between gap-3" : "gap-1.5",
        className
      )}
    >
      <span className="truncate">{info.name}</span>
      {info.phone && (
        <>
          {!spaced && <span className="text-shopbox-border">·</span>}
          <span className="tabular-nums shrink-0">{info.phone}</span>
        </>
      )}
    </div>
  );
}
