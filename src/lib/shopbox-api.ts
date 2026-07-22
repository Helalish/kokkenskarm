import type { Order } from "@/types/order";
import type { KdsApiStatus } from "@/types/pipeline";
import type { ShopboxKdsSettings } from "@/types/settings";
import type { ShopboxSmsHistoryEntry } from "@/types/sms";
import { transformShopboxOrders } from "@/services/shopbox-transformer";

type ShopboxConfig = {
  baseUrl: string;
  branchId: string;
  accessToken: string;
  clientId: string;
};

// NOTE: This is intentionally client-usable because the project goal is to call
// the backend directly (not proxy via Next.js route handlers). Credentials are
// currently hardcoded for development.
const SHOPBOX_CONFIG: ShopboxConfig = {
  baseUrl: process.env.NEXT_PUBLIC_SHOPBOX_BASE_URL ?? "https://api-dev.shopbox.com/api/v3",
  branchId: process.env.NEXT_PUBLIC_SHOPBOX_BRANCH_ID ?? "6095",
  accessToken: process.env.NEXT_PUBLIC_SHOPBOX_ACCESS_TOKEN ?? "0011a1d2f5d8894d82eaa787912d19d3",
  clientId: process.env.NEXT_PUBLIC_SHOPBOX_CLIENT_ID ?? "5661",
};

function buildShopboxUrl(pathname: string, query?: Record<string, string | undefined>) {
  const { baseUrl, branchId, accessToken, clientId } = SHOPBOX_CONFIG;
  const url = new URL(`${baseUrl}/branches/${branchId}${pathname}`);
  url.searchParams.set("accessToken", accessToken);
  url.searchParams.set("client", clientId);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && String(v) !== "") url.searchParams.set(k, String(v));
    }
  }
  return url;
}

async function shopboxFetch(url: URL, init?: RequestInit) {
  const response = await fetch(url.toString(), {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    const msg = errorText ? `${response.status} ${errorText}` : `${response.status}`;
    throw new Error(msg);
  }

  return response;
}

export async function fetchOrders(status?: string): Promise<Order[]> {
  const url = buildShopboxUrl("/kds/orders", status ? { status } : undefined);
  const response = await shopboxFetch(url);
  const data = await response.json();
  return transformShopboxOrders(data);
}

export async function updateOrderStatus(orderId: string, body: { order_type: string; status: KdsApiStatus }) {
  const url = buildShopboxUrl(`/kds/orders/${orderId}/status`);
  await shopboxFetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function updateProductPrepared(orderId: string, productId: string, prepared: boolean) {
  const url = buildShopboxUrl(`/kds/orders/${orderId}/products/${productId}`);
  await shopboxFetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prepared }),
  });
}

export async function fetchKdsSettings(): Promise<ShopboxKdsSettings> {
  const url = buildShopboxUrl("/kds-settings");
  const response = await shopboxFetch(url);
  const data = await response.json();
  return data.data ?? data;
}

export async function updateKdsSettings(settings: ShopboxKdsSettings): Promise<void> {
  const url = buildShopboxUrl("/kds-settings");
  await shopboxFetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
}

export async function fetchSmsHistory(limit = 10): Promise<ShopboxSmsHistoryEntry[]> {
  const url = buildShopboxUrl("/kds/sms-history", { limit: String(limit) });
  const response = await shopboxFetch(url);
  const data = await response.json();
  return (data?.data ?? data) as ShopboxSmsHistoryEntry[];
}

