"use client";

import { useEffect, useRef } from "react";

const WARNING = "You have unsaved changes!";

export function useNavigationGuard(isDirty: boolean) {
  const isDirtyRef = useRef(isDirty);
  isDirtyRef.current = isDirty;

  // beforeunload: only needs to be wired once, reads latest value via ref
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isDirtyRef.current) return;
      e.preventDefault();
      e.returnValue = ""; // some browsers still need this set explicitly
    };
    globalThis.addEventListener("beforeunload", handleBeforeUnload);
    return () => globalThis.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  useEffect(() => {
    let ignoreNextPopstate = false;

    const handlePopState = () => {
      if (ignoreNextPopstate) {
        ignoreNextPopstate = false;
        return;
      }
      if (!isDirtyRef.current) return;

      if (!globalThis.confirm(WARNING)) {
        // the back/forward nav already happened — undo it by moving forward again
        ignoreNextPopstate = true;
        globalThis.history.forward();
      }
    };

    const handleLinkClick = (event: MouseEvent) => {
      if (!isDirtyRef.current) return;
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const link = (event.target as HTMLElement).closest("a[href]") as HTMLAnchorElement | null;
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;

      const url = new URL(link.href, globalThis.location.href);
      const isSamePageHash = url.pathname === globalThis.location.pathname && !!url.hash;
      const isInternal = url.origin === globalThis.location.origin;
      if (!isInternal || isSamePageHash) return;

      if (!globalThis.confirm(WARNING)) {
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
  }, []);

  return {
    confirmNavigation: () => !isDirtyRef.current || globalThis.confirm(WARNING),
  };
}