"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useSettingsStore } from "@/stores/settings-store";
import { useT } from "@/hooks/use-t";
import { LanguageToggle } from "@/components/language-toggle";
import { SessionGuard } from "@/components/session-guard";
import type { RemoteSettings } from "@/types/settings";

type SortOrder = "oldest" | "newest";

export default function SettingsPage() {
  return (
    <SessionGuard>
      <SettingsPageContent />
    </SessionGuard>
  );
}

function SettingsPageContent() {
  const settings = useSettingsStore();
  const t = useT();
  const loadedRef = useRef(false);
  
  const [draft, setDraft] = useState<Partial<RemoteSettings>>({});
  const [sortDraft, setSortDraft] = useState<SortOrder | null>(null);

  useEffect(() => {
    if (!loadedRef.current) {
      loadedRef.current = true;
      void settings.loadFromShopbox();
    }
  }, [settings]);

  // Show the form as soon as we have settings (cache or network).
  const remote = settings.remote;
  const showForm = remote !== null;

  const hasChanges = useMemo(() => {
    if (!remote) return false;
    const remoteChanged = Object.keys(draft).some((key) => {
      const k = key as keyof RemoteSettings;
      return draft[k] !== remote[k];
    });
    const sortChanged = sortDraft !== null && sortDraft !== settings.sortOrder;
    return remoteChanged || sortChanged;
  }, [draft, remote, sortDraft, settings.sortOrder]);

  const updateDraft = <K extends keyof RemoteSettings>(key: K, value: RemoteSettings[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const getValue = <K extends keyof RemoteSettings>(key: K): RemoteSettings[K] => {
    return (draft[key] !== undefined ? draft[key]! : remote![key]);
  };

  const getSortOrder = (): SortOrder => sortDraft ?? settings.sortOrder;

  const handleSave = async () => {
    const updates: Partial<RemoteSettings> = { ...draft };
    if (sortDraft !== null) {
      updates.orderSorting = sortDraft === "newest" ? "newest_first" : "oldest_first";
      settings.updateSettings({ sortOrder: sortDraft });
    }

    const success = await settings.saveToShopbox(updates);
    if (success) {
      setDraft({});
      setSortDraft(null);
    }
  };

  const handleDiscard = () => {
    setDraft({});
    setSortDraft(null);
  };

  return (
    <div className="min-h-screen bg-shopbox-surface p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-shopbox-text">{t("settings.title")}</h1>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <Link
              href="/kds"
              className="rounded-lg bg-shopbox-card border border-shopbox-border px-4 py-2 text-sm font-medium text-shopbox-text hover:bg-shopbox-card-hover transition-colors"
            >
              {t("settings.backToKds")}
            </Link>
          </div>
        </div>

        {!showForm ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-shopbox-text-secondary">{t("settings.loading")}</div>
          </div>
        ) : (
          <>
        {settings.error && (
          <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/30 p-4 text-sm text-red-400">
            {settings.error}
          </div>
        )}

        {/* Display */}
        <section className="mb-6 rounded-2xl bg-shopbox-card border border-shopbox-border p-5">
          <h2 className="text-lg font-semibold mb-4">{t("settings.display")}</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-shopbox-text-secondary mb-2">
                {t("settings.sorting")}
              </label>
              <div className="flex gap-2">
                <button
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    getSortOrder() === "oldest"
                      ? "bg-shopbox-accent text-white"
                      : "bg-shopbox-surface text-shopbox-text-secondary hover:bg-shopbox-card-hover"
                  }`}
                  onClick={() => setSortDraft("oldest")}
                >
                  {t("header.sort.oldestTitle")}
                </button>
                <button
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    getSortOrder() === "newest"
                      ? "bg-shopbox-accent text-white"
                      : "bg-shopbox-surface text-shopbox-text-secondary hover:bg-shopbox-card-hover"
                  }`}
                  onClick={() => setSortDraft("newest")}
                >
                  {t("header.sort.newestTitle")}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Timer thresholds */}
        <section className="mb-6 rounded-2xl bg-shopbox-card border border-shopbox-border p-5">
          <h2 className="text-lg font-semibold mb-4">{t("settings.timers")}</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-shopbox-text-secondary mb-2">
                {t("settings.timer.warning", { min: Math.floor(getValue("timerWarningSeconds") / 60) })}
              </label>
              <input
                type="range"
                min={60}
                max={900}
                step={30}
                value={getValue("timerWarningSeconds")}
                onChange={(e) => updateDraft("timerWarningSeconds", Number(e.target.value))}
                className="w-full accent-shopbox-warning"
              />
            </div>

            <div>
              <label className="block text-sm text-shopbox-text-secondary mb-2">
                {t("settings.timer.critical", { min: Math.floor(getValue("timerCriticalSeconds") / 60) })}
              </label>
              <input
                type="range"
                min={120}
                max={1800}
                step={30}
                value={getValue("timerCriticalSeconds")}
                onChange={(e) => updateDraft("timerCriticalSeconds", Number(e.target.value))}
                className="w-full accent-shopbox-critical"
              />
            </div>

            <div>
              <label className="block text-sm text-shopbox-text-secondary mb-2">
                {t("settings.timer.autoDismiss", { value: getValue("autoDismissReadySeconds") === 0 ? t("settings.timer.disabled") : `${Math.floor(getValue("autoDismissReadySeconds") / 60)} min` })}
              </label>
              <input
                type="range"
                min={0}
                max={600}
                step={60}
                value={getValue("autoDismissReadySeconds")}
                onChange={(e) => updateDraft("autoDismissReadySeconds", Number(e.target.value))}
                className="w-full accent-shopbox-accent"
              />
              <div className="relative h-4 text-xs text-shopbox-muted mt-1">
                <span className="absolute left-0">{t("settings.timer.off")}</span>
                {/* Positions match 0–600s: 2min=20%, 5min=50%, 10min=100% */}
                <span className="absolute left-[20%] -translate-x-1/2">2 min</span>
                <span className="absolute left-1/2 -translate-x-1/2">5 min</span>
                <span className="absolute right-0">10 min</span>
              </div>
              <p className="text-xs text-shopbox-muted mt-1">
                {t("settings.timer.helper")}
              </p>
            </div>
          </div>
        </section>

        {/* Order flow */}
        <section className="mb-6 rounded-2xl bg-shopbox-card border border-shopbox-border p-5">
          <h2 className="text-lg font-semibold mb-4">{t("settings.orderFlow")}</h2>
          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={getValue("showItemCheckmarks")}
                onChange={(e) => updateDraft("showItemCheckmarks", e.target.checked)}
                className="h-5 w-5 rounded accent-shopbox-accent mt-0.5"
              />
              <div>
                <span className="text-sm font-medium">{t("settings.checkmarks")}</span>
                <p className="text-xs text-shopbox-muted mt-0.5">
                  {t("settings.checkmarks.helper")}
                </p>
              </div>
            </label>

            <label className={`flex items-start gap-3 cursor-pointer ${!getValue("showItemCheckmarks") ? "opacity-40 pointer-events-none" : ""}`}>
              <input
                type="checkbox"
                checked={getValue("autoAdvanceWhenAllDone")}
                onChange={(e) => updateDraft("autoAdvanceWhenAllDone", e.target.checked)}
                className="h-5 w-5 rounded accent-shopbox-accent mt-0.5"
              />
              <div>
                <span className="text-sm font-medium">{t("settings.autoAdvance")}</span>
                <p className="text-xs text-shopbox-muted mt-0.5">
                  {t("settings.autoAdvance.helper")}
                </p>
              </div>
            </label>
          </div>
        </section>

        {/* Sound */}
        <section className="mb-6 rounded-2xl bg-shopbox-card border border-shopbox-border p-5">
          <h2 className="text-lg font-semibold mb-4">{t("settings.sound")}</h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={getValue("soundEnabled")}
              onChange={(e) => updateDraft("soundEnabled", e.target.checked)}
              className="h-5 w-5 rounded accent-shopbox-accent"
            />
            <span className="text-sm">{t("settings.sound.enable")}</span>
          </label>
        </section>

        {/* SMS */}
        <section className="mb-6 rounded-2xl bg-shopbox-card border border-shopbox-border p-5">
          <h2 className="text-lg font-semibold mb-4">{t("settings.sms")}</h2>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={getValue("smsEnabled")}
              onChange={(e) => updateDraft("smsEnabled", e.target.checked)}
              className="h-5 w-5 rounded accent-shopbox-accent mt-0.5"
            />
            <div>
              <span className="text-sm font-medium">{t("settings.sms.enable")}</span>
              <p className="text-xs text-shopbox-muted mt-0.5">
                {t("settings.sms.helper")}
              </p>
            </div>
          </label>
        </section>

        {/* Configuration */}
        <section className="mb-6 rounded-2xl bg-shopbox-card border border-shopbox-border p-5">
          <h2 className="text-lg font-semibold mb-4">{t("settings.configuration")}</h2>
          <Link
            href="/settings/design"
            className="block rounded-lg bg-shopbox-surface p-3 text-sm hover:bg-shopbox-card-hover transition-colors"
          >
            {t("settings.design")}
          </Link>
        </section>

        {/* Save bar */}
        {hasChanges && (
          <div className="fixed bottom-0 left-0 right-0 bg-shopbox-primary border-t border-shopbox-border p-4 safe-area-bottom">
            <div className="max-w-2xl mx-auto flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
              <span className="text-sm text-shopbox-text-secondary hidden sm:block">
                {t("settings.unsavedChanges")}
              </span>
              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={handleDiscard}
                  disabled={settings.isSaving}
                  className="flex-1 sm:flex-none rounded-lg px-4 py-3 sm:py-2 text-sm font-medium text-shopbox-text-secondary bg-shopbox-surface hover:bg-shopbox-card-hover transition-colors disabled:opacity-50"
                >
                  {t("settings.discard")}
                </button>
                <button
                  onClick={handleSave}
                  disabled={settings.isSaving}
                  className="flex-1 sm:flex-none rounded-lg bg-shopbox-accent px-6 py-3 sm:py-2 text-sm font-medium text-white hover:bg-shopbox-accent/80 transition-colors disabled:opacity-50"
                >
                  {settings.isSaving ? t("settings.saving") : t("settings.save")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom padding when save bar is visible */}
        {hasChanges && <div className="h-20" />}
          </>
        )}
      </div>
    </div>
  );
}
