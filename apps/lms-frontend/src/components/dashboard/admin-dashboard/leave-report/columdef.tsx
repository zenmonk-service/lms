import { LeaveBalance, LeaveType } from "@/features/leave/leave.types";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import { UserInterface } from "@/features/user/user.type";
import { PermissionAction, PermissionTag } from "@/features/permissions/permission.type";
export type LeaveReportRow = UserInterface & Record<string, unknown>;
import UserAvatar from "@/shared/user-avatar";
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { usePermissionCheck } from "@/hooks/use-permission-check";

export const getLeaveTypeColumns = (
  leaveTypes: LeaveType[],
  onAdjustLeave: (user: UserInterface) => void,
): ColumnDef<LeaveReportRow>[] => {
  const can = usePermissionCheck();
  const canAdjustLeave = can(PermissionTag.LEAVE_BALANCE_MANAGEMENT, PermissionAction.UPDATE);

  const adjustLeave = {
    id: "actions",
    header:  "",
    cell: ({ row }: { row: { original: UserInterface } }) => (
      <div className="flex justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAdjustLeave(row.original as UserInterface)}
        >
          <Settings2 className="h-4 w-4" />
          Adjust Leave
        </Button>
      </div>
    ),
  };

  return [
    {
      accessorKey: "name",
      header: () => <p className="text-center">Employee Name</p>,

      cell: ({ row }: { row: { original: LeaveReportRow } }) => {
        const employee = row.original;
        return (
          <UserAvatar
            user={{
              name: employee.name,
              email: employee.email,
              image: employee.image || "",
            }}
          />
        );
      },
    },

    ...leaveTypes.map((leaveType) => ({
      accessorKey: leaveType.code,
      header: () => (
        <div className="text-center font-semibold">{leaveType.name}</div>
      ),
      cell: ({ row }: { row: { original: LeaveReportRow } }) => {
        const leaveBalance = row.original[leaveType.code] as LeaveBalance | null;

        if (!leaveBalance) {
          return (
            <Badge variant="outline" className="rounded-sm">Not Allocated</Badge>
          );
        }

        const allocated = leaveBalance.leaves_allocated || 0;
        const remaining = Number.parseFloat(leaveBalance.balance) || 0;
        const used = Math.max(0, allocated - remaining);
        const percentage = allocated > 0 ? (remaining / allocated) * 100 : 0;

        return (
          <HoverCard>
            <HoverCardTrigger asChild>
              <div className="min-w-[155px] space-y-1 cursor-help">
                <div className="flex justify-between items-end text-[11px] font-semibold">
                  <span>
                    {remaining.toFixed(1)} / {allocated}
                  </span>

                  <span className="text-xs text-muted-foreground">
                    {used.toFixed(1)} used
                  </span>
                </div>

                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </HoverCardTrigger>

            <HoverCardContent
              side="top"
              align="center"
              className="w-full"
            >
              <div className="space-y-3">
                <div className="border-b border-border pb-2">
                  <p className="font-semibold">{leaveType.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Leave Details
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                  <span className="text-muted-foreground">Allocated</span>
                  <span className="text-right font-medium">
                    {leaveBalance.leaves_allocated}
                  </span>

                  <span className="text-muted-foreground">Used</span>
                  <span className="text-right font-medium">
                    {used.toFixed(2)}
                  </span>

                  <span className="text-muted-foreground">
                    Current Balance
                  </span>
                  <span className="text-right font-medium">
                    {Number(leaveBalance.balance).toFixed(2)}
                  </span>

                  <span className="text-muted-foreground">SLA Credit</span>
                  <span className="text-right font-medium">
                    {leaveBalance.sla ?? "-"}
                  </span>

                  <span className="text-muted-foreground">Final Balance</span>
                  <span className="text-right font-medium">
                    {leaveBalance.final_balance ??
                      Number(leaveBalance.balance).toFixed(2)}
                  </span>

                  <span className="text-muted-foreground">Period</span>
                  <span className="text-right font-medium">
                    {leaveBalance.period}
                  </span>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        );
      },
    })),
    ...(canAdjustLeave ? [adjustLeave] : []),
  ];
};
