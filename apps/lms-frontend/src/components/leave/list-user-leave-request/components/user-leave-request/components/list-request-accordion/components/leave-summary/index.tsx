import { Row } from "@/features/leave/leave.types";
import { CalendarDays, Coins, FileText, TriangleAlert } from "lucide-react";
import { formatDays, toTitleCase } from "../../utils";
import { AttachmentsCard } from "../attachments-card";
import { SummaryCard } from "../summary-card";

const PENALTY_MULTIPLIER = 2;

export function LeaveSummary({ leaveRequest }: { leaveRequest: Row }) {
  const baseDays = Number(leaveRequest.effective_days ?? 0);
  const penaltyDays = Number(leaveRequest.penalty ?? 0);
  const hasPenalty = Number.isFinite(penaltyDays) && penaltyDays > 0;
  const totalCreditCost = hasPenalty ? baseDays * PENALTY_MULTIPLIER : baseDays;

  return (
    <div className="space-y-3">
      <p className="font-semibold text-xs text-muted-foreground">
        Leave summary
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <SummaryCard icon={CalendarDays} label="Leave profile">
          <p className="text-sm font-semibold">
            {toTitleCase(leaveRequest.type)}
          </p>
        </SummaryCard>

        <SummaryCard
          icon={hasPenalty ? TriangleAlert : Coins}
          label="Total credit cost"
          tone={hasPenalty ? "destructive" : "default"}
        >
          {hasPenalty ? (
            <>
              <div className="flex items-baseline gap-1.5 tabular-nums">
                <span className="text-sm font-medium text-muted-foreground line-through">
                  {baseDays}
                </span>
                <span className="text-xs font-semibold text-destructive">
                  &times; {PENALTY_MULTIPLIER}
                </span>
                <span className="text-xs text-muted-foreground">=</span>
                <span className="text-lg font-bold text-destructive">
                  {totalCreditCost}
                </span>
              </div>
              <p className="text-[10px] text-destructive/80 wrap-break-word">
                Includes {PENALTY_MULTIPLIER}&times; post-dated leave penalty.
              </p>
            </>
          ) : (
            <p className="text-sm font-bold">
              {formatDays(leaveRequest.effective_days)}
            </p>
          )}
        </SummaryCard>

        {leaveRequest.reason && (
          <SummaryCard icon={FileText} label="Reason" className="sm:col-span-2">
            <p className="text-sm font-semibold wrap-break-word">
              {leaveRequest.reason}
            </p>
          </SummaryCard>
        )}

        {leaveRequest.documents && leaveRequest.documents.length > 0 && (
          <AttachmentsCard documents={leaveRequest.documents} />
        )}
      </div>
    </div>
  );
}
