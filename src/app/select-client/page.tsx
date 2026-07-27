"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SessionGuard } from "@/components/session-guard";
import { SetupShell } from "@/components/setup-shell";
import { useT } from "@/hooks/use-t";
import { fetchMyClients } from "@/lib/shopbox-api";
import { resetBranchSession } from "@/lib/reset-branch-session";
import { useAuthStore } from "@/stores/auth-store";
import type { ShopboxClient } from "@/types/client";

const CLIENTS_PER_PAGE = 50;

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

function SelectClientContent() {
  const t = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const changeMode = searchParams.get("change") === "1";
  const selectClient = useAuthStore((state) => state.selectClient);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [clients, setClients] = useState<ShopboxClient[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryVersion, setRetryVersion] = useState(0);
  const requestIdRef = useRef(0);
  const scrollRootRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const chooseClient = useCallback(
    (client: ShopboxClient) => {
      resetBranchSession();
      selectClient(client);
      router.replace("/select-branch");
    },
    [router, selectClient]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const nextQuery = query.trim();
      if (nextQuery === debouncedQuery) return;

      setClients([]);
      setPage(1);
      setHasMore(false);
      setError(null);
      setIsLoading(true);
      setDebouncedQuery(nextQuery);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [debouncedQuery, query]);

  useEffect(() => {
    const requestId = ++requestIdRef.current;

    void fetchMyClients({
      page: 1,
      perPage: CLIENTS_PER_PAGE,
      keyword: debouncedQuery || undefined,
    })
      .then((result) => {
        if (requestId !== requestIdRef.current) return;

        if (!changeMode && !debouncedQuery && result.total === 1 && result.items[0]) {
          chooseClient(result.items[0]);
          return;
        }

        setClients(result.items);
        setHasMore(result.hasMore);
        setIsLoading(false);
      })
      .catch((caught) => {
        if (requestId !== requestIdRef.current) return;
        setError(caught instanceof Error ? caught.message : t("selection.error.generic"));
        setIsLoading(false);
      });
  }, [changeMode, chooseClient, debouncedQuery, retryVersion, t]);

  const loadMore = useCallback(async () => {
    if (isLoading || isLoadingMore || !hasMore) return;

    const requestId = requestIdRef.current;
    const nextPage = page + 1;
    setIsLoadingMore(true);
    setError(null);

    try {
      const result = await fetchMyClients({
        page: nextPage,
        perPage: CLIENTS_PER_PAGE,
        keyword: debouncedQuery || undefined,
      });
      if (requestId !== requestIdRef.current) return;

      setClients((current) => {
        const byId = new Map(current.map((client) => [client.id, client]));
        for (const client of result.items) byId.set(client.id, client);
        return Array.from(byId.values());
      });
      setPage(nextPage);
      setHasMore(result.hasMore);
    } catch (caught) {
      if (requestId !== requestIdRef.current) return;
      setError(caught instanceof Error ? caught.message : t("selection.error.generic"));
    } finally {
      if (requestId === requestIdRef.current) setIsLoadingMore(false);
    }
  }, [debouncedQuery, hasMore, isLoading, isLoadingMore, page, t]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const root = scrollRootRef.current;
    if (!sentinel || !root || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMore();
      },
      { root, rootMargin: "160px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  return (
    <SetupShell title={t("selection.client.title")} subtitle={t("selection.client.subtitle")}>
      <label className="sr-only" htmlFor="client-search">
        {t("selection.client.search")}
      </label>
      <div className="relative mb-4">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-shopbox-muted"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          id="client-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("selection.client.search")}
          autoFocus
          className="w-full rounded-xl border border-shopbox-border bg-shopbox-surface py-3 pl-12 pr-4 text-shopbox-text outline-none transition focus:border-shopbox-accent focus:ring-2 focus:ring-shopbox-accent/20"
        />
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
              if (clients.length > 0) {
                void loadMore();
                return;
              }
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
        <LoadingSpinner label={t("selection.client.loading")} />
      ) : clients.length === 0 ? (
        <div className="flex flex-1 items-center justify-center py-16 text-center">
          <div>
            <p className="text-lg font-semibold text-shopbox-text">
              {t("selection.client.empty")}
            </p>
            <p className="mt-1 text-sm text-shopbox-muted">
              {t("selection.client.emptyHint")}
            </p>
          </div>
        </div>
      ) : (
        <div ref={scrollRootRef} className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
          {clients.map((client) => (
            <button
              key={client.id}
              type="button"
              onClick={() => chooseClient(client)}
              className="group flex w-full cursor-pointer items-center justify-between rounded-xl border border-shopbox-border bg-shopbox-surface px-4 py-3.5 text-left transition hover:border-shopbox-accent/60 hover:bg-shopbox-card-hover"
            >
              <span className="min-w-0">
                <span className="block truncate font-semibold text-shopbox-text">
                  {client.name}
                </span>
                <span className="mt-0.5 block text-xs text-shopbox-muted">
                  {t("selection.client.id", { id: client.id })}
                </span>
              </span>
              <span className="ml-4 text-xl text-shopbox-muted transition group-hover:translate-x-0.5 group-hover:text-shopbox-accent">
                →
              </span>
            </button>
          ))}

          <div ref={sentinelRef} className="flex min-h-10 items-center justify-center py-2">
            {isLoadingMore && (
              <div className="flex items-center gap-2 text-sm text-shopbox-muted">
                <div className="size-4 animate-spin rounded-full border-2 border-shopbox-accent border-t-transparent" />
                {t("selection.client.loadingMore")}
              </div>
            )}
          </div>
        </div>
      )}
    </SetupShell>
  );
}

export default function SelectClientPage() {
  return (
    <SessionGuard requireClient={false} requireBranch={false}>
      <Suspense fallback={<LoadingSpinner label="Loading..." />}>
        <SelectClientContent />
      </Suspense>
    </SessionGuard>
  );
}
