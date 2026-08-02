import type { Order } from "@/types/order";
import type { KdsApiStatus } from "@/types/pipeline";
import { transformShopboxOrders } from "@/services/shopbox-transformer";
import { buildShopboxUrl, shopboxFetch } from "@/api/client";

/** GET /branches/:branchId/kds/orders */
export async function fetchOrders(status?: string): Promise<Order[]> {
  const url = buildShopboxUrl("/kds/orders", status ? { undefined } : undefined);  
  const response = await shopboxFetch(url);
  const data = await response.json();
  return transformShopboxOrders(data);
}

/** PATCH /branches/:branchId/kds/orders/:orderId/status */
export async function updateOrderStatus(
  orderId: string,
  body: { order_type: string; status: KdsApiStatus }
) {
  const url = buildShopboxUrl(`/kds/orders/${orderId}/status`);
  await shopboxFetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

/** PATCH /branches/:branchId/kds/orders/:orderId/products/:productId */
export async function updateProductPrepared(
  orderId: string,
  productId: string,
  prepared: boolean
) {
  const url = buildShopboxUrl(`/kds/orders/${orderId}/products/${productId}`);
  await shopboxFetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prepared }),
  });
}
