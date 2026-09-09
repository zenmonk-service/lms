import { LeaveRange, Row } from "@/features/leave/leave.types";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  Clock,
  Coins,
  LucideIcon,
  TriangleAlert,
} from "lucide-react";
import { ReactNode } from "react";
import { formatDays, toTitleCase } from "../../utils";

const PENALTY_MULTIPLIER = 2;

type Fact = {
  icon: LucideIcon;
  label: string;
  tone?: "destructive";
  value: ReactNode;
};

export function LeaveFacts({ leaveRequest }: { leaveRequest: Row }) {
  const baseDays = Number(leaveRequest.effective_days ?? 0);
  const penaltyDays = Number(leaveRequest.penalty ?? 0);
  const hasPenalty = Number.isFinite(penaltyDays) && penaltyDays > 0;
  const totalCreditCost = hasPenalty ? baseDays * PENALTY_MULTIPLIER : baseDays;

  const facts: Fact[] = [
    {
      icon: CalendarDays,
      label: "Leave profile",
      value: (
        <p className="text-sm font-semibold">
          {toTitleCase(leaveRequest.type)}
        </p>
      ),
    },
  ];

  if (leaveRequest.range && leaveRequest.range !== LeaveRange.FULL_DAY) {
    facts.push({
      icon: Clock,
      label: "Range",
      value: (
        <p className="text-sm font-semibold">
          {toTitleCase(leaveRequest.range)}
        </p>
      ),
    });
  }

  facts.push({
    icon: hasPenalty ? TriangleAlert : Coins,
    label: "Total credit cost",
    tone: hasPenalty ? "destructive" : undefined,
    value: hasPenalty ? (
      <div className="space-y-0.5">
        <div className="flex flex-wrap items-baseline gap-x-1.5 tabular-nums">
          <span className="text-sm font-medium text-muted-foreground line-through">
            {baseDays}
          </span>
          <span className="text-xs font-semibold text-destructive">
            &times; {PENALTY_MULTIPLIER}
          </span>
          <span className="text-xs text-muted-foreground">=</span>
          <span className="text-sm font-bold text-destructive">
            {totalCreditCost}
          </span>
          <span className="text-[11px] text-destructive">
            incl. {PENALTY_MULTIPLIER}&times; post-dated penalty
          </span>
        </div>
      </div>
    ) : (
      <p className="text-sm font-semibold">
        {formatDays(leaveRequest.effective_days)}
      </p>
    ),
  });

  return (
    <div className="leave-facts flex flex-wrap gap-px overflow-hidden rounded-lg border border-border bg-border">
      {facts.map(({ icon: Icon, label, tone, value }) => (
        <div
          key={label}
          className={cn(
            "min-w-37.5 flex-1 px-4 py-3",
            tone === "destructive" ? "bg-destructive/5" : "bg-muted/40",
          )}
        >
          <p
            className={cn(
              "mb-0.5 flex items-center gap-1.5 text-[11px] font-semibold",
              tone === "destructive"
                ? "text-destructive"
                : "text-muted-foreground",
            )}
          >
            <Icon size={12} />
            {label}
          </p>
          {value}
        </div>
      ))}
    </div>
  );
}
