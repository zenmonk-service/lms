"use client";

import { useEffect } from "react";

const WARNING =
  "⚠️ You have unsaved changes!\n\nIf you leave this page, your changes will be lost.\n\nAre you sure you want to leave?";

export function useNavigationGuard(isDirty: boolean) {
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => isDirty && e.preventDefault();
    globalThis.addEventListener("beforeunload", handler);
    return () => globalThis.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  useEffect(() => {
    if (!isDirty) return;

    const handlePopState = () => {
      if (!globalThis.confirm(WARNING)) {
        globalThis.history.pushState(null, "", globalThis.location.href);
      }
    };

    const handleLinkClick = (event: MouseEvent) => {
      const link = (event.target as HTMLElement).closest("a[href]") as HTMLAnchorElement | null;
      if (!link?.href || link.href.includes("#")) return;
      const isInternal = link.href.startsWith(globalThis.location.origin) || link.href.startsWith("/");
      if (isInternal && !globalThis.confirm(WARNING)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    globalThis.addEventListener("popstate", handlePopState);
    globalThis.addEventListener("click", handleLinkClick, true);
    return () => {
      globalThis.removeEventListener("popstate", handlePopState);
      globalThis.removeEventListener("click", handleLinkClick, true);
    };
  }, [isDirty]);

  return { confirmNavigation: () => !isDirty || globalThis.confirm(WARNING) };
}