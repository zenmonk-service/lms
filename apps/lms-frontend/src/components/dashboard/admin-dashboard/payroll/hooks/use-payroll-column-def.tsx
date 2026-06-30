import { ColumnDef } from "@tanstack/react-table";
import { PayrollRow } from "@/features/payroll/payroll.types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getBadge } from "@/utils/get-badge";
import { AttendanceStatus } from "@/features/attendances/attendances.type";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Settings2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

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

export const usePayrollColumns = (): ColumnDef<PayrollRow>[] => {
  return [
    {
      accessorKey: "user",
      header: () => <p className="pl-8">Employee</p>,
      cell: ({ row }) => {
        const user = row.original.user;
        const initials = user
          .name!.split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase();
        return (
          <div className="flex gap-2">
            <Avatar className="rounded-full">
              <AvatarImage
                src={user.image || ""}
                alt={user.name}
                className="h-full w-full object-cover"
              />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p>{user.name}</p>
              <div className="flex items-center gap-1">
                <p className="text-muted-foreground text-xs">{user.email}</p>
              </div>
            </div>
          </div>
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
              <TooltipContent className="flex flex-col gap-1 pb-3">
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
    {
      accessorKey: "action",
      header: "",
      cell: ({ row }) => {
        const total = getTotalDeduction(row.original);
        return (
          <div className="text-right pr-8">
            <Button
              size="sm"
              disabled={total === 0}
              variant={total ? "default" : "secondary"}
            >
              <Settings2 className="h-4 w-4" />
              Resolve
            </Button>
          </div>
        );
      },
    },
  ];
};
