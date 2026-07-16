"use client";

import { useSmsLogStore } from "@/stores/sms-log-store";
import { sendOrderSms } from "@/services/sms-service";
import { useT } from "@/hooks/use-t";

interface SmsLogPanelProps {
  onClose: () => void;
}

export function SmsLogPanel({ onClose }: SmsLogPanelProps) {
  const { entries, clearLog } = useSmsLogStore();
  const t = useT();

  return (
    <div className="absolute right-0 top-full mt-2 z-50 w-96 max-h-[70vh] rounded-2xl bg-shopbox-card border border-shopbox-border shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-shopbox-border">
          <h2 className="text-lg font-bold text-shopbox-text">{t("smsLog.title")}</h2>
          <div className="flex items-center gap-2">
            {entries.length > 0 && (
              <button
                onClick={clearLog}
                className="rounded-lg px-3 py-1 text-xs font-medium text-shopbox-muted hover:text-shopbox-text hover:bg-shopbox-surface transition-colors"
              >
                {t("smsLog.clear")}
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-shopbox-muted hover:text-shopbox-text hover:bg-shopbox-surface transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {entries.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-shopbox-muted text-sm">
              {t("smsLog.empty")}
            </div>
          ) : (
            <div className="divide-y divide-shopbox-border/50">
              {entries.map((entry) => (
                <div key={entry.id} className="px-5 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${entry.success ? "bg-green-500" : "bg-red-500"}`} />
                      <span className="text-sm font-semibold text-shopbox-text">
                        {t("smsLog.order", { orderNumber: entry.orderNumber })}
                      </span>
                    </div>
                    <span className="text-xs text-shopbox-muted">
                      {new Date(entry.sentAt).toLocaleTimeString("da-DK", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-shopbox-text-secondary mt-1">{entry.phone}</p>
                  <p className="text-xs text-shopbox-muted mt-0.5 truncate">{entry.message}</p>
                  <button
                    onClick={() =>
                      sendOrderSms(entry.phone, entry.orderNumber, entry.orderId, entry.message)
                    }
                    className="mt-2 rounded-md bg-shopbox-accent/10 px-2.5 py-1 text-[11px] font-medium text-shopbox-accent hover:bg-shopbox-accent/20 transition-colors"
                  >
                    {t("smsLog.resend")}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
    </div>
  );
}
