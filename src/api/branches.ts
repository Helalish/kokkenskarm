import type { ShopboxBranch, ShopboxBranchesResponse } from "@/types/branch";
import { buildShopboxRootUrl, shopboxFetch } from "@/api/client";

/** GET /branches */
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
