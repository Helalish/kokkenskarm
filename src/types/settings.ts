// Shopbox API payload for GET/PATCH /kds-settings
export interface ShopboxKdsSettings {
  order_sorting: "newest_first" | "oldest_first";
  warning_after_minutes: number;
  critical_after_minutes: number;
  remove_from_ready_after_minutes: number;
  mark_individual_products: boolean;
  auto_advance_when_all_products_done: boolean;
  play_sound_on_new_orders: boolean;
  sms_enabled: boolean;
}

// Settings synced with Shopbox backend (app-facing shape)
export interface RemoteSettings {
  /** Kept for PATCH round-trips; KDS sort UI uses local sortOrder instead. */
  orderSorting: "newest_first" | "oldest_first";
  timerWarningSeconds: number;
  timerCriticalSeconds: number;
  autoDismissReadySeconds: number;
  showItemCheckmarks: boolean;
  autoAdvanceWhenAllDone: boolean;
  soundEnabled: boolean;
  smsEnabled: boolean;
}

export interface ThemeColors {
  surface: string;
  primary: string;
  card: string;
  cardHover: string;
  border: string;
  accent: string;
  text: string;
  textSecondary: string;
  muted: string;
}

// Local-only UI preferences (not synced to backend)
export interface LocalSettings {
  viewMode: "grid" | "kanban" | "summary";
  sortOrder: "oldest" | "newest";
  textScale: number;
  theme: ThemeColors;
}
