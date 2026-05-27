"use client";

import type { Order } from "@/types/order";
import type { StationConfig } from "@/types/station";
import { getStationItems } from "@/lib/category-filter";

interface SummaryItem {
  name: string;
  variant: string;
  category: string;
  totalQty: number;
  doneQty: number;
}

function aggregateItems(orders: Order[], activeStation: StationConfig | null): Map<string, SummaryItem> {
  const map = new Map<string, SummaryItem>();

  for (const order of orders) {
    const stationItems = activeStation
      ? getStationItems(order, activeStation).map((si) => si.item)
      : order.items;

    for (const item of stationItems) {
      const variant = item.variants.length > 0 ? item.variants[0] : "";
      const key = `${item.name}||${variant}`;

      const existing = map.get(key);
      if (existing) {
        existing.totalQty += item.quantity;
        if (item.isDone) existing.doneQty += item.quantity;
      } else {
        map.set(key, {
          name: item.name,
          variant,
          category: item.category,
          totalQty: item.quantity,
          doneQty: item.isDone ? item.quantity : 0,
        });
      }
    }
  }

  return map;
}

function groupByCategory(items: SummaryItem[]): Map<string, SummaryItem[]> {
  const groups = new Map<string, SummaryItem[]>();
  for (const item of items) {
    const list = groups.get(item.category) || [];
    list.push(item);
    groups.set(item.category, list);
  }
  return groups;
}

interface SummaryViewProps {
  orders: Order[];
  activeStation: StationConfig | null;
}

export function SummaryView({ orders, activeStation }: SummaryViewProps) {
  const aggregated = aggregateItems(orders, activeStation);
  const allItems = Array.from(aggregated.values()).sort((a, b) => b.totalQty - a.totalQty);
  const categories = groupByCategory(allItems);

  const totalItems = allItems.reduce((sum, i) => sum + i.totalQty, 0);
  const totalDone = allItems.reduce((sum, i) => sum + i.doneQty, 0);

  if (orders.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-shopbox-muted">
        <p className="text-lg">Ingen aktive ordrer</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-4">
      {/* Top summary */}
      <div className="flex items-center gap-6 mb-6 px-2">
        <div className="flex items-center gap-2">
          <span className="text-3xl font-bold text-shopbox-text">{orders.length}</span>
          <span className="text-sm text-shopbox-text-secondary">ordrer</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-3xl font-bold text-shopbox-text">{totalItems}</span>
          <span className="text-sm text-shopbox-text-secondary">varer i alt</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-3xl font-bold text-shopbox-accent">{totalDone}</span>
          <span className="text-sm text-shopbox-text-secondary">færdige</span>
        </div>
      </div>

      {/* Category cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from(categories.entries()).map(([category, items]) => {
          const catTotal = items.reduce((s, i) => s + i.totalQty, 0);
          const catDone = items.reduce((s, i) => s + i.doneQty, 0);

          return (
            <div
              key={category}
              className="rounded-2xl bg-shopbox-card border border-shopbox-border p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-shopbox-text uppercase tracking-wide">
                  {category}
                </h3>
                <span className="text-xs font-medium text-shopbox-muted">
                  {catDone}/{catTotal}
                </span>
              </div>

              <div className="space-y-2">
                {items.map((item) => {
                  const remaining = item.totalQty - item.doneQty;
                  const allDone = remaining === 0;

                  return (
                    <div
                      key={`${item.name}-${item.variant}`}
                      className={`flex items-center justify-between py-1.5 px-2 rounded-lg ${
                        allDone ? "opacity-40" : ""
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <span className={`text-sm font-medium ${allDone ? "line-through text-shopbox-muted" : "text-shopbox-text"}`}>
                          {item.name}
                        </span>
                        {item.variant && (
                          <span className="text-xs text-shopbox-text-secondary ml-1.5">
                            ({item.variant})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-3">
                        {!allDone && (
                          <span className="text-lg font-bold text-shopbox-accent">
                            {remaining}
                          </span>
                        )}
                        {item.doneQty > 0 && (
                          <span className="text-xs text-shopbox-muted">
                            {allDone ? "Klar" : `${item.doneQty} klar`}
                          </span>
                        )}
                        {allDone && (
                          <span className="text-sm text-shopbox-accent">✓</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
