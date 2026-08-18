"use client";

import { useAuthStore } from "@/stores/auth-store";

/**
 * Storage keys scoped to the signed-in session / branch.
 * Keep device prefs (kds-language).
 */
const SESSION_STORAGE_KEYS = ["kds-settings-cache"] as const;

/** Clears persisted session data and reloads on the login page. */
export function clearClientSessionAndRedirect() {
  useAuthStore.persist.clearStorage();

  for (const key of SESSION_STORAGE_KEYS) {
    localStorage.removeItem(key);
  }

  window.location.replace("/login");
}
