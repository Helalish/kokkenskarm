"use client";

import type { OrderItem, OrderItemExtra } from "@/types/order";
import { useT } from "@/hooks/use-t";
import { cn } from "@/lib/cn";

interface OrderItemExtrasProps {
  item: OrderItem;
  /** Tighter text for compact card rows */
  compact?: boolean;
  isRemoved?: boolean;
  isAdded?: boolean;
}

function extraLabel(extra: OrderItemExtra): string {
  return extra.quantity > 1 ? `${extra.quantity}x ${extra.name}` : extra.name;
}

/**
 * Order-line extras:
 * - comment → directly under product name, "Note:" prefix, one step quieter than the name
 * - variants (product_variance) → grey
 * - modifiers + add_ons → orange
 * - opt_outs → red + strikethrough
 */
export function OrderItemExtras({
  item,
  compact = false,
  isRemoved = false,
  isAdded = false,
}: OrderItemExtrasProps) {
  const t = useT();
  const orangeExtras = [...item.modifiers, ...item.addOns];
  const comment = item.comment?.trim() ?? "";
  const hasExtras =
    item.variants.length > 0 ||
    orangeExtras.length > 0 ||
    item.optOuts.length > 0 ||
    comment.length > 0;

  if (!hasExtras) return null;

  const muted = isRemoved
    ? "text-red-400/60 line-through"
    : isAdded
      ? "text-green-400/70"
      : null;

  return (
    <div className={cn("mt-0.5 space-y-0.5", compact ? "text-xs" : "text-sm")}>
      {comment && (
        <p className={cn("font-normal", muted ?? "text-shopbox-detail")}>
          {t("card.productNote", { note: comment })}
        </p>
      )}
      {item.variants.map((variant) => (
        <p key={variant} className={cn("font-medium", muted ?? "text-shopbox-detail")}>
          {variant}
        </p>
      ))}
      {orangeExtras.map((extra, index) => (
        <p
          key={`${extra.id}-${index}`}
          className={cn("font-medium", muted ?? "text-shopbox-warning")}
        >
          {extraLabel(extra)}
        </p>
      ))}
      {item.optOuts.map((optOut) => (
        <p
          key={optOut.id}
          className={cn("font-medium", muted ?? "text-shopbox-critical line-through")}
        >
          {extraLabel(optOut)}
        </p>
      ))}
    </div>
  );
}
