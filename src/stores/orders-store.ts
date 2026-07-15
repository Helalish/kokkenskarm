"use client";

import { create } from "zustand";
import type { Order } from "@/types/order";
import { isKdsStageId, type KdsApiStatus } from "@/types/pipeline";
import { useToastStore } from "@/stores/toast-store";

interface OrdersState {
  orders: Order[];
  dismissedOrders: Order[];

  addOrder: (order: Order) => void;
  removeOrder: (id: string) => void;
  advanceStage: (orderId: string, nextStageId: string) => void;
  completeOrder: (orderId: string) => void;
  toggleItemDone: (orderId: string, itemId: string) => void;
  markAllItemsDone: (orderId: string) => void;
  acknowledgeChanges: (orderId: string) => void;
  dismissOrder: (orderId: string) => void;
  undoDismiss: () => Order | null;
  setOrders: (orders: Order[]) => void;
  incrementSmsSent: (orderId: string) => void;
  updateOrderStatus: (orderId: string, nextStageId: string) => Promise<boolean>;
}

export const useOrdersStore = create<OrdersState>()((set, get) => ({
  orders: [],
  dismissedOrders: [],

  addOrder: (order) => {
    set((state) => ({ orders: [...state.orders, order] }));
  },

  removeOrder: (id) => {
    set((state) => ({ orders: state.orders.filter((o) => o.id !== id) }));
  },

  advanceStage: (orderId, nextStageId) => {
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId
          ? { ...o, currentStageId: nextStageId, stageEnteredAt: new Date().toISOString() }
          : o
      ),
    }));
  },

  completeOrder: (orderId) => {
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId
          ? { ...o, completedAt: new Date().toISOString() }
          : o
      ),
    }));
  },

  toggleItemDone: (orderId, itemId) => {
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              items: o.items.map((item) =>
                item.id === itemId
                  ? { ...item, isDone: !item.isDone }
                  : item
              ),
            }
          : o
      ),
    }));
  },

  markAllItemsDone: (orderId) => {
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              items: o.items.map((item) => ({ ...item, isDone: true })),
            }
          : o
      ),
    }));
  },

  acknowledgeChanges: (orderId) => {
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, hasChanges: false } : o
      ),
    }));
  },

  dismissOrder: (orderId) => {
    const order = get().orders.find((o) => o.id === orderId);
    if (!order) return;
    set((state) => ({
      orders: state.orders.filter((o) => o.id !== orderId),
      dismissedOrders: [order, ...state.dismissedOrders].slice(0, 20),
    }));
  },

  undoDismiss: () => {
    const dismissed = get().dismissedOrders;
    if (dismissed.length === 0) return null;
    const [restored, ...rest] = dismissed;
    set((state) => ({
      orders: [...state.orders, restored],
      dismissedOrders: rest,
    }));
    return restored;
  },

  setOrders: (orders) => set({ orders }),

  incrementSmsSent: (orderId) => {
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId
          ? { ...o, smsSentCount: (o.smsSentCount ?? 0) + 1, lastSmsSentAt: new Date().toISOString() }
          : o
      ),
    }));
  },

  updateOrderStatus: async (orderId, nextStageId) => {
    const order = get().orders.find((o) => o.id === orderId);
    if (!order) return false;

    const previousStageId = order.currentStageId;
    // Stage IDs mirror API status values. "done" dismisses; unknown/custom
    // stage IDs also become "done" since the API has nothing else to map them to.
    const isDone = nextStageId === "done" || !isKdsStageId(nextStageId);
    const status: KdsApiStatus = isDone ? "done" : nextStageId;

    // Optimistic update
    if (isDone) {
      get().dismissOrder(orderId);
    } else {
      set((state) => ({
        orders: state.orders.map((o) =>
          o.id === orderId
            ? { ...o, currentStageId: nextStageId, stageEnteredAt: new Date().toISOString() }
            : o
        ),
      }));
    }

    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_type: order.orderType ?? "takeaway",
          status,
        }),
      });

      if (!response.ok) {
        throw new Error(`Status ${response.status}`);
      }

      return true;
    } catch {
      // Rollback on failure
      if (isDone) {
        set((state) => ({
          orders: [...state.orders, { ...order, currentStageId: previousStageId }],
          dismissedOrders: state.dismissedOrders.filter((o) => o.id !== orderId),
        }));
      } else {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId
              ? { ...o, currentStageId: previousStageId }
              : o
          ),
        }));
      }

      useToastStore.getState().addToast({
        type: "info",
        message: "Failed to update order status",
        detail: "The change has been reverted. Please try again.",
        duration: 4000,
      });

      return false;
    }
  },
}));
