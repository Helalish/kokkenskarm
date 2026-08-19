export type OrderSource = "pos" | "weorder" | "kiosk" | "qr";

export type PaymentStatus = "paid" | "unpaid" | "partial";

export interface CustomerInfo {
  name: string;
  phone?: string;
  email?: string;
}

/** Line from modifiers / add_ons / opt_outs on a Shopbox product. */
export interface OrderItemExtra {
  id: string;
  name: string;
  quantity: number;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  /** product_variance — grey in UI */
  variants: string[];
  /** Mandatory choices from `modifiers` — orange in UI */
  modifiers: OrderItemExtra[];
  /** From `add_ons` — orange in UI */
  addOns: OrderItemExtra[];
  /** From `opt_outs` — red + strikethrough in UI */
  optOuts: OrderItemExtra[];
  /** Product-line comment from POS (`comment` on the Shopbox product). */
  comment?: string;
  category: string;
  isDone: boolean;
  changeStatus?: "added" | "removed" | "refunded";
}

export interface Order {
  id: string;
  orderNumber: number;
  source: OrderSource;
  items: OrderItem[];
  currentStageId: string;
  createdAt: string;
  completedAt?: string;
  paymentStatus: PaymentStatus;
  customerInfo?: CustomerInfo;
  isPreOrder: boolean;
  scheduledTime?: string;
  notes?: string;
  isRefunded?: boolean;
  hasChanges?: boolean;
  stageEnteredAt?: string;
  smsSentCount?: number;
  lastSmsSentAt?: string;
  orderType?: string;
}
