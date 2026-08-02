import type { Order, OrderItem, OrderSource, PaymentStatus } from "@/types/order";
import { isKdsStageId } from "@/types/pipeline";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function transformShopboxOrders(data: any): Order[] {
  const items = data?.data?.item ?? data?.data ?? [];
  const rawOrders = Array.isArray(items) ? items : [items];
  const orders = rawOrders.map(transformSingleOrder).filter((o): o is Order => o !== null);
  // Guard against duplicate uids from the API (React keys must be unique).
  const seen = new Set<string>();
  return orders.filter((o) => {
    if (seen.has(o.id)) return false;
    seen.add(o.id);
    return true;
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformSingleOrder(raw: any): Order | null {
  if (!raw?.uid) return null;

  const status = raw.kds_status ?? "incoming";
  if (!isKdsStageId(status)) return null; // "done" (or unknown) — skip

  const notes = buildNotes(raw.comment, raw.table_number);

  return {
    id: String(raw.uid),
    orderNumber: Number(raw.session_id ?? 0),
    source: mapSource(raw.source),
    items: transformProducts(raw.products?.item ?? raw.products ?? []),
    currentStageId: status,
    createdAt: unixToIso(raw.created_at),
    paymentStatus: mapPaymentStatus(raw.payment_status),
    customerInfo: buildCustomerInfo(raw.customer_name, raw.customer_phone),
    isPreOrder: false,
    scheduledTime: raw.pickup_time ? unixToIso(raw.pickup_time) : undefined,
    notes: notes || undefined,
    orderType: raw.order_type || undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformProducts(raw: any): OrderItem[] {
  const items = Array.isArray(raw) ? raw : [raw];
  return items
    .filter((p) => p?.uid)
    .map((p) => ({
      id: String(p.uid),
      name: nonEmpty(p.kitchen_name) ?? nonEmpty(p.name) ?? "Unknown",
      quantity: Number(p.quantity ?? 1),
      variants: nonEmpty(p.product_variance) ? [p.product_variance] : [],
      modifiers: transformModifiers(p.modifiers),
      category: "",
      isDone: p.prepared === true || p.prepared === "true",
    }));
}

/** Shopbox product modifiers: `{ uid, name, opt_out }` (legacy string arrays still accepted). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformModifiers(raw: any): OrderItem["modifiers"] {
  if (!raw) return [];
  const list = Array.isArray(raw) ? raw : [raw];
  return list
    .map((m, index) => {
      if (typeof m === "string") {
        const name = nonEmpty(m);
        if (!name) return null;
        return { id: `legacy-${index}-${name}`, name, optOut: false };
      }
      if (!m || typeof m !== "object") return null;
      const name = nonEmpty(m.name) ?? nonEmpty(m.kitchen_name);
      if (!name) return null;
      return {
        id: String(m.uid ?? `mod-${index}-${name}`),
        name,
        optOut: m.opt_out === true || m.opt_out === "true" || m.optOut === true,
      };
    })
    .filter((m): m is OrderItem["modifiers"][number] => m !== null);
}

function mapSource(source: string | undefined): OrderSource {
  const s = (source ?? "").toLowerCase();
  if (s.includes("weorder") || s.includes("web")) return "weorder";
  if (s.includes("kiosk")) return "kiosk";
  if (s.includes("qr")) return "qr";
  return "pos";
}

function mapPaymentStatus(status: string | undefined): PaymentStatus {
  const s = (status ?? "").toLowerCase();
  if (s === "paid") return "paid";
  if (s.includes("partial")) return "partial";
  return "unpaid";
}

function buildCustomerInfo(name: string | undefined, phone: string | undefined) {
  const cleanName = nonEmpty(name);
  const cleanPhone = nonEmpty(phone);
  if (!cleanName && !cleanPhone) return undefined;
  return { name: cleanName ?? "", phone: cleanPhone };
}

function buildNotes(comment: string | undefined, tableNumber: string | number | undefined): string {
  const parts: string[] = [];
  const c = nonEmpty(comment);
  if (c) parts.push(c);
  const t = nonEmpty(String(tableNumber ?? ""));
  if (t && t !== "0") parts.push(`Table ${t}`);
  return parts.join(" | ");
}

function unixToIso(unix: number | string | undefined): string {
  if (!unix) return new Date().toISOString();
  const ms = Number(unix) * 1000;
  return new Date(ms).toISOString();
}

function nonEmpty(val: string | undefined | null): string | undefined {
  if (!val || val.trim() === "") return undefined;
  return val.trim();
}
