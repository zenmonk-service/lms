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
  const canAdjustLeave = can(PermissionTag.LEAVE_TYPE_MANAGEMENT, PermissionAction.SLA);

  const adjustLeave = {
    id: "actions",
    header:  "",
    cell: ({ row }: { row: { original: UserInterface } }) => (
      <div className="flex justify-end mr-4">
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
      header: () => <p className="ml-12">Employee Name</p>,

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
      header: () => <p className="text-center">{leaveType.name}</p>,
      cell: ({ row }: { row: { original: LeaveReportRow } }) => {
        const leaveBalance = row.original[leaveType.code] as LeaveBalance | null;

        if (!leaveBalance) {
          return (
            <div className="text-center">
              <Badge variant="outline" className="rounded-sm">Not Allocated</Badge>
            </div>
          );
        }

        const allocated = leaveBalance.leaves_allocated || 0;
        const remaining = Number.parseFloat(leaveBalance.balance) || 0;
        const used = Math.max(0, allocated - remaining);
        const percentage = allocated > 0 ? (remaining / allocated) * 100 : 0;

        return (
          <HoverCard>
            <HoverCardTrigger asChild>
              <div
                className={`min-w-38.75 space-y-1.5 rounded-xl border px-3 py-1.5 cursor-help transition-all duration-200 ease-out shadow-sm hover:-translate-y-0.5 hover:shadow-md ${leaveBalance.is_sealed ? 'border-border/60 bg-muted/30 text-muted-foreground' : 'border-primary/20 bg-primary/5 text-foreground'}`}
              >
                <div className="flex items-end justify-between text-[11px] font-semibold tracking-wide">
                  <span>
                    {remaining.toFixed(1)} / {allocated}
                  </span>

                  <span className="text-xs font-medium text-muted-foreground">
                    {used.toFixed(1)} used
                  </span>
                </div>

                <div className="h-2 w-full overflow-hidden rounded-full bg-muted/70 ring-1 ring-inset ring-border/50">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${leaveBalance.is_sealed ? 'bg-muted-foreground/60' : 'bg-primary'}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="flex justify-end">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] ${leaveBalance.is_sealed ? 'bg-muted/60 text-muted-foreground' : 'bg-primary/15 text-primary'}`}>
                    {leaveBalance.is_sealed ? 'Sealed' : 'Active'}
                  </span>
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
                  <span className="text-muted-foreground">Status</span>
                  <span className="text-right font-medium">
                    {leaveBalance.is_sealed ? "Sealed" : "Unsealed"}
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
