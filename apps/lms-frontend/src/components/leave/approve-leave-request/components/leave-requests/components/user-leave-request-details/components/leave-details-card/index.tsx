import { SelectedLeave } from "@/features/leave/leave.types";
import { formatDate } from "@/utils/format-date";
import {
  CalendarCheck,
  CalendarDays,
  Clock,
  FileText,
  Layers,
} from "lucide-react";

const toTitleCase = (str: string) =>
  str.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export function LeaveDetailsCard({ leaveRequest }: { leaveRequest: SelectedLeave }) {
  return (
    <div className="bg-background rounded-lg border border-border p-3 flex-1 space-y-3">
      <div className="flex items-center gap-2">
        <FileText size={16} />
        <p className="font-semibold text-sm">Leave Details</p>
      </div>
      <div className="flex flex-wrap gap-3 p-3 rounded-lg bg-muted/30 border border-border/50 w-full">
        <div className="space-y-1 flex-1 min-w-24">
          <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
            <Layers size={10} /> Leave Type
          </p>
          <p className="text-xs font-semibold break-all">
            {leaveRequest.leave_type.name}
          </p>
        </div>
        <div className="flex gap-3">
          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
              <CalendarDays size={10} /> Type
            </p>
            <p className="text-xs font-semibold">
              {toTitleCase(leaveRequest.type)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
              <CalendarDays size={10} /> Range
            </p>
            <p className="text-xs font-semibold">
              {toTitleCase(leaveRequest.range)}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-2 space-y-1">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <CalendarCheck size={14} />
            <p className="text-xs text-muted-foreground">Start Date:</p>
          </div>
          <p className="text-xs font-semibold text-end">
            {formatDate(leaveRequest.start_date)}
          </p>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <CalendarDays size={14} />
            <p className="text-xs text-muted-foreground">End Date:</p>
          </div>
          <p className="text-xs font-semibold text-end">
            {formatDate(leaveRequest.end_date)}
          </p>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
          <div className="flex items-start gap-2 min-w-0">
            <Clock size={14} />
            <p className="text-xs leading-5 text-muted-foreground">
              Effective Days{' '}
              {parseFloat(leaveRequest.penalty || "0") > 0 && (
                <span className="text-destructive">
                  +{leaveRequest.penalty}(penalty)
                </span>
              )}
            </p>
          </div>
          <p className="text-xs font-semibold leading-5 text-end">
            {leaveRequest.effective_days != null
              ? `${(
                  parseFloat(leaveRequest.effective_days) +
                  parseFloat(leaveRequest.penalty || "0")
                ).toFixed(2)} ${
                  parseFloat(leaveRequest.effective_days) +
                    parseFloat(leaveRequest.penalty || "0") ===
                  1
                    ? "day"
                    : "days"
                }`
              : "-"}
          </p>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <FileText size={14} />
            <p className="text-xs text-muted-foreground">Submitted:</p>
          </div>
          <p className="text-xs font-semibold text-end">
            {leaveRequest.created_at.split("T")[0]}
          </p>
        </div>
      </div>
    </div>
  );
}
