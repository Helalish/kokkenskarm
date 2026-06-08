"use client";

import type { PaymentStatus } from "@/types/order";
import { useT } from "@/hooks/use-t";
import { cn } from "@/lib/cn";

interface PaymentBadgeProps {
  status: PaymentStatus;
}

export function PaymentBadge({ status }: PaymentBadgeProps) {
  const t = useT();
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        status === "paid" && "bg-shopbox-accent/20 text-shopbox-accent",
        status === "unpaid" && "bg-shopbox-critical/20 text-shopbox-critical",
        status === "partial" && "bg-shopbox-warning/20 text-shopbox-warning"
      )}
    >
      {status === "paid" && t("payment.paid")}
      {status === "unpaid" && t("payment.unpaid")}
      {status === "partial" && t("payment.partial")}
    </span>
  );
}
