import { ColumnDef } from "@tanstack/react-table";
import { PayrollRow } from "@/features/payroll/payroll.types";
import { AttendanceStatus } from "@/features/attendances/attendances.type";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import UserAvatar from "@/shared/user-avatar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { PermissionAction, PermissionTag } from "@/features/permissions/permission.type";
import { usePermissionCheck } from "@/hooks/use-permission-check";

const LATE_PENALTY_RATIO = 0.25;
const ABSENT_PENALTY_RATIO = 2;
const EARLY_DEPARTURE_PENALTY_RATIO = 0.25;

const getAttendancePenaltyTotal = (penalty: PayrollRow["attendance_penalty"]) =>
  Number(penalty?.late ?? 0) * LATE_PENALTY_RATIO +
  Number(penalty?.absent ?? 0) * ABSENT_PENALTY_RATIO +
  Number(penalty?.early_departure ?? 0) * EARLY_DEPARTURE_PENALTY_RATIO;

const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;

const getLeaveBalanceDeficitTotal = (
  deficits: PayrollRow["leave_balance_deficit"] , period: string
) =>
  Math.abs(
    (deficits ?? []).reduce(
      (sum, item) => sum + (currentMonth === period ? Number(item.balance ?? 0) : Number(item.final_balance ?? 0)),
      0
    )
    
  );


const getTotalDeduction = (row: PayrollRow) =>
  getLeaveBalanceDeficitTotal(row.leave_balance_deficit, row.period) +
  getAttendancePenaltyTotal(row.attendance_penalty);

const formatDays = (value: number, zeroLabel: string) => {
  if (value === 0) return zeroLabel;
  return `-${value} day${value > 1 ? "s" : ""}`;
};

const DeductionLabel = ({
  value,
  zeroLabel,
}: {
  value: number;
  zeroLabel: string;
}) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 font-medium",
      value === 0
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-destructive",
    )}
  >
    {formatDays(value, zeroLabel)}
  </span>
);

export const usePayrollColumns = (
  handleResolve: (
    payroll_id: string,
    user_uuid: string,
    penalty: "attendance_penalty" | "leave_balance_deficit" | "both" | null,
    attendancePenalty?: Record<AttendanceStatus, string>,
  ) => void,
): ColumnDef<PayrollRow>[] => {
  const can = usePermissionCheck();
  const canAdjustLeave = can(PermissionTag.LEAVE_BALANCE_MANAGEMENT, PermissionAction.UPDATE);

  const resolveColumn: ColumnDef<PayrollRow> = {
    accessorKey: "action",
    header: "",
    cell: ({ row }) => {
      const total = getTotalDeduction(row.original);
      const attendancePenaltyTotal = getAttendancePenaltyTotal(row.original.attendance_penalty);
      const leaveBalanceDeficit = getLeaveBalanceDeficitTotal(row.original.leave_balance_deficit);
      const penalty =
        attendancePenaltyTotal > 0 && leaveBalanceDeficit > 0
        ? "both"
        : attendancePenaltyTotal > 0
        ? "attendance_penalty"
        : leaveBalanceDeficit > 0
        ? "leave_balance_deficit"
        : null;
      
      return (
        <div className="text-right pr-8">
          <Button
            size="sm"
            disabled={total === 0}
            variant={"outline"}
            onClick={() =>
              handleResolve(
                row.original.id,
                row.original.user.user_id!,
                penalty,
              )
            }
          >
            <Settings2 className="h-4 w-4" />
            Resolve
          </Button>
        </div>
      );
    },
  };

  return [
    {
      accessorKey: "user",
      header: () => <p className="pl-8">Employee</p>,
      cell: ({ row }) => {
        const user = row.original.user;
        return (
          <UserAvatar
            user={{
              name: user.name!,
              email: user.email!,
              image: user.image!,
            }}
          />
        );
      },
    },
    {
      accessorKey: "leave_balance_deficit",
      header: () => <p className="text-center">Leave Balance Deficit</p>,
      cell: ({ row }) => {
        const deficits = row.original.leave_balance_deficit ?? [];
        const total = getLeaveBalanceDeficitTotal(deficits, row.original.period);

        return (
          <div className="text-center">
            <HoverCard>
              <HoverCardTrigger className="cursor-help">
                <DeductionLabel value={total} zeroLabel="NA" />
              </HoverCardTrigger>

              <HoverCardContent
                side="top"
                align="center"
                className="w-80"
              >
                <div className="space-y-3">
                  <div className="border-b border-border pb-2">
                    <p className="font-semibold">
                      Leave Balance Deficit Details
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Details of leave balance deficits applied.
                    </p>
                  </div>

                  {deficits.length === 0 ? (
                    <p className="text-center text-xs text-muted-foreground">
                      No leave balance deficit
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {deficits.map((leave) => (
                        <div
                          key={leave.code}
                          className="grid grid-cols-2 gap-x-6 text-xs"
                        >
                          <span>{leave.name}</span>
                          <span className="text-right font-medium">
                            {leave.balance}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
        );
      },
    },
    {
      accessorKey: "attendance_penalty",
      header: () => <p className="text-center">Attendance Penalty</p>,
      cell: ({ row }) => {
        const penalty = row.original.attendance_penalty;
        const total = getAttendancePenaltyTotal(penalty);
        return (
          <div className="text-center">
            <HoverCard>
              <HoverCardTrigger className="cursor-help">
                <DeductionLabel value={total} zeroLabel="NA" />
              </HoverCardTrigger>
              <HoverCardContent
                side="top"
                align="center"
                className="w-full"
              >
                <div className="space-y-3">
                  <div className="border-b border-border pb-2">
                    <p className="font-semibold">Attendance Penalty Details</p>
                    <p className="text-xs text-muted-foreground">
                      Details of attendance penalties applied
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                    <span className="capitalize">
                      {AttendanceStatus.LATE.replaceAll("_", " ")}
                    </span>
                    <span className="text-right font-medium">
                      {penalty.late ?? 0}
                    </span> 

                    <span className="capitalize">
                      {AttendanceStatus.ABSENT.replaceAll("_", " ")}
                    </span>
                    <span className="text-right font-medium">
                      {penalty.absent ?? 0}
                    </span>

                    <span className="capitalize">
                      {AttendanceStatus.EARLY_DEPARTURE.replaceAll("_", " ")}
                    </span>
                    <span className="text-right font-medium">
                      {penalty.early_departure ?? 0}
                    </span>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
        );
      },
    },
    {
      accessorKey: "total_deduction",
      header: () => <p className="text-center">Total Deduction</p>,
      cell: ({ row }) => {
        const total = getTotalDeduction(row.original);
        return (
          <div className="text-center">
            <DeductionLabel value={total} zeroLabel="NA" />
          </div>
        );
      },
    },

    ...(canAdjustLeave ? [resolveColumn] : []),
  ];
};
