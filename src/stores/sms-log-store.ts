"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SmsLogEntry {
  id: string;
  orderId: string;
  orderNumber: number;
  phone: string;
  message: string;
  sentAt: string;
  success: boolean;
}

interface SmsLogState {
  entries: SmsLogEntry[];
  addEntry: (entry: Omit<SmsLogEntry, "id">) => void;
  clearLog: () => void;
}

let logCounter = 0;

export const useSmsLogStore = create<SmsLogState>()(
  persist(
    (set) => ({
      entries: [],

      addEntry: (entry) => {
        const id = `sms-${++logCounter}-${Date.now()}`;
        set((state) => ({
          entries: [{ ...entry, id }, ...state.entries].slice(0, 100),
        }));
      },

      clearLog: () => set({ entries: [] }),
    }),
    { name: "kds-sms-log" }
  )
);
