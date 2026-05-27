import type { Order, OrderItem } from "@/types/order";

/**
 * Transform Shopbox POS order data into the app's Order format.
 *
 * TODO: Rami — Update this transformer to match the actual Shopbox API response schema.
 * The current implementation is a placeholder based on expected fields.
 * Replace the field mappings below with the real Shopbox API field names.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function transformShopboxOrders(shopboxData: any): Order[] {
  // TODO: Adjust based on actual Shopbox API response structure
  // Expected: shopboxData.orders is an array, or shopboxData itself is an array
  const rawOrders = Array.isArray(shopboxData)
    ? shopboxData
    : shopboxData?.orders ?? [];

  return rawOrders.map(transformSingleOrder);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformSingleOrder(raw: any): Order {
  return {
    id: String(raw.id ?? raw.order_id ?? crypto.randomUUID()),
    orderNumber: Number(raw.order_number ?? raw.number ?? 0),
    source: mapSource(raw.source ?? raw.channel ?? "pos"),
    items: transformItems(raw.items ?? raw.lines ?? raw.order_lines ?? []),
    currentStageId: "", // Will be set to first pipeline stage by the polling hook
    createdAt: raw.created_at ?? raw.createdAt ?? new Date().toISOString(),
    completedAt: raw.completed_at ?? raw.completedAt ?? undefined,
    paymentStatus: mapPaymentStatus(raw.payment_status ?? raw.paymentStatus ?? "paid"),
    customerInfo: raw.customer
      ? {
          name: raw.customer.name ?? raw.customer.full_name ?? "",
          phone: raw.customer.phone ?? raw.customer.mobile ?? undefined,
          email: raw.customer.email ?? undefined,
        }
      : undefined,
    isPreOrder: Boolean(raw.is_pre_order ?? raw.isPreOrder ?? false),
    scheduledTime: raw.scheduled_time ?? raw.scheduledTime ?? undefined,
    notes: raw.notes ?? raw.comment ?? undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformItems(rawItems: any[]): OrderItem[] {
  return rawItems.map((item) => ({
    id: String(item.id ?? item.line_id ?? crypto.randomUUID()),
    name: item.name ?? item.product_name ?? "Ukendt vare",
    quantity: Number(item.quantity ?? item.qty ?? 1),
    variants: Array.isArray(item.variants)
      ? item.variants
      : item.variant
        ? [item.variant]
        : [],
    modifications: Array.isArray(item.modifications)
      ? item.modifications
      : item.modification
        ? [item.modification]
        : [],
    ingredients: [],
    category: item.category ?? item.product_category ?? "Andet",
    isDone: false,
  }));
}

function mapSource(source: string): "pos" | "weorder" | "kiosk" | "qr" {
  const s = source.toLowerCase();
  if (s.includes("weorder") || s.includes("web")) return "weorder";
  if (s.includes("kiosk")) return "kiosk";
  if (s.includes("qr")) return "qr";
  return "pos";
}

function mapPaymentStatus(status: string): "paid" | "unpaid" | "partial" {
  const s = status.toLowerCase();
  if (s.includes("partial")) return "partial";
  if (s.includes("unpaid") || s.includes("pending")) return "unpaid";
  return "paid";
}
