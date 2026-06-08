"use client";

import { useModeStore } from "@/stores/mode-store";

export function ModeToggle() {
  const { isFullMode, toggleFullMode } = useModeStore();

  return (
    <button
      onClick={toggleFullMode}
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-full border px-4 py-2 shadow-lg backdrop-blur-sm transition-all hover:scale-105"
      style={{
        backgroundColor: isFullMode
          ? "rgba(34, 197, 94, 0.15)"
          : "rgba(249, 115, 22, 0.15)",
        borderColor: isFullMode
          ? "rgba(34, 197, 94, 0.5)"
          : "rgba(249, 115, 22, 0.5)",
      }}
    >
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{
          backgroundColor: isFullMode ? "#22C55E" : "#F97316",
        }}
      />
      <span
        className="text-xs font-bold tracking-wider"
        style={{
          color: isFullMode ? "#22C55E" : "#F97316",
        }}
      >
        {isFullMode ? "Full feature" : "MVP"}
      </span>
    </button>
  );
}
