import type { Order } from "@/types/order";
import type { StationConfig } from "@/types/station";

/**
 * Filters orders relevant to a station based on category filters.
 * An order is relevant if ANY of its items match a station category.
 */
export function filterOrdersByStation(
  orders: Order[],
  station: StationConfig | null
): Order[] {
  if (!station || station.categoryFilters.length === 0) return orders;

  return orders.filter((order) =>
    order.items.some((item) =>
      station.categoryFilters.includes(item.category)
    )
  );
}

/**
 * Returns items from an order filtered by station.
 * - showAllItems=true: all items shown, non-matching dimmed
 * - showAllItems=false: only matching items shown, rest hidden
 */
export function getStationItems(
  order: Order,
  station: StationConfig | null
): { item: (typeof order.items)[number]; dimmed: boolean }[] {
  if (!station || station.categoryFilters.length === 0) {
    return order.items.map((item) => ({ item, dimmed: false }));
  }

  if (station.showAllItems) {
    return order.items.map((item) => ({
      item,
      dimmed: !station.categoryFilters.includes(item.category),
    }));
  }

  // Hide non-matching items completely
  return order.items
    .filter((item) => station.categoryFilters.includes(item.category))
    .map((item) => ({ item, dimmed: false }));
}

/**
 * Extracts all unique categories from a list of orders.
 */
export function extractCategories(orders: Order[]): string[] {
  const categories = new Set<string>();
  for (const order of orders) {
    for (const item of order.items) {
      categories.add(item.category);
    }
  }
  return Array.from(categories).sort();
}
