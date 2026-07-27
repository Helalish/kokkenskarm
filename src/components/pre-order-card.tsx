"use client";

import type { Order } from "@/types/order";
import { SourceBadge } from "./source-badge";
import { PreOrderCountdown } from "./pre-order-countdown";

interface PreOrderCardProps {
  order: Order;
  onPromote: () => void;
  onClick: () => void;
}

export function PreOrderCard({ order, onPromote, onClick }: PreOrderCardProps) {
  const doneCount = order.items.filter((i) => i.isDone).length;

  return (
    <div
      className="no-select order-card-enter flex flex-col rounded-2xl bg-shopbox-card border border-shopbox-border hover:border-shopbox-accent/50 transition-all cursor-pointer"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-shopbox-border/50">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold">#{order.orderNumber}</span>
          <SourceBadge source={order.source} />
        </div>
        {order.scheduledTime && (
          <PreOrderCountdown scheduledTime={order.scheduledTime} />
        )}
      </div>

      {/* Customer */}
      {order.customerInfo && (
        <div className="px-3 py-1.5 bg-shopbox-surface/50">
          <p className="text-sm font-medium">{order.customerInfo.name}</p>
          {order.customerInfo.phone && (
            <p className="text-xs text-shopbox-text-secondary">{order.customerInfo.phone}</p>
          )}
        </div>
      )}

      {/* Items summary */}
      <div className="flex-1 px-3 py-2 text-sm">
        {order.items.slice(0, 3).map((item) => (
          <div key={item.id} className="flex items-center gap-1.5 py-0.5">
            {item.quantity > 1 && (
              <span className="font-bold text-shopbox-accent text-xs">{item.quantity}x</span>
            )}
            <span className="text-shopbox-text-secondary truncate">{item.name}</span>
          </div>
        ))}
        {order.items.length > 3 && (
          <p className="text-xs text-shopbox-muted mt-1">
            +{order.items.length - 3} flere varer
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-shopbox-border/50">
        <span className="text-xs text-shopbox-text-secondary">
          {doneCount}/{order.items.length} varer
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPromote();
          }}
          className="rounded-lg bg-shopbox-accent px-3 py-1 text-xs font-medium text-white hover:bg-shopbox-accent/80 transition-colors"
        >
          Start nu →
        </button>
      </div>
    </div>
  );
}
