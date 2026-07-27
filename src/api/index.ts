/**
 * Browser-direct Shopbox API — calls go straight from the client to the
 * backend. There is no Next.js route handler or proxy in between.
 */
export { authenticateCredentials } from "@/api/authenticate";
export { fetchMyClients } from "@/api/clients";
export { fetchClientBranches } from "@/api/branches";
export {
  fetchOrders,
  updateOrderStatus,
  updateProductPrepared,
} from "@/api/orders";
export { fetchKdsSettings, updateKdsSettings } from "@/api/kds-settings";
export { fetchSmsHistory } from "@/api/sms-history";
