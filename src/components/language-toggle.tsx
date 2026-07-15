"use client";

import { useLanguageStore, type Language } from "@/stores/language-store";
import { cn } from "@/lib/cn";

export function LanguageToggle({ className }: { className?: string }) {
  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);

  return (
    <div
      className={cn(
        "inline-flex rounded-lg overflow-hidden border border-shopbox-border text-xs font-semibold",
        className
      )}
    >
      {(["en", "da"] as const satisfies readonly Language[]).map((l) => (
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
