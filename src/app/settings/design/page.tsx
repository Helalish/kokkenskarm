"use client";

import Link from "next/link";
import { useSettingsStore, DEFAULT_THEME } from "@/stores/settings-store";
import type { ThemeColors } from "@/types/settings";

const THEME_FIELDS: { key: keyof ThemeColors; label: string; description: string }[] = [
  { key: "surface", label: "Baggrund", description: "Hovedbaggrund for hele skærmen" },
  { key: "primary", label: "Header", description: "Header og navigation baggrund" },
  { key: "card", label: "Kort", description: "Ordre-kort baggrund" },
  { key: "cardHover", label: "Kort hover", description: "Kort baggrund ved hover" },
  { key: "border", label: "Kant", description: "Kanter og skillelinjer" },
  { key: "accent", label: "Accent", description: "Primær accent-farve (knapper, badges)" },
  { key: "text", label: "Tekst", description: "Primær tekst-farve" },
  { key: "textSecondary", label: "Sekundær tekst", description: "Sekundær tekst-farve" },
  { key: "muted", label: "Dæmpet", description: "Dæmpet tekst og ikoner" },
];

const PRESETS: { name: string; theme: ThemeColors }[] = [
  {
    name: "Takeaway (Standard)",
    theme: { ...DEFAULT_THEME },
  },
  {
    name: "Nattkøkken",
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
    name: "Hurtig & Rød",
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
    name: "Blå Kontrast",
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
    name: "Shopbox Grøn",
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
  const { theme, updateTheme, resetTheme, textScale, updateSettings } = useSettingsStore();

  return (
    <div className="min-h-screen bg-shopbox-surface p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-shopbox-text">Design</h1>
          <Link
            href="/settings"
            className="rounded-lg bg-shopbox-accent px-4 py-2 text-sm font-medium text-white hover:bg-shopbox-accent/80 transition-colors"
          >
            ← Tilbage
          </Link>
        </div>

        {/* Text scale */}
        <section className="mb-6 rounded-2xl bg-shopbox-card border border-shopbox-border p-5">
          <h2 className="text-lg font-semibold mb-4">Tekststørrelse</h2>
          <div>
            <label className="block text-sm text-shopbox-text-secondary mb-2">
              Størrelse: {(textScale * 100).toFixed(0)}%
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
            <div className="flex justify-between text-xs text-shopbox-muted mt-1">
              <span>70%</span>
              <span>100%</span>
              <span>150%</span>
            </div>
          </div>
          <p className="text-xs text-shopbox-muted mt-3">
            Påvirker al tekst i KDS i realtid. Juster efter skærmstørrelse og afstand.
          </p>
        </section>

        {/* Presets */}
        <section className="mb-6 rounded-2xl bg-shopbox-card border border-shopbox-border p-5">
          <h2 className="text-lg font-semibold mb-4">Farveskabeloner</h2>
          <div className="grid grid-cols-2 gap-3">
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
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
                <p className="text-xs font-medium">{preset.name}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Individual color pickers */}
        <section className="mb-6 rounded-2xl bg-shopbox-card border border-shopbox-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Farver</h2>
            <button
              onClick={resetTheme}
              className="text-xs text-shopbox-accent hover:underline"
            >
              Nulstil til standard
            </button>
          </div>

          <div className="space-y-3">
            {THEME_FIELDS.map(({ key, label, description }) => (
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
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-shopbox-muted">{description}</p>
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* Live preview */}
        <section className="rounded-2xl bg-shopbox-card border border-shopbox-border p-5">
          <h2 className="text-lg font-semibold mb-4">Live preview</h2>
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
                Classic Burger · Large
              </p>
              <p className="text-xs" style={{ color: theme.muted }}>
                Extra cheese, No onions
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
