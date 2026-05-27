"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePreOrdersStore } from "@/stores/pre-orders-store";
import { useOrdersStore } from "@/stores/orders-store";
import { usePipelineStore } from "@/stores/pipeline-store";
import { generateInitialPreOrders } from "@/services/mock-data-service";
import { useMvpStore } from "@/stores/mvp-store";
import { PreOrderCard } from "@/components/pre-order-card";
import { OrderCardExpanded } from "@/components/order-card-expanded";
import type { Order } from "@/types/order";

export default function PreOrdersPage() {
  const { preOrders, setPreOrders, removePreOrder, promoteMinutesBefore, setPromoteMinutesBefore } =
    usePreOrdersStore();
  const { addOrder } = useOrdersStore();
  const { getFirstStageId, stages } = usePipelineStore();
  const { isMvpMode } = useMvpStore();
  const [initialized, setInitialized] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<Order | null>(null);

  // Load initial mock pre-orders
  useEffect(() => {
    if (initialized || stages.length === 0) return;
    const firstStageId = getFirstStageId();
    if (!firstStageId) return;

    if (preOrders.length === 0) {
      setPreOrders(generateInitialPreOrders(firstStageId, 4));
    }
    setInitialized(true);
  }, [stages.length, initialized, preOrders.length, getFirstStageId, setPreOrders]);

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
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 bg-shopbox-primary border-b border-shopbox-border">
        <div className="flex items-center gap-3">
          <Link
            href="/kds"
            className="text-shopbox-text-secondary hover:text-shopbox-text transition-colors"
          >
            ← KDS
          </Link>
          <h1 className="text-lg font-bold text-shopbox-accent">Forudbestillinger</h1>
          <span className="text-sm text-shopbox-muted">({preOrders.length})</span>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-shopbox-text-secondary">
            Auto-start
            <select
              value={promoteMinutesBefore}
              onChange={(e) => setPromoteMinutesBefore(Number(e.target.value))}
              className="rounded-lg bg-shopbox-card border border-shopbox-border px-2 py-1 text-sm text-shopbox-text outline-none"
            >
              <option value={5}>5 min før</option>
              <option value={10}>10 min før</option>
              <option value={15}>15 min før</option>
              <option value={20}>20 min før</option>
              <option value={30}>30 min før</option>
            </select>
          </label>
        </div>
      </header>

      {/* Grid */}
      {sortedPreOrders.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-shopbox-muted">
          <div className="text-center">
            <p className="text-2xl mb-2">Ingen forudbestillinger</p>
            <p className="text-sm">Forudbestillinger vises automatisk her</p>
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

      {/* Expanded modal */}
      {expandedOrder && (
        <OrderCardExpanded
          order={expandedOrder}
          onClose={() => setExpandedOrder(null)}
        />
      )}
    </div>
  );
}
