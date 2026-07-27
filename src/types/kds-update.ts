export type KdsUpdateEvent = {
  updated_at: string;
  event:
    | "order_added"
    | "order_status_changed"
    | "product_prepared_changed"
    | "settings_updated";
  order_id?: number;
  client_id?: number;
};

const EVENTS = new Set([
  "order_added",
  "order_status_changed",
  "product_prepared_changed",
  "settings_updated",
]);

export function parseKdsUpdateEvent(data: unknown): KdsUpdateEvent | null {
  if (!data || typeof data !== "object") return null;

  const raw = data as Record<string, unknown>;
  if (typeof raw.updated_at !== "string") return null;
  if (typeof raw.event !== "string" || !EVENTS.has(raw.event)) return null;

  return {
    updated_at: raw.updated_at,
    event: raw.event as KdsUpdateEvent["event"],
    ...(typeof raw.order_id === "number" ? { order_id: raw.order_id } : {}),
    ...(typeof raw.client_id === "number" ? { client_id: raw.client_id } : {}),
  };
}
