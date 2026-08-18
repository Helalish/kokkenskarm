import type { ShopboxKdsSettings } from "@/types/settings";
import { buildShopboxUrl, shopboxFetch } from "@/api/client";

/** GET /branches/:branchId/kds-settings */
export async function fetchKdsSettings(): Promise<ShopboxKdsSettings> {
  const url = buildShopboxUrl("/kds-settings");
  const response = await shopboxFetch(url);
  const data = await response.json();
  return data.data ?? data;
}

/** POST /branches/:branchId/kds-settings */
export async function updateKdsSettings(settings: ShopboxKdsSettings): Promise<void> {
  const url = buildShopboxUrl("/kds-settings");
  await shopboxFetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
}
