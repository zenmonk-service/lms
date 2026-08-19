import { LeaveAction } from "@/components/leave/leave.types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CircleCheckBig, CircleX, TrendingUp } from "lucide-react";

export function ActionButtons({
  onAction,
  disabled,
  canRecommend = true,
}: {
  onAction: (action: LeaveAction) => void;
  disabled: boolean;
  canRecommend?: boolean;
}) {
  return (
    <div
      className={cn(
        "p-4 grid gap-2 @sm:gap-4",
        canRecommend ? "grid-cols-3" : "grid-cols-2",
      )}
    >
      <Button onClick={() => onAction("approve")} disabled={disabled}>
        <CircleCheckBig />
        <span className="hidden @sm:inline">Approve</span>
      </Button>
      <Button variant="destructive" onClick={() => onAction("reject")} disabled={disabled}>
        <CircleX />
        <span className="hidden @sm:inline">Reject</span>
      </Button>
      {canRecommend && (
        <Button variant="outline" onClick={() => onAction("recommend")} disabled={disabled}>
          <TrendingUp />
          <span className="hidden @sm:inline">Recommend</span>
        </Button>
      )}
    </div>
  );
}