"use client";

import { useMvpStore } from "@/stores/mvp-store";

export function MvpToggle() {
  const { isMvpMode, toggleMvpMode } = useMvpStore();

  return (
    <button
      onClick={toggleMvpMode}
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-full border px-4 py-2 shadow-lg backdrop-blur-sm transition-all hover:scale-105"
      style={{
        backgroundColor: isMvpMode
          ? "rgba(34, 197, 94, 0.15)"
          : "rgba(249, 115, 22, 0.15)",
        borderColor: isMvpMode
          ? "rgba(34, 197, 94, 0.5)"
          : "rgba(249, 115, 22, 0.5)",
      }}
    >
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{
          backgroundColor: isMvpMode ? "#22C55E" : "#F97316",
        }}
      />
      <span
        className="text-xs font-bold tracking-wider"
        style={{
          color: isMvpMode ? "#22C55E" : "#F97316",
        }}
      >
        {isMvpMode ? "MVP" : "DEMO"}
      </span>
    </button>
  );
}
