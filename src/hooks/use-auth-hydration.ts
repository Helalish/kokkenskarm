"use client";

import { useSyncExternalStore } from "react";
import { useAuthStore } from "@/stores/auth-store";

function getSnapshot() {
  return useAuthStore.persist.hasHydrated();
}

function getServerSnapshot() {
  return false;
}

function subscribe(callback: () => void) {
  return useAuthStore.persist.onFinishHydration(callback);
}

export function useAuthHydration() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
