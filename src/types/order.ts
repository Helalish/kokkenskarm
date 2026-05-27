export type OrderSource = "pos" | "weorder" | "kiosk" | "qr";

export type PaymentStatus = "paid" | "unpaid" | "partial";

export interface CustomerInfo {
  name: string;
  phone?: string;
  email?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  variants: string[];
  modifications: string[];
  ingredients: string[];
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
}
