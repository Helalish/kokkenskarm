import type { Language } from "@/stores/language-store";

const TIME_UNITS: Record<Language, { hour: string; minute: string; day: string }> = {
  en: { hour: "h", minute: "m", day: "d" },
  da: { hour: "t", minute: "m", day: "d" },
};

export function formatElapsedTime(seconds: number, language: Language = "en"): string {
  const totalSeconds = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const units = TIME_UNITS[language] ?? TIME_UNITS.en;

  if (mins < 60) {
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  const hrs = Math.floor(mins / 60);
  const remainMins = mins % 60;

  if (hrs < 24) {
    return `${hrs}${units.hour} ${remainMins.toString().padStart(2, "0")}${units.minute}`;
  }

  const days = Math.floor(hrs / 24);
  const remainHrs = hrs % 24;
  return `${days}${units.day} ${remainHrs}${units.hour}`;
}

export function getElapsedSeconds(createdAt: string, now: number = Date.now()): number {
  return Math.floor((now - new Date(createdAt).getTime()) / 1000);
}

export type TimerStatus = "normal" | "warning" | "critical";

export function getTimerStatus(
  elapsedSeconds: number,
  warningThreshold: number,
  criticalThreshold: number
): TimerStatus {
  if (elapsedSeconds >= criticalThreshold) return "critical";
  if (elapsedSeconds >= warningThreshold) return "warning";
  return "normal";
}
