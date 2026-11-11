"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { ChevronDown, ChevronUp, Crown, CornerDownRight, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/utils/get-initials";
import { cn } from "@/lib/utils";
import { useOrgCanvas } from "./canvas-context";
import type { PersonFlowNode } from "./layout";

function PersonNode({ data, selected }: NodeProps<PersonFlowNode>) {
  const {
    person,
    reportCount,
    otherManagers,
    hasPrimaryLine,
    hiddenCount,
    collapsed,
    collapsible,
    dimmed,
    dropState,
    editable,
    targetHandle,
    sourceHandle,
    laneTeam,
    isLead,
  } = data;
  // In a team lane the lane is the team, so only other teams are listed ("also in").
  const teams = laneTeam ? person.teams.filter((team) => team.uuid !== laneTeam) : person.teams;
  // All four handles always exist (React Flow measures them once); the layout
  // picks which pair edges use, and only those are shown and connectable.
  const handle = (active: boolean, extra?: string) =>
    cn(
      "!size-2.5 !border-2 !border-background !bg-muted-foreground",
      !active && "!pointer-events-none !opacity-0",
      extra,
    );
  const { toggleCollapse, select } = useOrgCanvas();

  return (
    <div
      className={cn(
        "group relative flex h-full w-full flex-col rounded-xl border bg-card text-card-foreground shadow-xs transition-[box-shadow,opacity,border-color]",
        selected && "border-foreground shadow-md",
        dropState === "valid" && "border-primary ring-4 ring-primary/20",
        dropState === "invalid" && "border-destructive ring-4 ring-destructive/15",
        dimmed && "opacity-40",
        !person.is_active && "border-dashed",
      )}
    >
      {otherManagers.length > 0 && (
        <span
          className="absolute -top-2.5 right-3 flex h-5 max-w-[42%] items-center gap-1 rounded-full border bg-background px-1.5 text-[10px] font-medium text-muted-foreground"
          title={`${hasPrimaryLine ? "Also reports to" : "Reports to"} ${otherManagers.join(", ")}`}
        >
          <CornerDownRight className="size-3 shrink-0" />
          <span className="truncate">
            {hasPrimaryLine ? "Also:" : "Reports to:"} {otherManagers[0]}
          </span>
          {otherManagers.length > 1 && <span className="shrink-0">+{otherManagers.length - 1}</span>}
        </span>
      )}
      <Handle id="t" type="target" position={Position.Top} isConnectable={editable && targetHandle === "t"} className={handle(targetHandle === "t")} />
      <Handle id="l" type="target" position={Position.Left} isConnectable={editable && targetHandle === "l"} className={handle(targetHandle === "l")} />

      <div className="flex items-start gap-2.5 p-3 pb-2">
        <Avatar className="size-9 shrink-0 rounded-lg border">
          <AvatarImage src={person.image || ""} alt={person.name} className="object-cover" />
          <AvatarFallback className="rounded-lg text-xs">
            {getInitials(person.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-sm font-semibold leading-tight">{person.name}</p>
            {isLead && <Crown className="size-3.5 shrink-0 text-amber-500" aria-label="Team lead" />}
            {!person.is_active && (
              <Badge variant="destructive" className="px-1.5 py-0 text-[10px]">
                Inactive
              </Badge>
            )}
          </div>
          <p className="truncate text-xs text-muted-foreground">{person.email}</p>
          <div className="mt-1 flex items-center gap-1 overflow-hidden">
            {person.role && (
              <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                {person.role.name}
              </Badge>
            )}
            {teams.slice(0, 1).map((team) => (
              <Badge
                key={team.uuid}
                variant="secondary"
                className="truncate px-1.5 py-0 text-[10px]"
                title={teams.map((t) => t.name).join(", ")}
              >
                {laneTeam ? `Also in ${team.name}` : team.name}
              </Badge>
            ))}
            {teams.length > 1 && (
              <span className="text-[10px] text-muted-foreground">
                +{teams.length - 1}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between border-t px-2 py-1.5">
        {reportCount > 0 && !collapsible ? (
          <span className="px-1.5 text-xs text-muted-foreground">
            {reportCount} report{reportCount === 1 ? "" : "s"}
          </span>
        ) : reportCount > 0 ? (
          <button
            type="button"
            className="nodrag flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={() => toggleCollapse(person.user_id)}
          >
            {collapsed ? <ChevronDown className="size-3.5" /> : <ChevronUp className="size-3.5" />}
            {collapsed ? `Show ${hiddenCount}` : "Collapse"}
          </button>
        ) : (
          <span className="px-1.5 text-xs text-muted-foreground">No reports</span>
        )}
        <button
          type="button"
          className="nodrag rounded-md bg-muted px-2 py-0.5 text-xs font-medium hover:bg-muted/70"
          onClick={() => select(person.user_id)}
        >
          View
        </button>
      </div>

      {reportCount > 0 && (
        <span
          className="absolute -bottom-2.5 left-1/2 flex h-5 -translate-x-1/2 items-center gap-0.5 rounded-full border bg-background px-1.5 text-[10px] font-medium text-muted-foreground"
          aria-label={`${reportCount} direct reports`}
        >
          <Users className="size-3" />
          {reportCount}
        </span>
      )}

      <Handle
        id="b"
        type="source"
        position={Position.Bottom}
        isConnectable={editable && sourceHandle === "b"}
        className={handle(
          sourceHandle === "b",
          sourceHandle === "b" && reportCount > 0 ? "!opacity-0 group-hover:!opacity-100" : undefined,
        )}
      />
      <Handle
        id="r"
        type="source"
        position={Position.Right}
        isConnectable={editable && sourceHandle === "r"}
        className={handle(sourceHandle === "r")}
      />
    </div>
  );
}

export default memo(PersonNode);
