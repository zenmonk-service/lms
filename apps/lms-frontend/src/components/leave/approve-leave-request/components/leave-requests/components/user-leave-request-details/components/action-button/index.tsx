import { LeaveAction } from "@/components/leave/leave.types";
import { Button } from "@/components/ui/button";
import { CircleCheckBig, CircleX, TrendingUp } from "lucide-react";

export function ActionButtons({
  onAction,
  disabled,
}: {
  onAction: (action: LeaveAction) => void;
  disabled: boolean;
}) {
  return (
    <div className="p-4 grid grid-cols-3 gap-2 @sm:gap-4">
      <Button onClick={() => onAction("approve")} disabled={disabled}>
        <CircleCheckBig />
        <span className="hidden @sm:inline">Approve</span>
      </Button>
      <Button variant="destructive" onClick={() => onAction("reject")} disabled={disabled}>
        <CircleX />
        <span className="hidden @sm:inline">Reject</span>
      </Button>
      <Button variant="outline" onClick={() => onAction("recommend")} disabled={disabled}>
        <TrendingUp />
        <span className="hidden @sm:inline">Recommend</span>
      </Button>
    </div>
  );
}