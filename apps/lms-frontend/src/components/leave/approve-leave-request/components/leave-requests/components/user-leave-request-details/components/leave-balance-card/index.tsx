import { CalendarDays, ChartNoAxesColumnIncreasing } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { SelectedLeave } from "@/features/leave/leave.types";

const formatPeriod = (periodStr: string) => {
  try {
    return new Date(periodStr + "-01").toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  } catch {
    return periodStr;
  }
};

export function LeaveBalanceCard({ leaveRequest }: { leaveRequest: SelectedLeave }) {
  const balances = leaveRequest.leave_type.leave_balances;

  return (
    <div className="bg-background rounded-lg border border-border p-3 flex-1 space-y-3">
      <div className="flex items-center gap-2">
        <ChartNoAxesColumnIncreasing size={16} />
        <p className="font-semibold text-sm">Leave Balance Breakdown</p>
      </div>
      {balances.map((balance: any, index: number) => {
        const total = Number(balance.leaves_allocated) || 0;
        const remaining = Number(balance.balance) || 0;
        const used = total - remaining;
        const percentage = total > 0 ? (remaining / total) * 100 : 0;

        return (
          <div key={index} className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-border/50 pb-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <CalendarDays size={14} />
                <p className="text-xs font-semibold">
                  {balance.period
                    ? formatPeriod(balance.period)
                    : `Period ${index + 1}`}
                </p>
              </div>
              {index === 0 && balances.length > 1 && (
                <p className="text-[10px] text-muted-foreground italic">
                  Current Month Impact
                </p>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col">
                <p className="text-[10px] text-muted-foreground">Allocated</p>
                <p className="text-sm font-bold">
                  {total} <span className="text-[10px] font-normal">days</span>
                </p>
              </div>
              <div className="flex flex-col items-center">
                <p className="text-[10px] text-muted-foreground">Used</p>
                <p className="text-sm font-bold">{used.toFixed(1)}</p>
              </div>
              <div className="flex flex-col items-end text-end">
                <p className="text-[10px] text-primary font-semibold">
                  Remaining
                </p>
                <p className="text-sm font-bold text-primary">
                  {remaining}{" "}
                  <span className="text-[10px] font-normal">days</span>
                </p>
              </div>
            </div>
            <div className="space-y-1">
              <Progress value={percentage} />
              <div className="flex justify-between text-[9px] text-muted-foreground font-medium">
                <span>0%</span>
                <span>{Math.round(percentage)}% available</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
