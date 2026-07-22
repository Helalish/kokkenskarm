"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useOrdersStore } from "@/stores/orders-store";
import { usePreOrdersStore } from "@/stores/pre-orders-store";
import { useSettingsStore } from "@/stores/settings-store";
import { useSmsLogStore } from "@/stores/sms-log-store";
import { SmsLogPanel } from "./sms-log-panel";
import { LanguageToggle } from "./language-toggle";
import { useT } from "@/hooks/use-t";
import { cn } from "@/lib/cn";

export function KdsHeader() {
  const { undoDismiss, dismissedOrders } = useOrdersStore();
  const { preOrders } = usePreOrdersStore();
  const viewMode = useSettingsStore((s) => s.viewMode);
  const sortOrder = useSettingsStore((s) => s.sortOrder);
  const remote = useSettingsStore((s) => s.remote);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const saveToShopbox = useSettingsStore((s) => s.saveToShopbox);
  const soundEnabled = remote?.soundEnabled ?? false;
  const loadHistory = useSmsLogStore((s) => s.loadHistory);
  const [showSmsLog, setShowSmsLog] = useState(false);
  const smsWrapperRef = useRef<HTMLDivElement>(null);
  const t = useT();

  // Close SMS dropdown on outside click + Esc.
  useEffect(() => {
    if (!showSmsLog) return;
    function handleMouseDown(e: MouseEvent) {
      if (smsWrapperRef.current && !smsWrapperRef.current.contains(e.target as Node)) {
        setShowSmsLog(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setShowSmsLog(false);
    }
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showSmsLog]);

  useEffect(() => {
    if (!showSmsLog) return;
    void loadHistory(10, { force: true });
  }, [showSmsLog, loadHistory]);

  return (
    <header className="flex items-center justify-between px-4 py-2 bg-shopbox-primary border-b border-shopbox-border">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-shopbox-text">{t("header.title")}</h1>
      </div>

      <div className="flex items-center gap-2">
        <button
            className="rounded-lg bg-shopbox-card px-3 py-1.5 text-sm font-medium text-shopbox-text-secondary hover:bg-shopbox-card-hover transition-colors"
            onClick={() =>
              updateSettings({
                viewMode: viewMode === "grid" ? "kanban" : viewMode === "kanban" ? "summary" : "grid",
              })
            }
            title={
              viewMode === "grid"
                ? t("header.view.kanbanTitle")
                : viewMode === "kanban"
                  ? t("header.view.summaryTitle")
                  : t("header.view.gridTitle")
            }
          >
            {viewMode === "grid"
              ? t("header.view.grid")
              : viewMode === "kanban"
                ? t("header.view.kanban")
                : t("header.view.summary")}
          </button>

        {/* Sort toggle — local UI only, not saved to Shopbox */}
        <button
          className="rounded-lg bg-shopbox-card px-3 py-1.5 text-sm font-medium text-shopbox-text-secondary hover:bg-shopbox-card-hover transition-colors"
          onClick={() =>
            updateSettings({
              sortOrder: sortOrder === "oldest" ? "newest" : "oldest",
            })
          }
          title={sortOrder === "oldest" ? t("header.sort.oldestTitle") : t("header.sort.newestTitle")}
        >
          {sortOrder === "oldest" ? t("header.sort.oldest") : t("header.sort.newest")}
        </button>

        {/* Sound toggle — persists to Shopbox */}
        <button
          className={cn(
            "rounded-lg px-2.5 py-1.5 text-sm transition-colors",
            soundEnabled
              ? "bg-shopbox-card text-shopbox-accent hover:bg-shopbox-card-hover"
              : "bg-shopbox-card text-shopbox-muted hover:bg-shopbox-card-hover"
          )}
          onClick={() => {
            const next = !soundEnabled;
            updateSettings({ soundEnabled: next });
            void saveToShopbox({ soundEnabled: next });
          }}
          title={soundEnabled ? t("header.sound.onTitle") : t("header.sound.offTitle")}
        >
          {soundEnabled ? "🔔" : "🔕"}
        </button>

        {/* SMS log (dropdown anchored to button) */}
        <div ref={smsWrapperRef} className="relative">
          <button
            className="rounded-lg bg-shopbox-card px-3 py-1.5 text-sm font-medium text-shopbox-text-secondary hover:bg-shopbox-card-hover transition-colors"
            onClick={() => setShowSmsLog((s) => !s)}
            title={t("header.smsLog.title")}
          >
            {t("header.smsButton")}
          </button>
          {showSmsLog && <SmsLogPanel onClose={() => setShowSmsLog(false)} />}
        </div>

        <Link
          href="/pre-orders"
          className="rounded-lg bg-shopbox-card px-3 py-1.5 text-sm font-medium text-shopbox-text-secondary hover:bg-shopbox-card-hover transition-colors"
        >
          {t("header.preOrders", { count: preOrders.length })}
        </Link>

        {/* Undo */}
        {dismissedOrders.length > 0 && (
          <button
            className="rounded-lg bg-shopbox-card px-3 py-1.5 text-sm font-medium text-shopbox-text-secondary hover:bg-shopbox-card-hover transition-colors"
            onClick={() => undoDismiss()}
          >
            {t("header.undo", { count: dismissedOrders.length })}
          </button>
        )}

        {/* Customer display */}
        <Link
          href="/customer-display"
          className="rounded-lg bg-shopbox-card px-3 py-1.5 text-sm font-medium text-shopbox-text-secondary hover:bg-shopbox-card-hover transition-colors"
        >
          {t("header.customerDisplay")}
        </Link>

        {/* Settings */}
        <Link
          href="/settings"
          className="rounded-lg bg-shopbox-card px-3 py-1.5 text-sm font-medium text-shopbox-text-secondary hover:bg-shopbox-card-hover transition-colors"
        >
          {t("header.settings")}
        </Link>

        {/* Language toggle */}
        <LanguageToggle />
      </div>
    </header>
  );
}
