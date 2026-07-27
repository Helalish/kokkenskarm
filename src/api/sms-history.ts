import type { ShopboxSmsHistoryEntry } from "@/types/sms";
import { buildShopboxUrl, shopboxFetch } from "@/api/client";

/** GET /branches/:branchId/kds/sms-history */
export async function fetchSmsHistory(limit = 10): Promise<ShopboxSmsHistoryEntry[]> {
  const url = buildShopboxUrl("/kds/sms-history", { limit: String(limit) });
  const response = await shopboxFetch(url);
  const data = await response.json();
  return (data?.data ?? data) as ShopboxSmsHistoryEntry[];
}
