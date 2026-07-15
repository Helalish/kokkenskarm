"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useOrdersStore } from "@/stores/orders-store";
import { usePipeline } from "@/hooks/use-pipeline";
import { useSettingsStore } from "@/stores/settings-store";
import { playNewOrderSound } from "@/services/audio-service";
import { useT } from "@/hooks/use-t";
import { LanguageToggle } from "@/components/language-toggle";

function Clock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <span className="text-shopbox-text-secondary font-medium tabular-nums">
      {time.toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" })}
    </span>
  );
}

function OrderNumberTile({
  orderNumber,
  className,
  numberClassName,
}: {
  orderNumber: number;
  className?: string;
  numberClassName?: string;
}) {
  return (
    <div
      className={`rounded-2xl border p-3 text-center sm:p-5 order-card-enter ${className ?? ""}`}
    >
      <p
        className={`font-black tracking-tight tabular-nums leading-none whitespace-nowrap text-[clamp(1.75rem,5vw,3rem)] ${numberClassName ?? ""}`}
      >
        {orderNumber}
      </p>
    </div>
  );
}

export default function CustomerDisplayPage() {
  const { orders } = useOrdersStore();
  const { stages } = usePipeline();
  const { soundEnabled } = useSettingsStore();
  const t = useT();
  const [recentlyReady, setRecentlyReady] = useState<Set<string>>(new Set());
  const prevOrdersRef = useRef<Map<string, string>>(new Map());

  // Track which orders just moved to "ready" for animation
  useEffect(() => {
    const terminalIds = new Set(stages.filter((s) => s.isTerminal).map((s) => s.id));
    const newReady = new Set<string>();

    for (const order of orders) {
      const prevStage = prevOrdersRef.current.get(order.id);
      if (terminalIds.has(order.currentStageId) && prevStage && !terminalIds.has(prevStage)) {
        newReady.add(order.id);
      }
    }

    // Update prev snapshot
    const snapshot = new Map<string, string>();
    for (const o of orders) snapshot.set(o.id, o.currentStageId);
    prevOrdersRef.current = snapshot;

    if (newReady.size > 0) {
      if (soundEnabled) playNewOrderSound();
      const showTimer = setTimeout(() => setRecentlyReady(newReady), 0);
      const clearTimer = setTimeout(() => setRecentlyReady(new Set()), 5000);
      return () => {
        clearTimeout(showTimer);
        clearTimeout(clearTimer);
      };
    }
  }, [orders, stages, soundEnabled]);

  // Separate orders
  const terminalStageIds = new Set(stages.filter((s) => s.isTerminal).map((s) => s.id));
  const inProgressOrders = orders.filter((o) => !terminalStageIds.has(o.currentStageId));
  const readyOrders = orders.filter((o) => terminalStageIds.has(o.currentStageId));

  return (
    <div className="flex flex-col h-screen bg-black overflow-hidden select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-shopbox-accent tracking-tight">Shopbox</h1>
          <span className="text-sm text-shopbox-muted">{t("customer.orderStatus")}</span>
        </div>
        <div className="flex items-center gap-4">
          <Clock />
          <LanguageToggle />
          <Link
            href="/kds"
            className="text-[10px] text-white/20 hover:text-white/40 transition-colors"
          >
            KDS
          </Link>
        </div>
      </div>

      {/* Main content — two columns */}
      <div className="flex-1 flex overflow-hidden">

        {/* Under tilberedning */}
        <div className="flex-1 flex flex-col border-r border-white/10">
          <div className="px-8 py-5">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-shopbox-warning animate-pulse" />
              <h2 className="text-xl font-bold text-white uppercase tracking-widest">
                {t("customer.preparing")}
              </h2>
            </div>
          </div>

          <div className="flex-1 overflow-auto px-4 pb-6 sm:px-8 sm:pb-8">
            <div className="grid gap-3 sm:gap-4 grid-cols-[repeat(auto-fill,minmax(min(100%,250px),1fr))]">
              {inProgressOrders.map((order) => (
                <OrderNumberTile
                  key={order.id}
                  orderNumber={order.orderNumber}
                  className="bg-white/5 border-white/10"
                  numberClassName="text-white"
                />
              ))}
            </div>
            {inProgressOrders.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <p className="text-white/30 text-lg">{t("customer.preparingEmpty")}</p>
              </div>
            )}
          </div>
        </div>

        {/* Klar til afhentning */}
        <div className="flex-1 flex flex-col bg-shopbox-accent/5">
          <div className="px-8 py-5">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-shopbox-accent" />
              <h2 className="text-xl font-bold text-shopbox-accent uppercase tracking-widest">
                {t("customer.ready")}
              </h2>
            </div>
          </div>

          <div className="flex-1 overflow-auto px-4 pb-6 sm:px-8 sm:pb-8">
            <div className="grid gap-3 sm:gap-4 grid-cols-[repeat(auto-fill,minmax(min(100%,250px),1fr))]">
              {readyOrders.map((order) => {
                const isNew = recentlyReady.has(order.id);
                return (
                  <OrderNumberTile
                    key={order.id}
                    orderNumber={order.orderNumber}
                    className={`transition-all duration-500 ${
                      isNew
                        ? "bg-shopbox-accent/20 border-shopbox-accent scale-105 shadow-[0_0_30px_rgba(34,197,94,0.3)]"
                        : "bg-shopbox-accent/10 border-shopbox-accent/30"
                    }`}
                    numberClassName={isNew ? "text-shopbox-accent" : "text-white"}
                  />
                );
              })}
            </div>
            {readyOrders.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <p className="text-white/20 text-lg">{t("customer.readyEmpty")}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
