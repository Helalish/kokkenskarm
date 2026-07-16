"use client";

import { useState } from "react";
import Link from "next/link";
import { usePipelineStore } from "@/stores/pipeline-store";
import { cn } from "@/lib/cn";
import { useT } from "@/hooks/use-t";

const PRESET_COLORS = [
  "#6792F4", "#F79009", "#00AE66", "#6366F1",
  "#8B5CF6", "#EC4899", "#EF4444", "#06B6D4",
];

export default function PipelineSettingsPage() {
  const t = useT();
  const { stages, addStage, removeStage, updateStage, reorderStages } = usePipelineStore();
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);

  const sortedStages = [...stages].sort((a, b) => a.sortOrder - b.sortOrder);

  const handleAdd = () => {
    if (!newName.trim()) return;
    addStage(newName.trim(), newColor);
    setNewName("");
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const reordered = [...sortedStages];
    [reordered[index - 1], reordered[index]] = [reordered[index], reordered[index - 1]];
    reorderStages(reordered);
  };

  const handleMoveDown = (index: number) => {
    if (index >= sortedStages.length - 1) return;
    const reordered = [...sortedStages];
    [reordered[index], reordered[index + 1]] = [reordered[index + 1], reordered[index]];
    reorderStages(reordered);
  };

  return (
    <div className="min-h-screen bg-shopbox-surface p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-shopbox-text">{t("pipeline.title")}</h1>
          <Link
            href="/settings"
            className="rounded-lg bg-shopbox-accent px-4 py-2 text-sm font-medium text-white hover:bg-shopbox-accent/80 transition-colors"
          >
            {t("pipeline.back")}
          </Link>
        </div>

        {/* Existing stages */}
        <section className="mb-6 rounded-2xl bg-shopbox-card border border-shopbox-border p-5">
          <h2 className="text-lg font-semibold mb-4">
            {t("pipeline.active", { count: sortedStages.length })}
          </h2>

          {sortedStages.length === 0 ? (
            <p className="text-shopbox-muted text-sm">
              {t("pipeline.empty")}
            </p>
          ) : (
            <div className="space-y-2">
              {sortedStages.map((stage, index) => (
                <div
                  key={stage.id}
                  className="flex items-center gap-3 rounded-lg bg-shopbox-surface p-3"
                >
                  <div
                    className="h-8 w-8 rounded-lg shrink-0"
                    style={{ backgroundColor: stage.color }}
                  />
                  <input
                    type="text"
                    value={stage.name}
                    onChange={(e) => updateStage(stage.id, { name: e.target.value })}
                    className="flex-1 bg-transparent text-shopbox-text border-b border-transparent focus:border-shopbox-accent outline-none text-sm"
                  />
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="rounded p-1 text-shopbox-muted hover:text-shopbox-text disabled:opacity-30 transition-colors"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={index >= sortedStages.length - 1}
                      className="rounded p-1 text-shopbox-muted hover:text-shopbox-text disabled:opacity-30 transition-colors"
                    >
                      ▼
                    </button>
                    <label className="flex items-center gap-1 text-xs text-shopbox-muted ml-2">
                      <input
                        type="checkbox"
                        checked={stage.smsEnabled ?? false}
                        onChange={(e) => updateStage(stage.id, { smsEnabled: e.target.checked })}
                        className="accent-shopbox-accent"
                      />
                      {t("pipeline.sms")}
                    </label>
                    <button
                      onClick={() => removeStage(stage.id)}
                      className="rounded p-1 text-shopbox-critical hover:bg-shopbox-critical/20 transition-colors ml-2"
                    >
                      ✕
                    </button>
                  </div>
                  {stage.smsEnabled && (
                    <div className="mt-2 ml-11">
                      <textarea
                        rows={3}
                        value={stage.smsTemplate ?? ""}
                        onChange={(e) => updateStage(stage.id, { smsTemplate: e.target.value })}
                        placeholder={t("pipeline.smsPlaceholder")}
                        className="w-full rounded-lg bg-shopbox-card border border-shopbox-border px-3 py-2 text-sm text-shopbox-text outline-none focus:border-shopbox-accent resize-y"
                      />
                      <p className="text-[10px] text-shopbox-muted mt-0.5">
                        {t("pipeline.smsHelp")}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Add new stage */}
        <section className="rounded-2xl bg-shopbox-card border border-shopbox-border p-5">
          <h2 className="text-lg font-semibold mb-4">{t("pipeline.addTitle")}</h2>

          <div className="space-y-4">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder={t("pipeline.namePlaceholder")}
              className="w-full rounded-lg bg-shopbox-surface border border-shopbox-border px-4 py-2 text-sm text-shopbox-text placeholder:text-shopbox-muted outline-none focus:border-shopbox-accent"
            />

            <div>
              <label className="block text-sm text-shopbox-text-secondary mb-2">{t("pipeline.color")}</label>
              <div className="flex gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    className={cn(
                      "h-8 w-8 rounded-lg transition-transform",
                      newColor === color && "ring-2 ring-white ring-offset-2 ring-offset-shopbox-card scale-110"
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewColor(color)}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={handleAdd}
              disabled={!newName.trim()}
              className="rounded-lg bg-shopbox-accent px-4 py-2 text-sm font-medium text-white hover:bg-shopbox-accent/80 disabled:opacity-50 transition-colors"
            >
              {t("pipeline.add")}
            </button>
          </div>
        </section>

        {/* Visual pipeline preview */}
        {sortedStages.length > 0 && (
          <section className="mt-6 rounded-2xl bg-shopbox-card border border-shopbox-border p-5">
            <h2 className="text-lg font-semibold mb-4">{t("pipeline.flow")}</h2>
            <div className="flex items-center gap-2 overflow-x-auto">
              {sortedStages.map((stage, index) => (
                <div key={stage.id} className="flex items-center gap-2 shrink-0">
                  <div
                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-white"
                    style={{ backgroundColor: stage.color }}
                  >
                    {stage.name}
                    {index === sortedStages.length - 1 && " ✓"}
                  </div>
                  {index < sortedStages.length - 1 && (
                    <span className="text-shopbox-muted">→</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
