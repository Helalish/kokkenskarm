"use client";

import { create } from "zustand";
import type { Order } from "@/types/order";

interface PreOrdersState {
  preOrders: Order[];
  promoteMinutesBefore: number;
  addPreOrder: (order: Order) => void;
  removePreOrder: (id: string) => void;
  setPreOrders: (orders: Order[]) => void;
  setPromoteMinutesBefore: (minutes: number) => void;
  getReadyToPromote: () => Order[];
}

export const usePreOrdersStore = create<PreOrdersState>()((set, get) => ({
  preOrders: [],
  promoteMinutesBefore: 15,

  addPreOrder: (order) => {
    set((state) => ({ preOrders: [...state.preOrders, order] }));
  },

  removePreOrder: (id) => {
    set((state) => ({
      preOrders: state.preOrders.filter((o) => o.id !== id),
    }));
  },

  setPreOrders: (orders) => set({ preOrders: orders }),

  setPromoteMinutesBefore: (minutes) => set({ promoteMinutesBefore: minutes }),

  getReadyToPromote: () => {
    const { preOrders, promoteMinutesBefore } = get();
    const threshold = Date.now() + promoteMinutesBefore * 60 * 1000;
    return preOrders.filter(
      (o) => o.scheduledTime && new Date(o.scheduledTime).getTime() <= threshold
    );
  },
}));
