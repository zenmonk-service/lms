import { ColumnDef } from "@tanstack/react-table";
import { PayrollRow } from "@/features/payroll/payroll.types";
import { AttendanceStatus } from "@/features/attendances/attendances.type";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import UserAvatar from "@/shared/user-avatar";
import { hasPermissions } from "@/lib/has-permission";
import { useAppSelector } from "@/store";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

const LATE_PENALTY_RATIO = 0.25;
const ABSENT_PENALTY_RATIO = 2;
const EARLY_DEPARTURE_PENALTY_RATIO = 0.25;

const getAttendancePenaltyTotal = (penalty: PayrollRow["attendance_penalty"]) =>
  Number(penalty?.late ?? 0) * LATE_PENALTY_RATIO +
  Number(penalty?.absent ?? 0) * ABSENT_PENALTY_RATIO +
  Number(penalty?.early_departure ?? 0) * EARLY_DEPARTURE_PENALTY_RATIO;

const getTotalDeduction = (row: PayrollRow) =>
  Number(row.leave_balance_deficit ?? 0) +
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
  const { currentUser } = useAppSelector((state) => state.userSlice);
  const { currentUserRolePermissions } = useAppSelector(
    (state) => state.permissionSlice,
  );

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
      const attendancePenaltyTotal = getAttendancePenaltyTotal(
        row.original.attendance_penalty,
      );
      const leaveBalanceDeficit = Number(
        row.original.leave_balance_deficit ?? 0,
      );

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
        const deficit = Number(row.original.leave_balance_deficit ?? 0);
        return (
          <div className="text-center">
            <DeductionLabel value={deficit} zeroLabel="NA" />
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
