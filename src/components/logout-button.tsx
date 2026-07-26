"use client";

import { useT } from "@/hooks/use-t";
import { clearClientSessionAndRedirect } from "@/lib/clear-client-session";

export function LogoutButton() {
  const t = useT();

  return (
    <button
      type="button"
      onClick={clearClientSessionAndRedirect}
      className="cursor-pointer rounded-lg border border-shopbox-border bg-shopbox-card px-3 py-1.5 text-sm font-medium text-shopbox-text-secondary transition-colors hover:bg-shopbox-card-hover hover:text-shopbox-text"
    >
      {t("logout.label")}
    </button>
  );
}
