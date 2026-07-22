export interface ShopboxSmsHistoryEntry {
  uid: number;
  order_number: string;
  kds_status: string;
  message: string;
  customer_phone: string;
  sent_at: number; // unix timestamp (seconds)
  order_id: number;
}