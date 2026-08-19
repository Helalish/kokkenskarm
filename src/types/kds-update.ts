export type KdsUpdateEventType =
  | "order_added"
  | "order_status_changed"
  | "product_prepared_changed"
  | "payment_status_changed"
  | "settings_updated";

export type KdsUpdateEvent = {
  updated_at: string;
  event: KdsUpdateEventType;
  order_id?: number;
  client_id?: number;
};

/** Coalesced flags after debounce — both can be true. */
export type KdsSyncActions = {
  refetchOrders: boolean;
  refetchSettings: boolean;
};

export const ORDER_REFETCH_EVENTS = new Set<KdsUpdateEventType>([
  "order_added",
  "order_status_changed",
  "product_prepared_changed",
  "payment_status_changed",
]);

/** Customer display only cares about stage membership, not payment or item prepared toggles. */
export const CUSTOMER_DISPLAY_ORDER_EVENTS = new Set<KdsUpdateEventType>([
  "order_added",
  "order_status_changed",
]);

/** Settings page: only react to settings_updated. */
export const SETTINGS_ONLY_ORDER_EVENTS = new Set<KdsUpdateEventType>();

const EVENTS = new Set<string>([
  "order_added",
  "order_status_changed",
  "product_prepared_changed",
  "payment_status_changed",
  "settings_updated",
]);

function asOptionalNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

export function parseKdsUpdateEvent(data: unknown): KdsUpdateEvent | null {
  if (!data || typeof data !== "object") return null;

  const raw = data as Record<string, unknown>;
  if (typeof raw.updated_at !== "string") return null;
  if (typeof raw.event !== "string" || !EVENTS.has(raw.event)) return null;

  const orderId = asOptionalNumber(raw.order_id);
  const clientId = asOptionalNumber(raw.client_id);

  return {
    updated_at: raw.updated_at,
    event: raw.event as KdsUpdateEventType,
    ...(orderId !== undefined ? { order_id: orderId } : {}),
    ...(clientId !== undefined ? { client_id: clientId } : {}),
  };
}
