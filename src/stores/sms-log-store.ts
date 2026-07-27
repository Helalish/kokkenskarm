"use client";

import { create } from "zustand";
import { fetchSmsHistory } from "@/lib/shopbox-api";
import type { ShopboxSmsHistoryEntry } from "@/types/sms";

export interface SmsLogEntry {
  id: string;
  orderId: string;
  orderNumber: string;
  phone: string;
  message: string;
  sentAt: string;
  status: string;
}

interface SmsLogState {
  entries: SmsLogEntry[];
  isLoading: boolean;
  error: string | null;
  loadedLimit: number | null;
  loadHistory: (limit?: number, opts?: { force?: boolean }) => Promise<void>;
  reset: () => void;
}

let inFlight: Promise<void> | null = null;

function mapShopboxEntry(entry: ShopboxSmsHistoryEntry): SmsLogEntry {
  const sentAtMs = entry.sent_at * 1000;
  return {
    // `uid` is not unique in the API response, so use a stable composite key.
    id: `sms-${entry.uid}-${entry.order_id}-${entry.sent_at}`,
    orderId: String(entry.order_id),
    orderNumber: entry.order_number,
    phone: entry.customer_phone,
    message: entry.message,
    sentAt: new Date(sentAtMs).toISOString(),
    status: entry.kds_status,
  };
}

export const useSmsLogStore = create<SmsLogState>()(
  (set) => ({
    entries: [],
    isLoading: false,
    error: null,
    loadedLimit: null,

    reset: () => {
      inFlight = null;
      set({ entries: [], isLoading: false, error: null, loadedLimit: null });
    },

    loadHistory: async (limit = 10, opts) => {
      const force = opts?.force ?? false;
      const { entries, isLoading, loadedLimit, error } = useSmsLogStore.getState();

      // Always de-dupe in-flight requests (even when force=true).
      if (isLoading && inFlight) return inFlight;

      // Avoid duplicate requests (React StrictMode + multiple callers).
      if (!force) {
        if (entries.length > 0 && !error && loadedLimit === limit) return;
      }

      set({ isLoading: true, error: null });
      try {
        inFlight = (async () => {
          const data = await fetchSmsHistory(limit);
          const mapped = (Array.isArray(data) ? data : []).map(mapShopboxEntry);
          set({
            entries: mapped,
            isLoading: false,
            error: null,
            loadedLimit: limit,
          });
        })();
        await inFlight;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load SMS history";
        set({ isLoading: false, error: message, loadedLimit: null });
      } finally {
        inFlight = null;
      }
    },
  })
);
