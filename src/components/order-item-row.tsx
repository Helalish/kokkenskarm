"use client";

import type { OrderItem } from "@/types/order";
import { cn } from "@/lib/cn";

interface OrderItemRowProps {
  item: OrderItem;
  dimmed?: boolean;
  onToggleDone: () => void;
}

export function OrderItemRow({ item, dimmed, onToggleDone }: OrderItemRowProps) {
  const isRemoved = item.changeStatus === "removed" || item.changeStatus === "refunded";
  const isAdded = item.changeStatus === "added";

  return (
    <div
      className={cn(
        "flex items-start gap-2 py-1 px-1 rounded transition-colors",
        !isRemoved && "cursor-pointer hover:bg-white/5",
        item.isDone && !isRemoved && "opacity-40",
        dimmed && "opacity-20 pointer-events-none",
        isRemoved && "pointer-events-none"
      )}
      onClick={(e) => {
        if (isRemoved) return;
        e.stopPropagation();
        onToggleDone();
      }}
    >
      {/* Checkbox — hidden for removed/refunded items */}
      {!isRemoved ? (
        <div
          className={cn(
            "mt-0.5 h-4 w-4 shrink-0 rounded border-2 flex items-center justify-center transition-colors",
            item.isDone
              ? "border-shopbox-accent bg-shopbox-accent"
              : isAdded
                ? "border-green-500"
                : "border-shopbox-muted"
          )}
        >
          {item.isDone && (
            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      ) : (
        <div className="mt-0.5 h-4 w-4 shrink-0" />
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          {item.quantity > 1 && (
            <span className={cn(
              "font-bold",
              isRemoved ? "text-red-500" : isAdded ? "text-green-500" : "text-shopbox-accent"
            )}>
              {item.quantity}x
            </span>
          )}
          <span className={cn(
            "font-medium",
            isRemoved && "line-through text-red-500 font-bold",
            isAdded && "text-green-500",
            !isRemoved && !isAdded && item.isDone && "line-through"
          )}>
            {item.name}
          </span>
          {isAdded && (
            <span className="rounded bg-green-500/20 px-1 py-0.5 text-[9px] font-bold text-green-500 uppercase tracking-wider">
              NY
            </span>
          )}
          {item.changeStatus === "refunded" && (
            <span className="rounded bg-red-500/20 px-1 py-0.5 text-[9px] font-bold text-red-500 uppercase tracking-wider">
              Refunderet
            </span>
          )}
        </div>
        {item.variants.length > 0 && (
          <p className={cn(
            "text-xs mt-0.5",
            isRemoved ? "text-red-400/60 line-through" : isAdded ? "text-green-400/70" : "text-shopbox-detail"
          )}>
            {item.variants.join(", ")}
          </p>
        )}
        {item.modifications.length > 0 && (
          <p className={cn(
            "text-xs mt-0.5",
            isRemoved ? "text-red-400/60 line-through" : isAdded ? "text-green-400/70" : "text-shopbox-warning"
          )}>
            {item.modifications.join(", ")}
          </p>
        )}
      </div>
    </div>
  );
}
