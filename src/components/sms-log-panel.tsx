"use client";

import { useSmsLogStore } from "@/stores/sms-log-store";
import { useT } from "@/hooks/use-t";

interface SmsLogPanelProps {
  onClose: () => void;
}

export function SmsLogPanel({ onClose }: SmsLogPanelProps) {
  const { entries, isLoading, error } = useSmsLogStore();
  const t = useT();

  return (
    <div
      className="fixed inset-x-3 z-50 flex max-h-[calc(100dvh-anchor(--sms-button_bottom)-1.25rem)] flex-col rounded-2xl border border-shopbox-border bg-shopbox-card shadow-2xl top-[calc(anchor(--sms-button_bottom)+0.5rem)] md:absolute md:inset-x-auto md:left-1/2 md:top-full md:mt-2 md:max-h-[70vh] md:w-96 md:-translate-x-1/2 lg:left-auto lg:right-0 lg:translate-x-0"
    >
      <div className="flex items-center justify-between gap-3 border-b border-shopbox-border px-5 py-4">
        <h2 className="min-w-0 truncate text-lg font-bold text-shopbox-text">
          {t("smsLog.title")}
        </h2>
        <button
          onClick={onClose}
          className="shrink-0 rounded-lg p-1 text-shopbox-muted transition-colors hover:bg-shopbox-surface hover:text-shopbox-text"
        >
          ✕
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-sm text-shopbox-muted">
            {t("settings.loading")}
          </div>
        ) : error ? (
          <div className="px-5 py-4 text-sm text-red-400">{error}</div>
        ) : entries.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-sm text-shopbox-muted">
            {t("smsLog.empty")}
          </div>
        ) : (
          <div className="divide-y divide-shopbox-border/50">
            {entries.map((entry) => (
              <div key={entry.id} className="px-5 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-shopbox-accent" />
                    <span className="truncate text-sm font-semibold text-shopbox-text">
                      {t("smsLog.order", { orderNumber: entry.orderNumber })}
                    </span>
                  </div>
                  <span className="shrink-0 whitespace-nowrap text-xs text-shopbox-muted">
                    {new Date(entry.sentAt).toLocaleString("da-DK", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="mt-1 text-xs text-shopbox-text-secondary">{entry.phone}</p>
                <p className="mt-0.5 truncate text-xs text-shopbox-muted">{entry.message}</p>
                <p className="mt-1 text-[10px] uppercase tracking-wide text-shopbox-muted">
                  {entry.status}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
