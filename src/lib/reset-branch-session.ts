"use client";

import { useOrdersStore } from "@/stores/orders-store";
import { usePreOrdersStore } from "@/stores/pre-orders-store";
import { useSettingsStore } from "@/stores/settings-store";
import { useSmsLogStore } from "@/stores/sms-log-store";

/** Clears data that belongs to the previously selected restaurant. */
export function resetBranchSession() {
  useOrdersStore.getState().reset();
  usePreOrdersStore.getState().reset();
  useSmsLogStore.getState().reset();
  useSettingsStore.getState().resetRemote();
}
