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

export function LeaveDetailsCard({ leaveRequest }: { leaveRequest: any }) {
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
          <p className="text-xs font-semibold">
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
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1 mt-2">
          <div className="flex items-center gap-2">
            <CalendarCheck size={14} />
            <p className="text-xs text-muted-foreground">Start Date:</p>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays size={14} />
            <p className="text-xs text-muted-foreground">End Date:</p>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={14} />
            <p className="text-xs text-muted-foreground">Duration:</p>
          </div>
          <div className="flex items-center gap-2">
            <FileText size={14} />
            <p className="text-xs text-muted-foreground">Submitted:</p>
          </div>
        </div>
        <div className="flex flex-col gap-1 mt-2">
          <p className="text-xs font-semibold text-end">
            {formatDate(leaveRequest.start_date)}
          </p>
          <p className="text-xs font-semibold text-end">
            {formatDate(leaveRequest.end_date)}
          </p>
          <p className="text-xs font-semibold text-end">
            {leaveRequest.leave_duration} days
          </p>
          <p className="text-xs font-semibold text-end">
            {leaveRequest.created_at.split("T")[0]}
          </p>
        </div>
      </div>
    </div>
  );
}
