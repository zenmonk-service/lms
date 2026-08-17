import { useEffect, useState, type RefObject } from "react";

export function useContainerBreakpoint(
  ref: RefObject<HTMLElement | null>,
  minWidthPx: number,
) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      setMatches(entry.contentRect.width >= minWidthPx);
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, minWidthPx]);

  return matches;
}