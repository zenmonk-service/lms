"use client";

import { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import { Crown, UsersRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOrgCanvas } from "./canvas-context";
import type { TeamLaneNode as TeamLaneFlowNode } from "./layout";

/**
 * A team's frame in the Teams view. Member cards are child nodes laid out inside it;
 * drag the header to move the whole team, drop a person on it to add them.
 */
function TeamLaneNode({ data }: NodeProps<TeamLaneFlowNode>) {
  const { team, memberCount, dimmed, dropState } = data;
  const { openTeam } = useOrgCanvas();

  return (
    <div
      className={cn(
        "h-full w-full rounded-2xl border bg-background/70 shadow-xs transition-[opacity,box-shadow,border-color]",
        dropState === "valid" && "border-primary ring-4 ring-primary/20",
        dropState === "invalid" && "border-destructive ring-4 ring-destructive/15",
        dimmed && "opacity-40",
      )}
    >
      <div className="flex h-12 items-center gap-2.5 rounded-t-2xl border-b bg-muted/60 px-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-background text-muted-foreground">
          <UsersRound className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-tight">{team.name}</p>
          <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
            <Crown className="size-3 shrink-0" />
            {team.lead ? team.lead.name : "No lead"}
            <span aria-hidden>·</span>
            {memberCount} member{memberCount === 1 ? "" : "s"}
          </p>
        </div>
        <button
          type="button"
          className="nodrag shrink-0 rounded-md border bg-background px-2 py-0.5 text-xs font-medium hover:bg-muted"
          onClick={() => openTeam(team.uuid)}
        >
          Manage
        </button>
      </div>
      {memberCount === 0 && (
        <p className="p-6 text-center text-xs text-muted-foreground">No members yet. Drop people here.</p>
      )}
    </div>
  );
}

export default memo(TeamLaneNode);
