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
            <div className="flex flex-wrap gap-1">{overflow.join(", ")}</div>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
};