"use client";

import { useOrdersStore } from "@/stores/orders-store";
// disable pre-orders for app version 1
// import { usePreOrdersStore } from "@/stores/pre-orders-store";
import { useSettingsStore } from "@/stores/settings-store";
import { useSmsLogStore } from "@/stores/sms-log-store";

/** Clears data that belongs to the previously selected restaurant. */
export function resetBranchSession() {
  useOrdersStore.getState().reset();
  // disable pre-orders for app version 1
  // usePreOrdersStore.getState().reset();
  useSmsLogStore.getState().reset();
  useSettingsStore.getState().resetRemote();
}
