"use client";

import Link from "next/link";
import { useSettingsStore } from "@/stores/settings-store";
import { useModeStore } from "@/stores/mode-store";
import { DEMO_STAGES } from "@/lib/demo-pipeline";
import { useT } from "@/hooks/use-t";
import { LanguageToggle } from "@/components/language-toggle";

export default function SettingsPage() {
  const settings = useSettingsStore();
  const isFullMode = useModeStore((s) => s.isFullMode);
  const t = useT();

  return (
    <div className="min-h-screen bg-shopbox-surface p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-shopbox-text">{t("settings.title")}</h1>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <Link
              href="/kds"
              className="rounded-lg bg-shopbox-accent px-4 py-2 text-sm font-medium text-white hover:bg-shopbox-accent/80 transition-colors"
            >
              {t("settings.backToKds")}
            </Link>
          </div>
        </div>

        {/* Display (Full feature only) */}
        {isFullMode && (
        <section className="mb-6 rounded-2xl bg-shopbox-card border border-shopbox-border p-5">
          <h2 className="text-lg font-semibold mb-4">{t("settings.display")}</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-shopbox-text-secondary mb-2">
                Antal kolonner: {settings.gridColumns}
              </label>
              <input
                type="range"
                min={2}
                max={6}
                value={settings.gridColumns}
                onChange={(e) => settings.updateSettings({ gridColumns: Number(e.target.value) })}
                className="w-full accent-shopbox-accent"
              />
              <div className="flex justify-between text-xs text-shopbox-muted mt-1">
                <span>2</span><span>3</span><span>4</span><span>5</span><span>6</span>
              </div>
            </div>

            <div>
              <label className="block text-sm text-shopbox-text-secondary mb-2">
                Tekststørrelse: {(settings.textScale * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min={80}
                max={150}
                value={settings.textScale * 100}
                onChange={(e) => settings.updateSettings({ textScale: Number(e.target.value) / 100 })}
                className="w-full accent-shopbox-accent"
              />
            </div>

            <div>
              <label className="block text-sm text-shopbox-text-secondary mb-2">
                Sortering
              </label>
              <div className="flex gap-2">
                <button
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    settings.sortOrder === "oldest"
                      ? "bg-shopbox-accent text-white"
                      : "bg-shopbox-surface text-shopbox-text-secondary hover:bg-shopbox-card-hover"
                  }`}
                  onClick={() => settings.updateSettings({ sortOrder: "oldest" })}
                >
                  Ældste først
                </button>
                <button
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    settings.sortOrder === "newest"
                      ? "bg-shopbox-accent text-white"
                      : "bg-shopbox-surface text-shopbox-text-secondary hover:bg-shopbox-card-hover"
                  }`}
                  onClick={() => settings.updateSettings({ sortOrder: "newest" })}
                >
                  Nyeste først
                </button>
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.scrollableCards}
                onChange={(e) => settings.updateSettings({ scrollableCards: e.target.checked })}
                className="h-5 w-5 rounded accent-shopbox-accent mt-0.5"
              />
              <div>
                <span className="text-sm font-medium">Scroll i ordre-bokse</span>
                <p className="text-xs text-shopbox-muted mt-0.5">
                  Begræns boksens højde og tilføj scroll. Slå fra for at vise hele ordren uden scroll.
                </p>
              </div>
            </label>
          </div>
        </section>
        )}

        {/* Timer thresholds */}
        <section className="mb-6 rounded-2xl bg-shopbox-card border border-shopbox-border p-5">
          <h2 className="text-lg font-semibold mb-4">{t("settings.timers")}</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-shopbox-text-secondary mb-2">
                {t("settings.timer.warning", { min: Math.floor(settings.timerWarningSeconds / 60) })}
              </label>
              <input
                type="range"
                min={60}
                max={900}
                step={30}
                value={settings.timerWarningSeconds}
                onChange={(e) => settings.updateSettings({ timerWarningSeconds: Number(e.target.value) })}
                className="w-full accent-shopbox-warning"
              />
            </div>

            <div>
              <label className="block text-sm text-shopbox-text-secondary mb-2">
                {t("settings.timer.critical", { min: Math.floor(settings.timerCriticalSeconds / 60) })}
              </label>
              <input
                type="range"
                min={120}
                max={1800}
                step={30}
                value={settings.timerCriticalSeconds}
                onChange={(e) => settings.updateSettings({ timerCriticalSeconds: Number(e.target.value) })}
                className="w-full accent-shopbox-critical"
              />
            </div>

            <div>
              <label className="block text-sm text-shopbox-text-secondary mb-2">
                {t("settings.timer.autoDismiss", { value: settings.autoDismissReadySeconds === 0 ? t("settings.timer.disabled") : `${Math.floor(settings.autoDismissReadySeconds / 60)} min` })}
              </label>
              <input
                type="range"
                min={0}
                max={600}
                step={30}
                value={settings.autoDismissReadySeconds}
                onChange={(e) => settings.updateSettings({ autoDismissReadySeconds: Number(e.target.value) })}
                className="w-full accent-shopbox-accent"
              />
              <div className="flex justify-between text-xs text-shopbox-muted mt-1">
                <span>{t("settings.timer.off")}</span><span>2 min</span><span>5 min</span><span>10 min</span>
              </div>
              <p className="text-xs text-shopbox-muted mt-1">
                {t("settings.timer.helper")}
              </p>
            </div>
          </div>
        </section>

        {/* Ordre-flow */}
        <section className="mb-6 rounded-2xl bg-shopbox-card border border-shopbox-border p-5">
          <h2 className="text-lg font-semibold mb-4">{t("settings.orderFlow")}</h2>
          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showItemCheckmarks}
                onChange={(e) => settings.updateSettings({ showItemCheckmarks: e.target.checked })}
                className="h-5 w-5 rounded accent-shopbox-accent mt-0.5"
              />
              <div>
                <span className="text-sm font-medium">{t("settings.checkmarks")}</span>
                <p className="text-xs text-shopbox-muted mt-0.5">
                  {t("settings.checkmarks.helper")}
                </p>
              </div>
            </label>

            <label className={`flex items-start gap-3 cursor-pointer ${!settings.showItemCheckmarks ? "opacity-40 pointer-events-none" : ""}`}>
              <input
                type="checkbox"
                checked={settings.autoAdvanceWhenAllDone}
                onChange={(e) => settings.updateSettings({ autoAdvanceWhenAllDone: e.target.checked })}
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
        {isFullMode && (
        <section className="mb-6 rounded-2xl bg-shopbox-card border border-shopbox-border p-5">
          <h2 className="text-lg font-semibold mb-4">Lyd</h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) => settings.updateSettings({ soundEnabled: e.target.checked })}
              className="h-5 w-5 rounded accent-shopbox-accent"
            />
            <span className="text-sm">Afspil lyd ved nye ordrer</span>
          </label>
        </section>
        )}

        {/* SMS */}
        <section className="mb-6 rounded-2xl bg-shopbox-card border border-shopbox-border p-5">
          <h2 className="text-lg font-semibold mb-4">{t("settings.sms")}</h2>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.smsEnabled}
              onChange={(e) => settings.updateSettings({ smsEnabled: e.target.checked })}
              className="h-5 w-5 rounded accent-shopbox-accent mt-0.5"
            />
            <div>
              <span className="text-sm font-medium">{t("settings.sms.enable")}</span>
              <p className="text-xs text-shopbox-muted mt-0.5">
                {isFullMode
                  ? "Vis SMS-knap på ordrekort og send automatisk SMS når ordrer skifter stadie. Konfigurér beskeder per stadie under Pipeline-stadier."
                  : t("settings.sms.helperDemo")}
              </p>
            </div>
          </label>
          {!isFullMode && (
            <div className="mt-4">
              <label className="block text-sm text-shopbox-text-secondary mb-1">
                {t("settings.sms.previewLabel")}
              </label>
              <input
                type="text"
                readOnly
                value={DEMO_STAGES[2].smsTemplate ?? ""}
                className="w-full rounded-lg bg-shopbox-surface border border-shopbox-border px-3 py-2 text-sm text-shopbox-text-secondary cursor-default outline-none"
              />
              <p className="text-xs text-shopbox-muted mt-1">
                {t("settings.sms.previewNote")}
              </p>
            </div>
          )}
        </section>

        {/* Links to sub-settings */}
        {isFullMode && (
        <section className="rounded-2xl bg-shopbox-card border border-shopbox-border p-5">
          <h2 className="text-lg font-semibold mb-4">Konfiguration</h2>
          <div className="space-y-2">
            <Link
              href="/settings/pipeline"
              className="block rounded-lg bg-shopbox-surface p-3 text-sm hover:bg-shopbox-card-hover transition-colors"
            >
              Pipeline-stadier →
            </Link>
            <Link
              href="/settings/stations"
              className="block rounded-lg bg-shopbox-surface p-3 text-sm hover:bg-shopbox-card-hover transition-colors"
            >
              Stationer →
            </Link>
            <Link
              href="/settings/design"
              className="block rounded-lg bg-shopbox-surface p-3 text-sm hover:bg-shopbox-card-hover transition-colors"
            >
              Design & Farver →
            </Link>
          </div>
        </section>
        )}
      </div>
    </div>
  );
}
