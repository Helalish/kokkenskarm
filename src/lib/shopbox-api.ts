import type { Order } from "@/types/order";
import type { KdsApiStatus } from "@/types/pipeline";
import type { ShopboxKdsSettings } from "@/types/settings";
import type { ShopboxSmsHistoryEntry } from "@/types/sms";
import type { ShopboxLoginResponse, ShopboxErrorResponse } from "@/types/auth";
import { transformShopboxOrders } from "@/services/shopbox-transformer";
import { useToastStore } from "@/stores/toast-store";
import { useAuthStore } from "@/stores/auth-store";
import { useLanguageStore } from "@/stores/language-store";
import { clearClientSessionAndRedirect } from "@/lib/clear-client-session";

const DEV_BASE_URL = "https://api-dev.shopbox.com/api/v3";
const DEV_CLIENT_ID = "5661";
const DEV_BRANCH_ID = "6095";

function getConfig() {
  return {
    baseUrl: (process.env.NEXT_PUBLIC_SHOPBOX_BASE_URL || DEV_BASE_URL).replace(/\/+$/, ""),
    clientId: process.env.NEXT_PUBLIC_SHOPBOX_CLIENT_ID || DEV_CLIENT_ID,
    branchId: process.env.NEXT_PUBLIC_SHOPBOX_BRANCH_ID || DEV_BRANCH_ID,
  };
}

function getLang() {
  return useLanguageStore.getState().language;
}

let isRedirectingForAuth = false;
let lastForbiddenToastAt = 0;

function buildShopboxUrl(pathname: string, query?: Record<string, string | undefined>) {
  const { baseUrl, clientId, branchId } = getConfig();
  const auth = useAuthStore.getState();

  const effectiveBranchId = auth.selectedBranchId || branchId;
  const effectiveClientId = auth.selectedClientId || clientId;

  const url = new URL(`${baseUrl}/branches/${effectiveBranchId}${pathname}`);

  if (auth.accessToken) {
    url.searchParams.set("accessToken", auth.accessToken);
  }
  url.searchParams.set("client", effectiveClientId);
  url.searchParams.set("lang", getLang());

  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && String(v) !== "") {
        url.searchParams.set(k, String(v));
      }
    }
  }
  return url;
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
