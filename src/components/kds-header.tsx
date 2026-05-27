"use client";

import { useState } from "react";
import Link from "next/link";
import { useOrdersStore } from "@/stores/orders-store";
import { useStationStore } from "@/stores/station-store";
import { usePreOrdersStore } from "@/stores/pre-orders-store";
import { useSettingsStore } from "@/stores/settings-store";
import { useMvpStore } from "@/stores/mvp-store";
import { useSmsLogStore } from "@/stores/sms-log-store";
import { SmsLogPanel } from "./sms-log-panel";
import { cn } from "@/lib/cn";

export function KdsHeader() {
  const { undoDismiss, dismissedOrders } = useOrdersStore();
  const { stations, activeStationId, setActiveStation } = useStationStore();
  const { preOrders } = usePreOrdersStore();
  const { sortOrder, soundEnabled, viewMode, updateSettings } = useSettingsStore();
  const { isMvpMode } = useMvpStore();
  const { entries } = useSmsLogStore();
  const [showSmsLog, setShowSmsLog] = useState(false);

  return (
    <header className="flex items-center justify-between px-4 py-2 bg-shopbox-primary border-b border-shopbox-border">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-shopbox-accent">Shopbox KDS</h1>
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider"
          style={{
            backgroundColor: isMvpMode ? "rgba(34, 197, 94, 0.15)" : "rgba(249, 115, 22, 0.15)",
            color: isMvpMode ? "#22C55E" : "#F97316",
          }}
        >
          {isMvpMode ? "MVP" : "DEMO"}
        </span>

        {/* Station selector (MVP only) */}
        {isMvpMode && stations.length > 0 && (
          <div className="flex items-center gap-1 ml-2">
            <button
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                activeStationId === null
                  ? "bg-shopbox-accent text-white"
                  : "text-shopbox-text-secondary hover:bg-shopbox-card"
              )}
              onClick={() => setActiveStation(null)}
            >
              Alle
            </button>
            {stations.map((station) => (
              <button
                key={station.id}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                  activeStationId === station.id
                    ? "bg-shopbox-accent text-white"
                    : "text-shopbox-text-secondary hover:bg-shopbox-card"
                )}
                onClick={() => setActiveStation(station.id)}
              >
                {station.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* View mode toggle (MVP only — DEMO is grid only) */}
        {isMvpMode && (
          <button
            className="rounded-lg bg-shopbox-card px-3 py-1.5 text-sm font-medium text-shopbox-text-secondary hover:bg-shopbox-card-hover transition-colors"
            onClick={() =>
              updateSettings({
                viewMode: viewMode === "grid" ? "kanban" : viewMode === "kanban" ? "summary" : "grid",
              })
            }
            title={
              viewMode === "grid" ? "Skift til Kanban" : viewMode === "kanban" ? "Skift til Sammendrag" : "Skift til Gitter"
            }
          >
            {viewMode === "grid" ? "▥ Gitter" : viewMode === "kanban" ? "▤ Kanban" : "Σ Sammendrag"}
          </button>
        )}

        {/* Sort toggle */}
        <button
          className="rounded-lg bg-shopbox-card px-3 py-1.5 text-sm font-medium text-shopbox-text-secondary hover:bg-shopbox-card-hover transition-colors"
          onClick={() =>
            updateSettings({
              sortOrder: sortOrder === "oldest" ? "newest" : "oldest",
            })
          }
          title={sortOrder === "oldest" ? "Ældste først" : "Nyeste først"}
        >
          {sortOrder === "oldest" ? "↑ Ældste" : "↓ Nyeste"}
        </button>

        {/* Sound toggle */}
        <button
          className={cn(
            "rounded-lg px-2.5 py-1.5 text-sm transition-colors",
            soundEnabled
              ? "bg-shopbox-card text-shopbox-accent hover:bg-shopbox-card-hover"
              : "bg-shopbox-card text-shopbox-muted hover:bg-shopbox-card-hover"
          )}
          onClick={() => updateSettings({ soundEnabled: !soundEnabled })}
          title={soundEnabled ? "Lyd til" : "Lyd fra"}
        >
          {soundEnabled ? "🔔" : "🔕"}
        </button>

        {/* SMS log */}
        <button
          className="rounded-lg bg-shopbox-card px-3 py-1.5 text-sm font-medium text-shopbox-text-secondary hover:bg-shopbox-card-hover transition-colors"
          onClick={() => setShowSmsLog(true)}
          title="SMS-historik"
        >
          SMS {entries.length > 0 && `(${entries.length})`}
        </button>

        {/* Pre-orders (MVP only) */}
        {isMvpMode && (
          <Link
            href="/pre-orders"
            className="rounded-lg bg-shopbox-card px-3 py-1.5 text-sm font-medium text-shopbox-text-secondary hover:bg-shopbox-card-hover transition-colors"
          >
            Forudbestillinger ({preOrders.length})
          </Link>
        )}

        {/* Undo */}
        {dismissedOrders.length > 0 && (
          <button
            className="rounded-lg bg-shopbox-card px-3 py-1.5 text-sm font-medium text-shopbox-text-secondary hover:bg-shopbox-card-hover transition-colors"
            onClick={() => undoDismiss()}
          >
            ↩ Fortryd ({dismissedOrders.length})
          </button>
        )}

        {/* Customer display */}
        <Link
          href="/customer-display"
          className="rounded-lg bg-shopbox-card px-3 py-1.5 text-sm font-medium text-shopbox-text-secondary hover:bg-shopbox-card-hover transition-colors"
        >
          Kundeskærm
        </Link>

        {/* Settings */}
        <Link
          href="/settings"
          className="rounded-lg bg-shopbox-card px-3 py-1.5 text-sm font-medium text-shopbox-text-secondary hover:bg-shopbox-card-hover transition-colors"
        >
          ⚙ Indstillinger
        </Link>
      </div>
      {showSmsLog && <SmsLogPanel onClose={() => setShowSmsLog(false)} />}
    </header>
  );
}
