"use client";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useRef, useState } from "react";

interface IProps {
  labels: string[];
}

const MAX_VISIBLE_BADGES = 2;
const BADGE_WIDTH = 90;
const OVERFLOW_BADGE_WIDTH = 50;

export const OverflowClipBadges = ({ labels }: IProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(labels.length);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;

      let count = Math.floor((width - OVERFLOW_BADGE_WIDTH) / BADGE_WIDTH);

      count = Math.max(1, count);

      setVisibleCount(Math.min(count, MAX_VISIBLE_BADGES, labels.length));
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, [labels.length]);

  const visible = labels.slice(0, visibleCount);
  const overflow = labels.slice(visibleCount);

  return (
    <div ref={containerRef} className="flex gap-1 items-center overflow-hidden">
      {visible.map((label, idx) => (
        <Badge
          key={`${label}-${idx}`}
          variant="outline"
          className="rounded-sm whitespace-nowrap"
        >
          {label}
        </Badge>
      ))}

      {overflow.length > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className="cursor-pointer whitespace-nowrap"
            >
              +{overflow.length}
            </Badge>
          </TooltipTrigger>

          <TooltipContent align="start" className="max-w-80">
            <div className="flex flex-wrap gap-1">{overflow.join(", ")}</div>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
};
