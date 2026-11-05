"use client";

import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from "@xyflow/react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOrgCanvas } from "./canvas-context";
import type { ReportingFlowEdge } from "./layout";

/**
 * Manager → report line. Lines that apply within a team carry the team name, and
 * lines outside the highlighted team fade. When selected (and editable) it shows a
 * remove button.
 */
export default function ReportingEdge({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  selected,
  deletable,
  data,
}: EdgeProps<ReportingFlowEdge>) {
  const { requestUnlink } = useOrgCanvas();
  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 10,
  });
  const teams = (data?.lines ?? []).flatMap((line) => (line.team ? [line.team.name] : []));
  const dimmed = !!data?.dimmed && !selected;
  // Labels sit near the report's end so lines from several managers don't stack them.
  const tagX = targetX + (sourceX - targetX) * 0.2;
  const tagY = targetY + (sourceY - targetY) * 0.2;

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd}
        className={cn(
          "!stroke-muted-foreground/50 !stroke-[1.5] transition-opacity",
          teams.length > 0 && "[stroke-dasharray:6_4]",
          dimmed && "opacity-25",
          selected && "!stroke-foreground !stroke-2",
        )}
        interactionWidth={18}
      />
      <EdgeLabelRenderer>
        {teams.length > 0 && !selected && (
          <span
            className={cn(
              "nodrag nopan absolute max-w-40 truncate rounded-full border bg-background px-1.5 py-px text-[10px] font-medium text-muted-foreground shadow-xs",
              dimmed && "opacity-30",
            )}
            style={{ transform: `translate(-50%, -50%) translate(${tagX}px, ${tagY}px)` }}
            title={`Within ${teams.join(", ")}`}
          >
            {teams.join(" · ")}
          </span>
        )}
        {selected && deletable && (
          <button
            type="button"
            className="nodrag nopan absolute flex size-6 items-center justify-center rounded-full border bg-background text-destructive shadow-sm hover:bg-destructive hover:text-white"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: "all",
            }}
            onClick={() => requestUnlink(target, source)}
            aria-label="Remove reporting line"
            title="Remove reporting line"
          >
            <X className="size-3.5" />
          </button>
        )}
      </EdgeLabelRenderer>
    </>
  );
}
