import { RefObject, useEffect, useRef } from "react";

interface AutoFillScrollOptions {
  /** Only true when another page exists and nothing is loading right now. */
  enabled: boolean;
  onLoadMore: () => void | Promise<void>;
  /** Changes whenever loaded content changes (e.g. item count) so the check re-runs. */
  contentKey: number;
  /** Changes when the list is replaced (e.g. filter/search), clearing the repeat-request guard. */
  resetKey?: string | number;
}

/**
 * Infinite scroll only fires on scroll events, so when the loaded items don't fill
 * the container (zoomed-out page, tall screen, short first page) there is no
 * scrollbar and the next page never loads. This keeps loading pages until the
 * container overflows or everything is loaded, and re-checks on resize/zoom.
 */
export function useAutoFillScroll(
  containerRef: RefObject<HTMLElement | null>,
  { enabled, onLoadMore, contentKey, resetKey }: AutoFillScrollOptions,
) {
  const onLoadMoreRef = useRef(onLoadMore);
  onLoadMoreRef.current = onLoadMore;

  // Content size at the last auto-request; if a page added nothing we must not
  // keep asking for it in a loop.
  const requestedAtKeyRef = useRef<number | null>(null);

  // A smaller key means the list was reset (filter/search changed, first page
  // re-fetched). Forget the old guard, otherwise "10 items" from before the reset
  // blocks auto-loading page 2 of the new list.
  const previousKeyRef = useRef(contentKey);
  const previousResetKeyRef = useRef(resetKey);
  if (
    contentKey < previousKeyRef.current ||
    resetKey !== previousResetKeyRef.current
  ) {
    requestedAtKeyRef.current = null;
  }
  previousKeyRef.current = contentKey;
  previousResetKeyRef.current = resetKey;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled) return;

    const check = () => {
      const notScrollable =
        container.scrollHeight <= container.clientHeight + 1;
      if (!notScrollable || requestedAtKeyRef.current === contentKey) return;

      requestedAtKeyRef.current = contentKey;
      void onLoadMoreRef.current();
    };

    // Wait a frame so the newly rendered items are measured.
    const frame = requestAnimationFrame(check);

    let lastHeight = container.clientHeight;
    const observer = new ResizeObserver(() => {
      // ResizeObserver also fires once on observe; only a real size change
      // (zoom, window resize) should allow another request at the same count.
      if (container.clientHeight !== lastHeight) {
        lastHeight = container.clientHeight;
        requestedAtKeyRef.current = null;
      }
      check();
    });
    observer.observe(container);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [containerRef, enabled, contentKey, resetKey]);
}
