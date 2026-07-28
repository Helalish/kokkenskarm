"use client";

import { useToastStore } from "@/stores/toast-store";
import { cn } from "@/lib/cn";

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm animate-in slide-in-from-right",
            toast.type === "sms" && "bg-shopbox-accent/90 border-shopbox-accent text-white",
            toast.type === "info" && "bg-shopbox-primary/95 border-shopbox-border text-shopbox-text"
          )}
          style={{
            animation: "slideIn 0.3s ease-out",
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {toast.type === "sms" && <span className="text-base">💬</span>}
                <p className="text-sm font-medium">{toast.message}</p>
              </div>
              {toast.detail && (
                <p className={cn(
                  "text-xs mt-0.5",
                  toast.type === "sms" ? "text-white/80" : "text-shopbox-text-secondary"
                )}>
                  {toast.detail}
                </p>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className={cn(
                "text-xs opacity-60 hover:opacity-100 transition-opacity shrink-0",
                toast.type === "sms" ? "text-white" : "text-shopbox-muted"
              )}
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
