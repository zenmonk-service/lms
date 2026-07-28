import { ColumnDef } from "@tanstack/react-table";
import { PayrollRow } from "@/features/payroll/payroll.types";
import { getBadge } from "@/utils/badge/get-badge";
import { AttendanceStatus } from "@/features/attendances/attendances.type";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import UserAvatar from "@/shared/user-avatar";
import { hasPermissions } from "@/lib/has-permission";
import { useAppSelector } from "@/store";

const LATE_PENALTY_RATIO = 0.25;
const ABSENT_PENALTY_RATIO = 2;
const EARLY_DEPARTURE_PENALTY_RATIO = 0.25;

const getAttendancePenaltyTotal = (penalty: PayrollRow["attendance_penalty"]) =>
  Number(penalty?.late ?? 0) * LATE_PENALTY_RATIO +
  Number(penalty?.absent ?? 0) * ABSENT_PENALTY_RATIO +
  Number(penalty?.early_departure ?? 0) * EARLY_DEPARTURE_PENALTY_RATIO;

const getTotalDeduction = (row: PayrollRow) => Number(row.leave_balance_deficit ?? 0) + getAttendancePenaltyTotal(row.attendance_penalty);

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
  const { currentUser } = useAppSelector((state) => state.userSlice);
  const { currentUserRolePermissions } = useAppSelector((state) => state.permissionSlice);

  const canAdjustLeave = hasPermissions(
    "leave_balance_management",
    "update",
    currentUserRolePermissions,
    currentUser?.email,
  );

  const resolveColumn: ColumnDef<PayrollRow> = {
    accessorKey: "action",
    header: "",
    cell: ({ row }) => {
      const total = getTotalDeduction(row.original);
      const attendancePenaltyTotal = getAttendancePenaltyTotal(row.original.attendance_penalty);
      const leaveBalanceDeficit = Number(row.original.leave_balance_deficit ?? 0);

      const penalty = attendancePenaltyTotal > 0 && leaveBalanceDeficit > 0
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
            onClick={() => handleResolve(row.original.id, row.original.user.user_id!, penalty)}
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
        const deficit = Number(row.original.leave_balance_deficit ?? 0);
        return (
          <div className="text-center">
            <DeductionLabel value={deficit} zeroLabel="_" />
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
            <Tooltip>
              <TooltipTrigger className="cursor-help">
                <DeductionLabel value={total} zeroLabel="_" />
              </TooltipTrigger>
              <TooltipContent className="flex flex-col gap-1 max-w-xs bg-popover text-popover-foreground shadow-lg pb-3">
                {getBadge(AttendanceStatus.LATE, `Late: ${penalty.late ?? 0}`)}
                {getBadge(
                  AttendanceStatus.ABSENT,
                  `Absent: ${penalty.absent ?? 0}`,
                )}
                {getBadge(
                  AttendanceStatus.EARLY_DEPARTURE,
                  `Early departure: ${penalty.early_departure ?? 0}`,
                )}
              </TooltipContent>
            </Tooltip>
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
            <DeductionLabel value={total} zeroLabel="_" />
          </div>
        );
      },
    },

    ...(canAdjustLeave ? [resolveColumn] : []),
  ];
};
