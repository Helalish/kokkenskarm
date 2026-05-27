export function formatElapsedTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60);
    const remainMins = mins % 60;
    return `${hrs}t ${remainMins.toString().padStart(2, "0")}m`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function getElapsedSeconds(createdAt: string): number {
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000);
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
