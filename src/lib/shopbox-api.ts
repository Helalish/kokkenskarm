import type { Order } from "@/types/order";
import type { KdsApiStatus } from "@/types/pipeline";
import type { ShopboxKdsSettings } from "@/types/settings";
import type { ShopboxSmsHistoryEntry } from "@/types/sms";
import type { ShopboxLoginResponse, ShopboxErrorResponse } from "@/types/auth";
import type { PaginatedClients, ShopboxClient, ShopboxClientsResponse } from "@/types/client";
import type { ShopboxBranch, ShopboxBranchesResponse } from "@/types/branch";
import { transformShopboxOrders } from "@/services/shopbox-transformer";
import { useToastStore } from "@/stores/toast-store";
import { useAuthStore } from "@/stores/auth-store";
import { useLanguageStore } from "@/stores/language-store";
import { clearClientSessionAndRedirect } from "@/lib/clear-client-session";

function getConfig() {
  return {
    baseUrl: (process.env.NEXT_PUBLIC_BACKEND_URL ?? "").replace(/\/+$/, ""),
  };
}

function getLang() {
  return useLanguageStore.getState().language;
}

let isRedirectingForAuth = false;
let lastForbiddenToastAt = 0;

function appendQuery(url: URL, query?: Record<string, string | number | undefined>) {
  if (!query) return;

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && String(value) !== "") {
      url.searchParams.set(key, String(value));
    }
  }
}

function buildShopboxRootUrl(
  pathname: string,
  query?: Record<string, string | number | undefined>
) {
  const { baseUrl } = getConfig();
  const auth = useAuthStore.getState();
  const url = new URL(`${baseUrl}${pathname}`);

  if (auth.accessToken) url.searchParams.set("accessToken", auth.accessToken);
  url.searchParams.set("lang", getLang());
  appendQuery(url, query);

  return url;
}

function buildShopboxUrl(pathname: string, query?: Record<string, string | undefined>) {
  const auth = useAuthStore.getState();

  if (!auth.selectedClientId || !auth.selectedBranchId) {
    throw new Error("Select a client and restaurant before making this request.");
  }

  return buildShopboxRootUrl(`/branches/${auth.selectedBranchId}${pathname}`, {
    client: auth.selectedClientId,
    ...query,
  });
}

function getErrorMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== "object") return fallback;

  const response = data as ShopboxErrorResponse;

  if (response.error?.message) {
    return response.error.message;
  }
  if (response.message) {
    return response.message;
  }
  if (typeof response.error === "string") {
    return response.error;
  }

  return fallback;
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
    const data = await response.json().catch(() => null);
    const fallback =
      response.status === 401
        ? "Your session is no longer valid. Please log in again."
        : response.status === 403
          ? "You do not have access to this action."
          : `Shopbox request failed (${response.status}).`;
    const msg = getErrorMessage(data, fallback);

    if (response.status === 401 && !isRedirectingForAuth) {
      isRedirectingForAuth = true;
      clearClientSessionAndRedirect();
    } else if (
      response.status === 403 &&
      Date.now() - lastForbiddenToastAt > 3000
    ) {
      lastForbiddenToastAt = Date.now();
      useToastStore.getState().addToast({
        type: "info",
        message: "Access denied",
        detail: msg,
        duration: 5000,
      });
    }

    throw new Error(msg);
  }

  return response;
}

export async function authenticateCredentials(
  username: string,
  password: string,
  rememberMe: boolean | null = null
): Promise<ShopboxLoginResponse> {
  const { baseUrl } = getConfig();
  const url = new URL(`${baseUrl}/authenticate/credentials`);
  url.searchParams.set("lang", getLang());

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
      remember_me: rememberMe,
    }),
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = getErrorMessage(data, "Unable to sign in with those credentials.");
    throw new Error(message);
  }

  const login = data as Partial<ShopboxLoginResponse>;
  if (!login.accessToken || !login.account?.uid) {
    throw new Error("Shopbox returned an invalid login response.");
  }

  return login as ShopboxLoginResponse;
}

export async function fetchMyClients({
  page,
  perPage,
  keyword,
}: {
  page: number;
  perPage: number;
  keyword?: string;
}): Promise<PaginatedClients> {
  const url = buildShopboxRootUrl("/clients/myclients", {
    page,
    "per-page": perPage,
    keyword,
  });
  const response = await shopboxFetch(url);
  const payload = (await response.json()) as ShopboxClientsResponse;
  const rawItems = Array.isArray(payload.data) ? payload.data : [];

  const items = rawItems.flatMap<ShopboxClient>((item) => {
    const rawId = item.client0?.uid ?? item.client;
    if (rawId === null || rawId === undefined) return [];

    const id = String(rawId);
    return [{ id, name: item.client0?.name?.trim() || `Client ${id}` }];
  });

  const pagination = payload.meta?.pagination;
  const currentPage = pagination?.current_page ?? page;
  const totalPages = pagination?.total_pages;
  const hasMore =
    totalPages !== undefined
      ? currentPage < totalPages
      : pagination?.links?.next
        ? true
        : rawItems.length >= perPage;

  return {
    items,
    hasMore,
    total: pagination?.total ?? items.length,
  };
}

export async function fetchClientBranches(clientId: string): Promise<ShopboxBranch[]> {
  const url = buildShopboxRootUrl("/branches", {
    client: clientId,
    page: 1,
    "per-page": 200,
    for_inventory: 0,
  });
  const response = await shopboxFetch(url);
  const payload = (await response.json()) as ShopboxBranchesResponse;
  const rawItems = Array.isArray(payload.data) ? payload.data : [];

  return rawItems.flatMap<ShopboxBranch>((item) => {
    if (item.uid === null || item.uid === undefined) return [];

    const id = String(item.uid);
    const city = item.address0?.city_name?.trim();
    return [
      {
        id,
        name: item.name?.trim() || `Restaurant ${id}`,
        ...(city ? { city } : {}),
        isClosed: Boolean(item.is_closed),
      },
    ];
  });
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
    method: "POST",
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
