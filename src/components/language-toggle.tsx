"use client";

import { useModeStore } from "@/stores/mode-store";
import { useLanguageStore, type Language } from "@/stores/language-store";
import { cn } from "@/lib/cn";

// DA/EN segmented toggle. Only rendered in DEMO mode; MVP mode is Danish-only.
export function LanguageToggle({ className }: { className?: string }) {
  const isFullMode = useModeStore((s) => s.isFullMode);
  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);

  if (isFullMode) return null;

  return (
    <div
      className={cn(
        "inline-flex rounded-lg overflow-hidden border border-shopbox-border text-xs font-semibold",
        className
      )}
    >
      {(["da", "en"] as const satisfies readonly Language[]).map((l) => (
        <button
          key={l}
          onClick={() => setLanguage(l)}
          className={cn(
            "px-2 py-1 transition-colors",
            language === l
              ? "bg-shopbox-accent text-white"
              : "bg-shopbox-card text-shopbox-text-secondary hover:bg-shopbox-card-hover"
          )}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
