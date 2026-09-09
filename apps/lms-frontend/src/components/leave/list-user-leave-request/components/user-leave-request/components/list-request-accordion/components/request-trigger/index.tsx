import { Row } from "@/features/leave/leave.types";
import { getBadge } from "@/utils/badge/get-badge";
import { ArrowRight, Briefcase } from "lucide-react";

export function RequestTrigger({ leaveRequest }: { leaveRequest: Row }) {
  return (
    <>
      <div className="bg-muted p-2 rounded-md">
        <Briefcase className="w-4 h-4" />
      </div>

      <div className="text-start">
        <p className="font-bold text-sm">
          {leaveRequest.leave_type?.name ?? "-"}
        </p>
        <div className="flex items-center">
          <p className="text-muted-foreground font-semibold text-xs">
            {leaveRequest.start_date}
          </p>
          <ArrowRight
            className="mx-1 text-muted-foreground"
            strokeWidth={2}
            size={12}
          />
          <p className="text-muted-foreground font-semibold text-xs">
            {leaveRequest.end_date}
          </p>
        </div>
      </div>

      <div className="ml-auto">{getBadge(leaveRequest.status)}</div>
    </>
  );
}
