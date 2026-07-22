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
    <div className="absolute right-0 top-full mt-2 z-50 w-96 max-h-[70vh] rounded-2xl bg-shopbox-card border border-shopbox-border shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-shopbox-border">
          <h2 className="text-lg font-bold text-shopbox-text">{t("smsLog.title")}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-shopbox-muted hover:text-shopbox-text hover:bg-shopbox-surface transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-shopbox-muted text-sm">
              {t("settings.loading")}
            </div>
          ) : error ? (
            <div className="px-5 py-4 text-sm text-red-400">
              {error}
            </div>
          ) : entries.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-shopbox-muted text-sm">
              {t("smsLog.empty")}
            </div>
          ) : (
            <div className="divide-y divide-shopbox-border/50">
              {entries.map((entry) => (
                <div key={entry.id} className="px-5 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-shopbox-accent" />
                      <span className="text-sm font-semibold text-shopbox-text">
                        {t("smsLog.order", { orderNumber: entry.orderNumber })}
                      </span>
                    </div>
                    <span className="text-xs text-shopbox-muted">
                      {new Date(entry.sentAt).toLocaleString("da-DK", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-shopbox-text-secondary mt-1">{entry.phone}</p>
                  <p className="text-xs text-shopbox-muted mt-0.5 truncate">{entry.message}</p>
                  <p className="text-[10px] text-shopbox-muted mt-1 uppercase tracking-wide">{entry.status}</p>
                </div>
              ))}
            </div>
          )}
        </div>
    </div>
  );
}
