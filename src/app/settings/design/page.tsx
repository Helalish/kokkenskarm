"use client";

import Link from "next/link";
import { useSettingsStore, DEFAULT_THEME } from "@/stores/settings-store";
import { AuthGuard } from "@/components/auth-guard";
import type { ThemeColors } from "@/types/settings";
import { useT } from "@/hooks/use-t";

const THEME_FIELDS: { key: keyof ThemeColors; labelKey: string; descriptionKey: string }[] = [
  { key: "surface", labelKey: "design.field.surface.label", descriptionKey: "design.field.surface.description" },
  { key: "primary", labelKey: "design.field.primary.label", descriptionKey: "design.field.primary.description" },
  { key: "card", labelKey: "design.field.card.label", descriptionKey: "design.field.card.description" },
  { key: "cardHover", labelKey: "design.field.cardHover.label", descriptionKey: "design.field.cardHover.description" },
  { key: "border", labelKey: "design.field.border.label", descriptionKey: "design.field.border.description" },
  { key: "accent", labelKey: "design.field.accent.label", descriptionKey: "design.field.accent.description" },
  { key: "text", labelKey: "design.field.text.label", descriptionKey: "design.field.text.description" },
  { key: "textSecondary", labelKey: "design.field.textSecondary.label", descriptionKey: "design.field.textSecondary.description" },
  { key: "muted", labelKey: "design.field.muted.label", descriptionKey: "design.field.muted.description" },
];

const PRESETS: { nameKey: string; theme: ThemeColors }[] = [
  {
    nameKey: "design.preset.standard",
    theme: { ...DEFAULT_THEME },
  },
  {
    nameKey: "design.preset.night",
    theme: {
      surface: "#0A0A0A",
      primary: "#141414",
      card: "#1C1C1C",
      cardHover: "#282828",
      border: "#2A2A2A",
      accent: "#F59E0B",
      text: "#FAFAFA",
      textSecondary: "#A0A0A0",
      muted: "#666666",
    },
  },
  {
    nameKey: "design.preset.red",
    theme: {
      surface: "#0C0404",
      primary: "#1A0A0A",
      card: "#1F1010",
      cardHover: "#2A1515",
      border: "#3D2020",
      accent: "#EF4444",
      text: "#FFF1F1",
      textSecondary: "#D4A0A0",
      muted: "#8B5555",
    },
  },
  {
    nameKey: "design.preset.blue",
    theme: {
      surface: "#050A14",
      primary: "#0C1525",
      card: "#111D33",
      cardHover: "#1A2A45",
      border: "#253A5A",
      accent: "#3B82F6",
      text: "#F0F6FF",
      textSecondary: "#93B4E0",
      muted: "#5A7BA8",
    },
  },
  {
    nameKey: "design.preset.green",
    theme: {
      surface: "#032620",
      primary: "#043129",
      card: "#0A3D33",
      cardHover: "#0D4A3D",
      border: "#145A4A",
      accent: "#0E9E73",
      text: "#F0FDF9",
      textSecondary: "#A3C9BE",
      muted: "#6B9B8E",
    },
  },
];

export default function DesignSettingsPage() {
  return (
    <AuthGuard>
      <DesignSettingsPageContent />
    </AuthGuard>
  );
}

function DesignSettingsPageContent() {
  const t = useT();
  const { theme, updateTheme, resetTheme, textScale, updateSettings } = useSettingsStore();

  return (
    <div className="min-h-screen bg-shopbox-surface p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-shopbox-text">{t("design.title")}</h1>
          <Link
            href="/settings"
            className="rounded-lg bg-shopbox-accent px-4 py-2 text-sm font-medium text-white hover:bg-shopbox-accent/80 transition-colors"
          >
            {t("design.back")}
          </Link>
        </div>

        {/* Text scale */}
        <section className="mb-6 rounded-2xl bg-shopbox-card border border-shopbox-border p-5">
          <h2 className="text-lg font-semibold mb-4">{t("design.textScale")}</h2>
          <div>
            <label className="block text-sm text-shopbox-text-secondary mb-2">
              {t("design.size", { percent: (textScale * 100).toFixed(0) })}
            </label>
            <input
              type="range"
              min={70}
              max={150}
              step={5}
              value={textScale * 100}
              onChange={(e) => updateSettings({ textScale: Number(e.target.value) / 100 })}
              className="w-full accent-shopbox-accent"
            />
            <div className="relative h-4 text-xs text-shopbox-muted mt-1">
              <span className="absolute left-0">70%</span>
              {/* 100 sits at (100-70)/(150-70) = 37.5% of the track */}
              <span className="absolute left-[37.5%] -translate-x-1/2">100%</span>
              <span className="absolute right-0">150%</span>
            </div>
          </div>
          <p className="text-xs text-shopbox-muted mt-3">
            {t("design.textScaleHelper")}
          </p>
        </section>

        {/* Presets */}
        <section className="mb-6 rounded-2xl bg-shopbox-card border border-shopbox-border p-5">
          <h2 className="text-lg font-semibold mb-4">{t("design.presets")}</h2>
          <div className="grid grid-cols-2 gap-3">
            {PRESETS.map((preset) => (
              <button
                key={preset.nameKey}
                onClick={() => updateTheme(preset.theme)}
                className="rounded-xl border border-shopbox-border p-3 text-left hover:border-shopbox-accent/50 transition-colors"
              >
                <div className="flex gap-1.5 mb-2">
                  {[preset.theme.surface, preset.theme.primary, preset.theme.card, preset.theme.accent].map(
                    (color, i) => (
                      <div
                        key={i}
                        className="h-6 w-6 rounded-md border border-white/10"
                        style={{ backgroundColor: color }}
                      />
                    )
                  )}
                </div>
                <p className="text-xs font-medium">{t(preset.nameKey)}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Individual color pickers */}
        <section className="mb-6 rounded-2xl bg-shopbox-card border border-shopbox-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{t("design.colors")}</h2>
            <button
              onClick={resetTheme}
              className="text-xs text-shopbox-accent hover:underline"
            >
              {t("design.reset")}
            </button>
          </div>

          <div className="space-y-3">
            {THEME_FIELDS.map(({ key, labelKey, descriptionKey }) => (
              <label key={key} className="flex items-center gap-4 cursor-pointer rounded-xl p-2 -mx-2 hover:bg-shopbox-surface/50 transition-colors">
                <div
                  className="relative h-12 w-12 shrink-0 rounded-xl border-2 border-shopbox-border shadow-inner overflow-hidden"
                  style={{ backgroundColor: theme[key] }}
                >
                  <input
                    type="color"
                    value={theme[key]}
                    onChange={(e) => updateTheme({ [key]: e.target.value })}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{t(labelKey)}</p>
                  <p className="text-xs text-shopbox-muted">{t(descriptionKey)}</p>
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* Live preview */}
        <section className="rounded-2xl bg-shopbox-card border border-shopbox-border p-5">
          <h2 className="text-lg font-semibold mb-4">{t("design.livePreview")}</h2>
          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: theme.surface }}
          >
            <div
              className="rounded-lg p-3 mb-3"
              style={{ backgroundColor: theme.primary, borderBottom: `1px solid ${theme.border}` }}
            >
              <span className="text-sm font-bold" style={{ color: theme.accent }}>
                Shopbox KDS
              </span>
            </div>
            <div
              className="rounded-xl p-3 border"
              style={{
                backgroundColor: theme.card,
                borderColor: theme.border,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold" style={{ color: theme.text }}>
                  #142
                </span>
                <span
                  className="rounded-md px-1.5 py-0.5 text-[10px] font-bold text-white"
                  style={{ backgroundColor: theme.accent }}
                >
                  POS
                </span>
              </div>
              <p className="text-xs" style={{ color: theme.textSecondary }}>
                {t("design.previewItem")}
              </p>
              <p className="text-xs" style={{ color: theme.muted }}>
                {t("design.previewMods")}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
