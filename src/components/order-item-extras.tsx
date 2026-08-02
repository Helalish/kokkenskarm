"use client";

import type { OrderItem } from "@/types/order";
import { cn } from "@/lib/cn";

interface OrderItemExtrasProps {
  item: OrderItem;
  /** Tighter text for compact card rows */
  compact?: boolean;
  isRemoved?: boolean;
  isAdded?: boolean;
}

/** Variants (grey), add-on modifiers (orange), opt-outs (red + strikethrough). */
export function OrderItemExtras({
  item,
  compact = false,
  isRemoved = false,
  isAdded = false,
}: OrderItemExtrasProps) {
  const textSize = compact ? "text-xs" : "text-sm";

  if (item.variants.length === 0 && item.modifiers.length === 0) return null;

  return (
    <div className={cn("mt-0.5 space-y-0.5", textSize)}>
      {item.variants.map((variant) => (
        <p
          key={variant}
          className={cn(
            "font-medium",
            isRemoved
              ? "text-red-400/60 line-through"
              : isAdded
                ? "text-green-400/70"
                : "text-shopbox-detail"
          )}
        >
          {variant}
        </p>
      ))}
      {item.modifiers.map((mod) => (
        <p
          key={mod.id}
          className={cn(
            "font-medium",
            isRemoved
              ? "text-red-400/60 line-through"
              : isAdded
                ? "text-green-400/70"
                : mod.optOut
                  ? "text-shopbox-critical line-through"
                  : "text-shopbox-warning"
          )}
        >
          {mod.name}
        </p>
      ))}
    </div>
  );
}
