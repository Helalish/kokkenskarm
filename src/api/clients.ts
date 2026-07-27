import type { PaginatedClients, ShopboxClient, ShopboxClientsResponse } from "@/types/client";
import { buildShopboxRootUrl, shopboxFetch } from "@/api/client";

/** GET /clients/myclients */
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
