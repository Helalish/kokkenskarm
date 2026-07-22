"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  RemoteSettings,
  LocalSettings,
  ShopboxKdsSettings,
  ThemeColors,
} from "@/types/settings";
import {
  fetchKdsSettings,
  updateKdsSettings,
} from "@/lib/shopbox-api";

export const DEFAULT_THEME: ThemeColors = {
  surface: "#000000",
  primary: "#111111",
  card: "#1A1A1A",
  cardHover: "#252525",
  border: "#333333",
  accent: "#22C55E",
  text: "#FFFFFF",
  textSecondary: "#B0B0B0",
  muted: "#707070",
};

const DEFAULT_TEXT_SCALE = 1;

function shopboxToLocal(api: ShopboxKdsSettings): RemoteSettings {
  return {
    orderSorting: api.order_sorting === "newest_first" ? "newest_first" : "oldest_first",
    timerWarningSeconds: api.warning_after_minutes * 60,
    timerCriticalSeconds: api.critical_after_minutes * 60,
    autoDismissReadySeconds: api.remove_from_ready_after_minutes * 60,
    showItemCheckmarks: api.mark_individual_products,
    autoAdvanceWhenAllDone: api.auto_advance_when_all_products_done,
    soundEnabled: api.play_sound_on_new_orders,
    smsEnabled: api.sms_enabled,
  };
}

function toShopboxPayload(remote: RemoteSettings): ShopboxKdsSettings {
  return {
    order_sorting: remote.orderSorting,
    warning_after_minutes: Math.round(remote.timerWarningSeconds / 60),
    critical_after_minutes: Math.round(remote.timerCriticalSeconds / 60),
    remove_from_ready_after_minutes: Math.round(remote.autoDismissReadySeconds / 60),
    mark_individual_products: remote.showItemCheckmarks,
    auto_advance_when_all_products_done: remote.autoAdvanceWhenAllDone,
    play_sound_on_new_orders: remote.soundEnabled,
    sms_enabled: remote.smsEnabled,
  };
}

interface SettingsState extends LocalSettings {
  /** Cached Shopbox settings. null only before the first successful fetch. */
  remote: RemoteSettings | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  hasHydrated: boolean;

  updateSettings: (updates: Partial<LocalSettings & RemoteSettings>) => void;
  updateTheme: (updates: Partial<ThemeColors>) => void;
  resetTheme: () => void;
  loadFromShopbox: () => Promise<void>;
  saveToShopbox: (updates: Partial<RemoteSettings>) => Promise<boolean>;
  setHasHydrated: (value: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      viewMode: "grid",
      sortOrder: "oldest",
      textScale: DEFAULT_TEXT_SCALE,
      theme: { ...DEFAULT_THEME },
      remote: null,
      isLoading: true,
      isSaving: false,
      error: null,
      hasHydrated: false,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      updateSettings: (updates) => {
        const { viewMode, sortOrder, textScale, theme, ...remoteUpdates } = updates;
        set((state) => {
          const next: Partial<SettingsState> = {};
          if (viewMode !== undefined) next.viewMode = viewMode;
          if (sortOrder !== undefined) next.sortOrder = sortOrder;
          if (textScale !== undefined) next.textScale = textScale;
          if (theme !== undefined) next.theme = theme;
          if (state.remote && Object.keys(remoteUpdates).length > 0) {
            next.remote = { ...state.remote, ...remoteUpdates };
          }
          return next;
        });
      },

      updateTheme: (updates) =>
        set((state) => ({
          theme: { ...state.theme, ...updates },
        })),

      resetTheme: () => set({ theme: { ...DEFAULT_THEME } }),

      loadFromShopbox: async () => {
        const hasCache = get().remote !== null;
        // Only block the UI when we have nothing cached yet.
        set(hasCache ? { error: null } : { isLoading: true, error: null });

        try {
          const apiSettings = await fetchKdsSettings();
          set({ remote: shopboxToLocal(apiSettings), isLoading: false, error: null });
        } catch (err) {
          console.error("Failed to load settings from Shopbox:", err);
          // Keep cached remote on failure so KDS can still use last-known settings.
          set({
            isLoading: false,
            error: hasCache ? null : "Failed to load settings",
          });
        }
      },

      saveToShopbox: async (updates) => {
        const current = get().remote;
        if (!current) return false;

        const merged: RemoteSettings = { ...current, ...updates };

        set({ isSaving: true, error: null });
        try {
          await updateKdsSettings(toShopboxPayload(merged));
          set({ remote: merged, isSaving: false });
          return true;
        } catch (err) {
          console.error("Failed to save settings to Shopbox:", err);
          set({ isSaving: false, error: "Failed to save settings" });
          return false;
        }
      },
    }),
    {
      name: "kds-settings-cache",
      partialize: (state) => ({
        viewMode: state.viewMode,
        sortOrder: state.sortOrder,
        textScale: state.textScale,
        theme: state.theme,
        remote: state.remote,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        // Cached settings are ready immediately — don't keep the loading gate up.
        if (state?.remote) {
          state.isLoading = false;
        }
      },
    }
  )
);
