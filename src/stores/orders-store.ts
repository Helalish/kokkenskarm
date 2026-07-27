"use client";

import { create } from "zustand";
import type { Order } from "@/types/order";
import { isKdsStageId, type KdsApiStatus } from "@/types/pipeline";
import { useToastStore } from "@/stores/toast-store";
import { updateOrderStatus as shopboxUpdateOrderStatus, updateProductPrepared } from "@/api/orders";

interface OrdersState {
  orders: Order[];
  dismissedOrders: Order[];

  addOrder: (order: Order) => void;
  toggleItemDone: (orderId: string, itemId: string) => void;
  markAllItemsDone: (orderId: string) => void;
  acknowledgeChanges: (orderId: string) => void;
  dismissOrder: (orderId: string) => void;
  undoDismiss: () => Order | null;
  setOrders: (orders: Order[]) => void;
  incrementSmsSent: (orderId: string) => void;
  updateOrderStatus: (orderId: string, nextStageId: string) => Promise<boolean>;
  reset: () => void;
}

export const useOrdersStore = create<OrdersState>()((set, get) => ({
  orders: [],
  dismissedOrders: [],

  reset: () => set({ orders: [], dismissedOrders: [] }),

  addOrder: (order) => {
    set((state) => {
      if (state.orders.some((o) => o.id === order.id)) return state;
      return { orders: [...state.orders, order] };
    });
  },

  toggleItemDone: (orderId, itemId) => {
    const order = get().orders.find((o) => o.id === orderId);
    const item = order?.items.find((i) => i.id === itemId);
    if (!order || !item) return;

    const previous = item.isDone;
    const next = !previous;

    // Optimistic UI update
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId
          ? { ...o, items: o.items.map((it) => (it.id === itemId ? { ...it, isDone: next } : it)) }
          : o
      ),
    }));

    void updateProductPrepared(orderId, itemId, next).catch(() => {
      // Rollback on failure
      set((state) => ({
        orders: state.orders.map((o) =>
          o.id === orderId
            ? { ...o, items: o.items.map((it) => (it.id === itemId ? { ...it, isDone: previous } : it)) }
            : o
        ),
      }));

      useToastStore.getState().addToast({
        type: "info",
        message: "Failed to update item",
        detail: "The change has been reverted. Please try again.",
        duration: 4000,
      });
    });
  },

  markAllItemsDone: (orderId) => {
    const order = get().orders.find((o) => o.id === orderId);
    if (!order) return;

    const previousById = new Map(order.items.map((i) => [i.id, i.isDone] as const));
    const toUpdate = order.items.filter((i) => !i.isDone);

    // Optimistic UI update
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, items: o.items.map((i) => ({ ...i, isDone: true })) } : o
      ),
    }));

    if (toUpdate.length === 0) return;

    void Promise.allSettled(toUpdate.map((i) => updateProductPrepared(orderId, i.id, true))).then((results) => {
      const failedIds = toUpdate
        .filter((_, idx) => results[idx]?.status === "rejected")
        .map((i) => i.id);

      if (failedIds.length === 0) return;

      // Rollback only the ones that failed
      set((state) => ({
        orders: state.orders.map((o) =>
          o.id === orderId
            ? {
                ...o,
                items: o.items.map((i) =>
                  failedIds.includes(i.id) ? { ...i, isDone: previousById.get(i.id) ?? false } : i
                ),
              }
            : o
        ),
      }));

      useToastStore.getState().addToast({
        type: "info",
        message: "Failed to update some items",
        detail: "Some item checks were reverted. Please try again.",
        duration: 4500,
      });
    });
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
    set((state) => {
      // Polling may already have restored this order — don't create a duplicate key.
      if (state.orders.some((o) => o.id === restored.id)) {
        return { dismissedOrders: rest };
      }
      return {
        orders: [...state.orders, restored],
        dismissedOrders: rest,
      };
    });
    return restored;
  },

  setOrders: (orders) => {
    // Keep first occurrence of each id so React keys stay unique.
    const seen = new Set<string>();
    const unique: Order[] = [];
    for (const order of orders) {
      if (seen.has(order.id)) continue;
      seen.add(order.id);
      unique.push(order);
    }
    set({ orders: unique });
  },

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
      await shopboxUpdateOrderStatus(orderId, {
        order_type: order.orderType ?? "takeaway",
        status,
      });

      return true;
    } catch {
      // Rollback on failure
      if (isDone) {
        set((state) => {
          // Polling may already have put the order back — avoid duplicate keys.
          if (state.orders.some((o) => o.id === orderId)) {
            return {
              orders: state.orders.map((o) =>
                o.id === orderId ? { ...o, currentStageId: previousStageId } : o
              ),
              dismissedOrders: state.dismissedOrders.filter((o) => o.id !== orderId),
            };
          }
          return {
            orders: [...state.orders, { ...order, currentStageId: previousStageId }],
            dismissedOrders: state.dismissedOrders.filter((o) => o.id !== orderId),
          };
        });
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
