"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Pre-orders are disabled for v1. Direct visits redirect to KDS.
 *
 * Previous implementation kept below for when we re-enable it.
 */
export default function PreOrdersPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/kds");
  }, [router]);
  return null;
}

/*
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePreOrdersStore } from "@/stores/pre-orders-store";
import { useOrdersStore } from "@/stores/orders-store";
import { PreOrderCard } from "@/components/pre-order-card";
import { OrderCardExpanded } from "@/components/order-card-expanded";
import { SessionGuard } from "@/components/session-guard";
import type { Order } from "@/types/order";
import { useT } from "@/hooks/use-t";

export default function PreOrdersPage() {
  return (
    <SessionGuard>
      <PreOrdersPageContent />
    </SessionGuard>
  );
}

function PreOrdersPageContent() {
  const t = useT();
  const { preOrders, removePreOrder, promoteMinutesBefore, setPromoteMinutesBefore } =
    usePreOrdersStore();
  const { addOrder } = useOrdersStore();
  const [expandedOrder, setExpandedOrder] = useState<Order | null>(null);

  // Auto-promote pre-orders that are within the threshold
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const threshold = promoteMinutesBefore * 60 * 1000;

      preOrders.forEach((order) => {
        if (
          order.scheduledTime &&
          new Date(order.scheduledTime).getTime() - now <= threshold
        ) {
          // Move to active orders
          addOrder({ ...order, isPreOrder: false });
          removePreOrder(order.id);
        }
      });
    }, 10_000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [preOrders, promoteMinutesBefore, addOrder, removePreOrder]);

  const handlePromote = (order: Order) => {
    addOrder({ ...order, isPreOrder: false });
    removePreOrder(order.id);
  };

  // Sort by scheduled time (soonest first)
  const sortedPreOrders = [...preOrders].sort((a, b) => {
    const timeA = a.scheduledTime ? new Date(a.scheduledTime).getTime() : Infinity;
    const timeB = b.scheduledTime ? new Date(b.scheduledTime).getTime() : Infinity;
    return timeA - timeB;
  });

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between px-4 py-2 bg-shopbox-primary border-b border-shopbox-border">
        <div className="flex items-center gap-3">
          <Link
            href="/kds"
            className="text-shopbox-text-secondary hover:text-shopbox-text transition-colors"
          >
            {t("preOrders.back")}
          </Link>
          <h1 className="text-lg font-bold text-shopbox-accent">{t("preOrders.title")}</h1>
          <span className="text-sm text-shopbox-muted">({preOrders.length})</span>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-shopbox-text-secondary">
            {t("preOrders.autoStart")}
            <select
              value={promoteMinutesBefore}
              onChange={(e) => setPromoteMinutesBefore(Number(e.target.value))}
              className="rounded-lg bg-shopbox-card border border-shopbox-border px-2 py-1 text-sm text-shopbox-text outline-none"
            >
              <option value={5}>{t("preOrders.minutesBefore", { minutes: 5 })}</option>
              <option value={10}>{t("preOrders.minutesBefore", { minutes: 10 })}</option>
              <option value={15}>{t("preOrders.minutesBefore", { minutes: 15 })}</option>
              <option value={20}>{t("preOrders.minutesBefore", { minutes: 20 })}</option>
              <option value={30}>{t("preOrders.minutesBefore", { minutes: 30 })}</option>
            </select>
          </label>
        </div>
      </header>

      {sortedPreOrders.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-shopbox-muted">
          <div className="text-center">
            <p className="text-2xl mb-2">{t("preOrders.empty.title")}</p>
            <p className="text-sm">{t("preOrders.empty.subtitle")}</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 p-4 overflow-y-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 content-start">
          {sortedPreOrders.map((order) => (
            <PreOrderCard
              key={order.id}
              order={order}
              onPromote={() => handlePromote(order)}
              onClick={() => setExpandedOrder(order)}
            />
          ))}
        </div>
      )}

      {expandedOrder && (
        <OrderCardExpanded
          order={expandedOrder}
          onClose={() => setExpandedOrder(null)}
        />
      )}
    </div>
  );
}
*/
