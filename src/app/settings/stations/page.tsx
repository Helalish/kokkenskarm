"use client";

/**
 * Station settings (PLACEHOLDER).
 *
 * Kitchen stations (e.g. Grill / Salad) filter which product categories and
 * pipeline stages each KDS screen shows. That feature is NOT part of the
 * current implementation — we only pull and update order status from the
 * Shopbox KDS API.
 *
 * Keep this page minimal until station filtering is designed against real
 * backend product categories.
 */

import Link from "next/link";

export default function StationSettingsPage() {
  return (
    <div className="min-h-screen bg-shopbox-surface p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-shopbox-text">Stations</h1>
          <Link
            href="/settings"
            className="rounded-lg bg-shopbox-accent px-4 py-2 text-sm font-medium text-white hover:bg-shopbox-accent/80 transition-colors"
          >
            ← Back
          </Link>
        </div>

        <section className="rounded-2xl bg-shopbox-card border border-shopbox-border p-5">
          <p className="text-sm text-shopbox-text-secondary">
            Station configuration is not available yet. The current KDS release
            focuses on listing orders and updating status from Shopbox. This
            page will be expanded when multi-station filtering is implemented.
          </p>
        </section>
      </div>
    </div>
  );
}
