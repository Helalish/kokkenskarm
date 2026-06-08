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

export interface DisplaySettings {
  gridColumns: number;
  textScale: number;
  timerWarningSeconds: number;
  timerCriticalSeconds: number;
  warningColor: string;
  criticalColor: string;
  sortOrder: "oldest" | "newest";
  soundEnabled: boolean;
  theme: ThemeColors;
  viewMode: "grid" | "kanban" | "summary";
  showItemCheckmarks: boolean;
  autoAdvanceWhenAllDone: boolean;
  scrollableCards: boolean;
  autoDismissReadySeconds: number;
  smsEnabled: boolean;
}
