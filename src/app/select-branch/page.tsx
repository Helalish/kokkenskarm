"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SessionGuard } from "@/components/session-guard";
import { SetupShell } from "@/components/setup-shell";
import { useT } from "@/hooks/use-t";
import { resetBranchSession } from "@/lib/reset-branch-session";
import { fetchClientBranches } from "@/api/branches";
import { useAuthStore } from "@/stores/auth-store";
import type { ShopboxBranch } from "@/types/branch";

function LoadingSpinner({ label }: { label: string }) {
  return (
    <div className="flex flex-1 items-center justify-center py-16 text-shopbox-muted">
      <div className="text-center">
        <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-2 border-shopbox-accent border-t-transparent" />
        <p>{label}</p>
      </div>
    </div>
  );
}

function SelectBranchContent() {
  const t = useT();
  const router = useRouter();
  const selectedClientId = useAuthStore((state) => state.selectedClientId);
  const selectedClientName = useAuthStore((state) => state.selectedClientName);
  const selectBranch = useAuthStore((state) => state.selectBranch);
  const [branches, setBranches] = useState<ShopboxBranch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryVersion, setRetryVersion] = useState(0);
  const requestIdRef = useRef(0);

  const chooseBranch = useCallback(
    (branch: ShopboxBranch) => {
      resetBranchSession();
      selectBranch(branch);
      router.replace("/kds");
    },
    [router, selectBranch]
  );

  useEffect(() => {
    if (!selectedClientId) return;

    const requestId = ++requestIdRef.current;

    void fetchClientBranches(selectedClientId)
      .then((items) => {
        if (requestId !== requestIdRef.current) return;

        setBranches(items);
        setIsLoading(false);
      })
      .catch((caught) => {
        if (requestId !== requestIdRef.current) return;
        setError(caught instanceof Error ? caught.message : t("selection.error.generic"));
        setIsLoading(false);
      });
  }, [retryVersion, selectedClientId, t]);

  return (
    <SetupShell title={t("selection.branch.title")} subtitle={t("selection.branch.subtitle")}>
      <div className="mb-4 flex items-center justify-between gap-4 border-b border-shopbox-border pb-4">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-shopbox-muted">
            {t("selection.branch.client")}
          </p>
          <p className="truncate font-semibold text-shopbox-text">
            {selectedClientName || t("selection.branch.currentClient")}
          </p>
        </div>
        <Link
          href="/select-client?change=1"
          className="shrink-0 rounded-lg border border-shopbox-border bg-shopbox-surface px-3 py-2 text-sm font-medium text-shopbox-text-secondary transition hover:bg-shopbox-card-hover hover:text-shopbox-text"
        >
          {t("selection.branch.changeClient")}
        </Link>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 flex items-center justify-between gap-4 rounded-xl border border-shopbox-critical/40 bg-shopbox-critical/10 px-4 py-3 text-sm text-shopbox-critical"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => {
              setError(null);
              setIsLoading(true);
              setRetryVersion((version) => version + 1);
            }}
            className="shrink-0 cursor-pointer font-semibold underline underline-offset-2"
          >
            {t("selection.retry")}
          </button>
        </div>
      )}

      {isLoading ? (
        <LoadingSpinner label={t("selection.branch.loading")} />
      ) : branches.length === 0 ? (
        <div className="flex flex-1 items-center justify-center py-16 text-center">
          <div>
            <p className="text-lg font-semibold text-shopbox-text">
              {t("selection.branch.empty")}
            </p>
            <p className="mt-1 text-sm text-shopbox-muted">
              {t("selection.branch.emptyHint")}
            </p>
            <Link
              href="/select-client?change=1"
              className="mt-5 inline-block rounded-xl bg-shopbox-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
            >
              {t("selection.branch.changeClient")}
            </Link>
          </div>
        </div>
      ) : (
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
          {branches.map((branch) => (
            <button
              key={branch.id}
              type="button"
              onClick={() => chooseBranch(branch)}
              className="group flex w-full cursor-pointer items-center justify-between rounded-xl border border-shopbox-border bg-shopbox-surface px-4 py-3.5 text-left transition hover:border-shopbox-accent/60 hover:bg-shopbox-card-hover"
            >
              <span className="min-w-0">
                <span className="flex items-center gap-2">
                  <span className="truncate font-semibold text-shopbox-text">
                    {branch.name}
                  </span>
                  {branch.isClosed && (
                    <span className="shrink-0 rounded-full bg-shopbox-muted/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-shopbox-muted">
                      {t("selection.branch.closed")}
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block truncate text-xs text-shopbox-muted">
                  {branch.city
                    ? `${branch.city} · ${t("selection.branch.id", { id: branch.id })}`
                    : t("selection.branch.id", { id: branch.id })}
                </span>
              </span>
              <span className="ml-4 text-xl text-shopbox-muted transition group-hover:translate-x-0.5 group-hover:text-shopbox-accent">
                →
              </span>
            </button>
          ))}
        </div>
      )}
    </SetupShell>
  );
}

export default function SelectBranchPage() {
  return (
    <SessionGuard requireBranch={false}>
      <SelectBranchContent />
    </SessionGuard>
  );
}
