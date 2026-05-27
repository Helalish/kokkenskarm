"use client";

import { useState } from "react";
import Link from "next/link";
import { useStationStore } from "@/stores/station-store";
import { usePipelineStore } from "@/stores/pipeline-store";
import { ALL_CATEGORIES } from "@/services/mock-data-service";
import { cn } from "@/lib/cn";

export default function StationSettingsPage() {
  const { stations, addStation, removeStation, updateStation } = useStationStore();
  const { stages } = usePipelineStore();
  const sortedStages = [...stages].sort((a, b) => a.sortOrder - b.sortOrder);

  const [newName, setNewName] = useState("");
  const [newCategories, setNewCategories] = useState<string[]>([]);
  const [newShowAll, setNewShowAll] = useState(false);
  const [newLockedStageId, setNewLockedStageId] = useState<string | null>(null);

  const handleAdd = () => {
    if (!newName.trim() || newCategories.length === 0) return;
    addStation(newName.trim(), newCategories, newShowAll, newLockedStageId);
    setNewName("");
    setNewCategories([]);
    setNewLockedStageId(null);
    setNewShowAll(false);
  };

  const toggleCategory = (category: string, stationId?: string) => {
    if (stationId) {
      const station = stations.find((s) => s.id === stationId);
      if (!station) return;
      const has = station.categoryFilters.includes(category);
      updateStation(stationId, {
        categoryFilters: has
          ? station.categoryFilters.filter((c) => c !== category)
          : [...station.categoryFilters, category],
      });
    } else {
      setNewCategories((prev) =>
        prev.includes(category)
          ? prev.filter((c) => c !== category)
          : [...prev, category]
      );
    }
  };

  return (
    <div className="min-h-screen bg-shopbox-surface p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-shopbox-text">Stationer</h1>
          <Link
            href="/settings"
            className="rounded-lg bg-shopbox-accent px-4 py-2 text-sm font-medium text-white hover:bg-shopbox-accent/80 transition-colors"
          >
            ← Tilbage
          </Link>
        </div>

        {/* Existing stations */}
        {stations.length > 0 && (
          <section className="mb-6 space-y-4">
            {stations.map((station) => (
              <div
                key={station.id}
                className="rounded-2xl bg-shopbox-card border border-shopbox-border p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <input
                    type="text"
                    value={station.name}
                    onChange={(e) => updateStation(station.id, { name: e.target.value })}
                    className="text-lg font-semibold bg-transparent text-shopbox-text border-b border-transparent focus:border-shopbox-accent outline-none"
                  />
                  <button
                    onClick={() => removeStation(station.id)}
                    className="rounded p-1.5 text-shopbox-critical hover:bg-shopbox-critical/20 transition-colors text-sm"
                  >
                    Slet
                  </button>
                </div>

                {/* Display mode */}
                <div className="mb-3">
                  <p className="text-xs text-shopbox-muted mb-2">Visning af varer:</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateStation(station.id, { showAllItems: false })}
                      className={cn(
                        "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                        !station.showAllItems
                          ? "bg-shopbox-accent text-white"
                          : "bg-shopbox-surface text-shopbox-text-secondary hover:bg-shopbox-card-hover"
                      )}
                    >
                      Kun valgte kategorier
                    </button>
                    <button
                      onClick={() => updateStation(station.id, { showAllItems: true })}
                      className={cn(
                        "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                        station.showAllItems
                          ? "bg-shopbox-accent text-white"
                          : "bg-shopbox-surface text-shopbox-text-secondary hover:bg-shopbox-card-hover"
                      )}
                    >
                      Alle varer (grå ud andre)
                    </button>
                  </div>
                  <p className="text-[10px] text-shopbox-muted mt-1">
                    {station.showAllItems
                      ? "Alle produkter vises, ikke-matchende er dæmpede"
                      : "Kun produkter fra valgte kategorier vises på kortet"}
                  </p>
                </div>

                {/* Locked stage */}
                <div className="mb-3">
                  <p className="text-xs text-shopbox-muted mb-2">Vis kun ordrer i stadie:</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => updateStation(station.id, { lockedStageId: null })}
                      className={cn(
                        "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                        station.lockedStageId === null
                          ? "bg-shopbox-accent text-white"
                          : "bg-shopbox-surface text-shopbox-text-secondary hover:bg-shopbox-card-hover"
                      )}
                    >
                      Alle stadier
                    </button>
                    {sortedStages.map((stage) => (
                      <button
                        key={stage.id}
                        onClick={() => updateStation(station.id, { lockedStageId: stage.id })}
                        className={cn(
                          "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                          station.lockedStageId === stage.id
                            ? "text-white"
                            : "bg-shopbox-surface text-shopbox-text-secondary hover:bg-shopbox-card-hover"
                        )}
                        style={station.lockedStageId === stage.id ? { backgroundColor: stage.color } : undefined}
                      >
                        {stage.name}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-shopbox-muted mt-1">
                    {station.lockedStageId
                      ? "Stationen viser kun ordrer i det valgte stadie"
                      : "Stationen viser ordrer i alle stadier"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-shopbox-muted mb-2">Kategorier:</p>
                  <div className="flex flex-wrap gap-2">
                    {ALL_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => toggleCategory(cat, station.id)}
                        className={cn(
                          "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                          station.categoryFilters.includes(cat)
                            ? "bg-shopbox-accent text-white"
                            : "bg-shopbox-surface text-shopbox-text-secondary hover:bg-shopbox-card-hover"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Add new station */}
        <section className="rounded-2xl bg-shopbox-card border border-shopbox-border p-5">
          <h2 className="text-lg font-semibold mb-4">Tilføj ny station</h2>

          <div className="space-y-4">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="Stationsnavn (f.eks. 'Burger Station')"
              className="w-full rounded-lg bg-shopbox-surface border border-shopbox-border px-4 py-2 text-sm text-shopbox-text placeholder:text-shopbox-muted outline-none focus:border-shopbox-accent"
            />

            {/* Display mode */}
            <div>
              <p className="text-xs text-shopbox-muted mb-2">Visning af varer:</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setNewShowAll(false)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                    !newShowAll
                      ? "bg-shopbox-accent text-white"
                      : "bg-shopbox-surface text-shopbox-text-secondary hover:bg-shopbox-card-hover"
                  )}
                >
                  Kun valgte kategorier
                </button>
                <button
                  onClick={() => setNewShowAll(true)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                    newShowAll
                      ? "bg-shopbox-accent text-white"
                      : "bg-shopbox-surface text-shopbox-text-secondary hover:bg-shopbox-card-hover"
                  )}
                >
                  Alle varer (grå ud andre)
                </button>
              </div>
              <p className="text-[10px] text-shopbox-muted mt-1">
                {newShowAll
                  ? "Alle produkter vises, ikke-matchende er dæmpede"
                  : "Kun produkter fra valgte kategorier vises på kortet"}
              </p>
            </div>

            {/* Locked stage */}
            <div>
              <p className="text-xs text-shopbox-muted mb-2">Vis kun ordrer i stadie:</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setNewLockedStageId(null)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                    newLockedStageId === null
                      ? "bg-shopbox-accent text-white"
                      : "bg-shopbox-surface text-shopbox-text-secondary hover:bg-shopbox-card-hover"
                  )}
                >
                  Alle stadier
                </button>
                {sortedStages.map((stage) => (
                  <button
                    key={stage.id}
                    onClick={() => setNewLockedStageId(stage.id)}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                      newLockedStageId === stage.id
                        ? "text-white"
                        : "bg-shopbox-surface text-shopbox-text-secondary hover:bg-shopbox-card-hover"
                    )}
                    style={newLockedStageId === stage.id ? { backgroundColor: stage.color } : undefined}
                  >
                    {stage.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-shopbox-muted mb-2">Vælg kategorier:</p>
              <div className="flex flex-wrap gap-2">
                {ALL_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                      newCategories.includes(cat)
                        ? "bg-shopbox-accent text-white"
                        : "bg-shopbox-surface text-shopbox-text-secondary hover:bg-shopbox-card-hover"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleAdd}
              disabled={!newName.trim() || newCategories.length === 0}
              className="rounded-lg bg-shopbox-accent px-4 py-2 text-sm font-medium text-white hover:bg-shopbox-accent/80 disabled:opacity-50 transition-colors"
            >
              Tilføj station
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
