"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useOrdersStore } from "@/stores/orders-store";
import { usePreOrdersStore } from "@/stores/pre-orders-store";
import { useSettingsStore } from "@/stores/settings-store";
import { useSmsLogStore } from "@/stores/sms-log-store";
import { useAuthStore } from "@/stores/auth-store";
import { SmsLogPanel } from "./sms-log-panel";
import { LanguageToggle } from "./language-toggle";
import { LogoutButton } from "./logout-button";
import { useT } from "@/hooks/use-t";
import { cn } from "@/lib/cn";

const toolbarButtonClass =
  "rounded-lg bg-shopbox-card px-3 py-1.5 text-sm font-medium text-shopbox-text-secondary transition-colors hover:bg-shopbox-card-hover";

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
  const selectedClientName = useAuthStore((s) => s.selectedClientName);
  const selectedBranchName = useAuthStore((s) => s.selectedBranchName);
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
    <header className="flex flex-col gap-2 border-b border-shopbox-border bg-shopbox-primary px-3 py-2 sm:px-4 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
      <div className="flex min-w-0 items-center gap-3 lg:gap-4">
        <h1 className="shrink-0 text-xl font-bold tracking-tight text-shopbox-accent sm:text-2xl">
          {t("header.title")}
        </h1>
        <div className="hidden h-8 w-px shrink-0 bg-shopbox-border sm:block" aria-hidden="true" />
        <Link
          href="/select-branch?change=1"
          title={
            selectedClientName && selectedBranchName
              ? `${selectedClientName} · ${selectedBranchName}`
              : t("header.changeRestaurant")
          }
          className="group flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-shopbox-accent/40 bg-shopbox-accent/10 px-3 py-1.5 transition hover:border-shopbox-accent hover:bg-shopbox-accent/20 lg:max-w-xs lg:flex-none"
        >
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-shopbox-text">
              {selectedBranchName || t("header.changeRestaurant")}
            </span>
            {selectedClientName && (
              <span className="block truncate text-[11px] text-shopbox-text-secondary">
                {selectedClientName}
              </span>
            )}
          </span>
          <span
            aria-hidden="true"
            className="shrink-0 text-shopbox-accent/70 transition group-hover:text-shopbox-accent"
          >
            ⇄
          </span>
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          className={toolbarButtonClass}
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
          className={toolbarButtonClass}
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
            className={toolbarButtonClass}
            onClick={() => setShowSmsLog((s) => !s)}
            title={t("header.smsLog.title")}
          >
            {t("header.smsButton")}
          </button>
          {showSmsLog && <SmsLogPanel onClose={() => setShowSmsLog(false)} />}
        </div>

        <Link href="/pre-orders" className={toolbarButtonClass}>
          {t("header.preOrders", { count: preOrders.length })}
        </Link>

        {/* Undo */}
        {dismissedOrders.length > 0 && (
          <button className={toolbarButtonClass} onClick={() => undoDismiss()}>
            {t("header.undo", { count: dismissedOrders.length })}
          </button>
        )}

        {/* Customer display */}
        <Link href="/customer-display" className={toolbarButtonClass}>
          {t("header.customerDisplay")}
        </Link>

        {/* Settings */}
        <Link href="/settings" className={toolbarButtonClass}>
          {t("header.settings")}
        </Link>

        {/* Language toggle */}
        <LanguageToggle />

        <LogoutButton />
      </div>
    </header>
  );
}
