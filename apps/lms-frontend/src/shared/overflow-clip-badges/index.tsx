"use client";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface IProps {
  labels: string[];
}

const MAX_VISIBLE_BADGES = 2;

export const OverflowClipBadges = ({ labels }: IProps) => {
  const visible = labels.slice(0, MAX_VISIBLE_BADGES);
  const overflow = labels.slice(MAX_VISIBLE_BADGES);

  return (
    <div className="flex gap-1 items-center overflow-hidden">
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
            {/* Not flex: flex items get an implicit min-width tied to their
                unwrapped content size that overflow-wrap can't override, so
                flex-wrap here was a no-op for this single text string — it
                still overflowed past max-w-80. Plain block + wrap-break-word
                actually wraps, including mid-word for a role name with no
                spaces (seen in the wild with junk/fuzz data). max-h +
                overflow-y-auto is a safety net for a very long role list. */}
            <div className="max-h-48 overflow-y-auto wrap-break-word">
              {overflow.join(", ")}
            </div>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
};