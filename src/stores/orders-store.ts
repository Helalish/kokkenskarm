"use client";

import { create } from "zustand";
import type { Order, OrderItem } from "@/types/order";
import { isKdsStageId, type KdsApiStatus } from "@/types/pipeline";
import { useToastStore } from "@/stores/toast-store";
import { updateOrderStatus as shopboxUpdateOrderStatus, updateProductPrepared } from "@/api/orders";

/** Skip store updates when a refetch didn't change anything the UI shows. */
function itemUiKey(item: OrderItem): string {
  return [
    item.id,
    item.quantity,
    item.isDone ? "1" : "0",
    item.changeStatus ?? "",
    item.name,
    item.variants.join(","),
    item.modifiers.map((m) => `${m.id}:${m.quantity}`).join(","),
    item.addOns.map((m) => `${m.id}:${m.quantity}`).join(","),
    item.optOuts.map((m) => `${m.id}:${m.quantity}`).join(","),
    item.comment ?? "",
  ].join(";");
}

function orderUiKey(order: Order): string {
  return [
    order.id,
    order.orderNumber,
    order.currentStageId,
    order.createdAt,
    order.stageEnteredAt ?? "",
    order.paymentStatus,
    order.hasChanges ? "1" : "0",
    order.isRefunded ? "1" : "0",
    order.notes ?? "",
    order.customerInfo?.name ?? "",
    order.customerInfo?.phone ?? "",
    order.items.map(itemUiKey).join("|"),
  ].join("#");
}

function areOrdersUiEqual(prev: Order[], next: Order[]): boolean {
  if (prev.length !== next.length) return false;
  const prevKeys = new Map(prev.map((o) => [o.id, orderUiKey(o)]));
  for (const order of next) {
    if (prevKeys.get(order.id) !== orderUiKey(order)) return false;
  }
  return true;
}

interface OrdersState {
  orders: Order[];
  /** In-flight Shopbox writes — refetch should wait until this is 0. */
  pendingMutations: number;

  beginMutation: () => void;
  endMutation: () => void;
  addOrder: (order: Order) => void;
  toggleItemDone: (orderId: string, itemId: string) => void;
  markAllItemsDone: (orderId: string) => void;
  toggleAllItemsDone: (orderId: string) => void;
  acknowledgeChanges: (orderId: string) => void;
  dismissOrder: (orderId: string) => void;
  setOrders: (orders: Order[]) => void;
  incrementSmsSent: (orderId: string) => void;
  updateOrderStatus: (orderId: string, nextStageId: string) => Promise<boolean>;
  reset: () => void;
}

export const useOrdersStore = create<OrdersState>()((set, get) => ({
  orders: [],
  pendingMutations: 0,

  beginMutation: () =>
    set((state) => ({ pendingMutations: state.pendingMutations + 1 })),

  endMutation: () =>
    set((state) => ({ pendingMutations: Math.max(0, state.pendingMutations - 1) })),

  reset: () => set({ orders: [], pendingMutations: 0 }),

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
    const moveBackToInProgress =
      order.currentStageId === "ready" && previous && !next;
    const previousStageId = order.currentStageId;
    const previousStageEnteredAt = order.stageEnteredAt;
    const orderType = order.orderType ?? "takeaway";

    // Optimistic UI update
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              items: o.items.map((it) => (it.id === itemId ? { ...it, isDone: next } : it)),
              ...(moveBackToInProgress
                ? { currentStageId: "in_progress", stageEnteredAt: new Date().toISOString() }
                : {}),
            }
          : o
      ),
    }));

    get().beginMutation();
    void (async () => {
      let preparedOk = false;
      try {
        await updateProductPrepared(orderId, itemId, next, orderType);
        preparedOk = true;
        if (moveBackToInProgress) {
          await shopboxUpdateOrderStatus(orderId, {
            order_type: orderType,
            status: "in_progress",
          });
        }
      } catch {
        if (!preparedOk) {
          set((state) => ({
            orders: state.orders.map((o) =>
              o.id === orderId
                ? {
                    ...o,
                    currentStageId: previousStageId,
                    stageEnteredAt: previousStageEnteredAt,
                    items: o.items.map((it) =>
                      it.id === itemId ? { ...it, isDone: previous } : it
                    ),
                  }
                : o
            ),
          }));
          useToastStore.getState().addToast({
            type: "info",
            message: "Failed to update item",
            detail: "The change has been reverted. Please try again.",
            duration: 4000,
          });
        } else {
          set((state) => ({
            orders: state.orders.map((o) =>
              o.id === orderId
                ? {
                    ...o,
                    currentStageId: previousStageId,
                    stageEnteredAt: previousStageEnteredAt,
                  }
                : o
            ),
          }));
          useToastStore.getState().addToast({
            type: "info",
            message: "Failed to update order status",
            detail: "The item was updated. Please try moving the order again.",
            duration: 4000,
          });
        }
      } finally {
        get().endMutation();
      }
    })();
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

    // Hold off Firestore-driven refetches until every prepared PATCH finishes,
    // otherwise the first success can overwrite optimistic state mid-batch.
    get().beginMutation();
    void Promise.allSettled(
      toUpdate.map((i) => updateProductPrepared(orderId, i.id, true, order.orderType ?? "takeaway"))
    )
      .then((results) => {
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
      })
      .finally(() => {
        get().endMutation();
      });
  },

  toggleAllItemsDone: (orderId) => {
    set((state) => ({
      orders: state.orders.map((o) => {
        if (o.id !== orderId) return o;
        // Tap once marks all as done; tap again clears all.
        const allDone = o.items.length > 0 && o.items.every((item) => item.isDone);
        return { ...o, items: o.items.map((item) => ({ ...item, isDone: !allDone })) };
      }),
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
    set((state) => ({
      orders: state.orders.filter((o) => o.id !== orderId),
    }));
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

    const prev = get().orders;
    if (areOrdersUiEqual(prev, unique)) return;

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

    get().beginMutation();
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
            };
          }
          return {
            orders: [...state.orders, { ...order, currentStageId: previousStageId }],
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
    } finally {
      get().endMutation();
    }
  },
}));
