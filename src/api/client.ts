/**
 * Browser-direct Shopbox HTTP client.
 * Requests go from the browser to NEXT_PUBLIC_BACKEND_URL — no Next.js
 * API route or proxy sits in between.
 */
import type { ShopboxErrorResponse } from "@/types/auth";
import { useToastStore } from "@/stores/toast-store";
import { useAuthStore } from "@/stores/auth-store";
import { useLanguageStore } from "@/stores/language-store";
import { clearClientSessionAndRedirect } from "@/lib/clear-client-session";

export function getConfig() {
  return {
    baseUrl: (process.env.NEXT_PUBLIC_BACKEND_URL ?? "").replace(/\/+$/, ""),
  };
}

export function getLang() {
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

export function buildShopboxRootUrl(
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

export function buildShopboxUrl(pathname: string, query?: Record<string, string | undefined>) {
  const auth = useAuthStore.getState();

  if (!auth.selectedClientId || !auth.selectedBranchId) {
    throw new Error("Select a client and restaurant before making this request.");
  }

  return buildShopboxRootUrl(`/branches/${auth.selectedBranchId}${pathname}`, {
    client: auth.selectedClientId,
    ...query,
  });
}

export function getErrorMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== "object") return fallback;

  const response = data as ShopboxErrorResponse;
  const message =
    (typeof response.error === "object" && response.error?.message) ||
    response.message ||
    (typeof response.error === "string" && response.error);

  if (message) return message;

  return fallback;
}

export async function shopboxFetch(url: URL, init?: RequestInit) {
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
