import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CheckCircle,
  Clock3,
  Eye,
  LogOut,
  MoreHorizontal,
  Plane,
  Timer,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ATTENDANCE_STATUS_ICON_MAP } from "./columndef";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getAttendanceTooltip } from "./tooltip";
import {
  AttendanceReportRow,
  AttendanceStatus,
} from "@/features/attendances/attendances.type";
import { formatAttendanceTime } from "@/utils/format-time";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AttendanceColumnsProps {
  onMarkAttendance: (
    employee: AttendanceReportRow,
    status: AttendanceStatus,
  ) => void;
}
export const attendanceColumns = ({
  onMarkAttendance,
}: AttendanceColumnsProps): ColumnDef<AttendanceReportRow>[] => [
  {
    accessorKey: "name",

    header: () => (
      <div className="text-center font-semibold">Employee Name</div>
    ),

    cell: ({ row }) => {
      const employee = row.original;

      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={employee?.image} alt={employee?.name} />

            <AvatarFallback>
              {employee?.name
                ?.split(" ")
                .map((n: string) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col">
            <span className="font-medium">{employee?.name}</span>

            <span className="text-xs text-muted-foreground">
              {employee?.email}
            </span>
          </div>
        </div>
      );
    },
  },

  {
    accessorKey: "status",
    header: () => <div className="text-center font-semibold">Status</div>,
    cell: ({ row }) => {
      const status = row.original?.attendances[0]?.status;
      if (!status) {
        return <div className={`flex justify-center`}>-</div>;
      }

      const icon =
        ATTENDANCE_STATUS_ICON_MAP[
          status as keyof typeof ATTENDANCE_STATUS_ICON_MAP
        ];

      return (
        <div className={`flex justify-center items-center`}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-pointer">{icon}</div>
              </TooltipTrigger>

              <TooltipContent
                side="top"
                className="max-w-xs bg-popover text-popover-foreground shadow-lg"
              >
                <div className="space-y-2 text-xs">
                  {getAttendanceTooltip(row.original?.attendances[0])}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    },
  },

  {
    accessorKey: "check_in",
    header: () => <div className="text-center font-semibold">Check In</div>,
    cell: ({ row }) => (
      <div className="text-center">
        {formatAttendanceTime(row.original?.attendances[0]?.check_in || "-")}
      </div>
    ),
  },

  {
    accessorKey: "check_out",
    header: () => <div className="text-center font-semibold">Check Out</div>,
    cell: ({ row }) => (
      <div className="text-center">
        {formatAttendanceTime(row.original?.attendances[0]?.check_out || "-")}
      </div>
    ),
  },

  {
    accessorKey: "affective_hours",
    header: () => (
      <div className="text-center font-semibold">Affective Hours</div>
    ),
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.attendances[0]?.affected_hours ?? 0} hrs
      </div>
    ),
  },

  {
    id: "actions",
    header: () => <div className="text-center font-semibold">Actions</div>,

    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger className="flex justify-center" asChild>
          <div className="flex justify-center">
            <Button className="align-middle" variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="flex items-center gap-2"
            onClick={() =>
              onMarkAttendance(row.original, AttendanceStatus.PRESENT)
            }
          >
            {ATTENDANCE_STATUS_ICON_MAP[AttendanceStatus.PRESENT]}
            Present
          </DropdownMenuItem>

          <DropdownMenuItem
            className="flex items-center gap-2"
            onClick={() =>
              onMarkAttendance(row.original, AttendanceStatus.LATE)
            }
          >
            {ATTENDANCE_STATUS_ICON_MAP[AttendanceStatus.LATE]}
            Late
          </DropdownMenuItem>

          <DropdownMenuItem
            className="flex items-center gap-2"
            onClick={() =>
              onMarkAttendance(row.original, AttendanceStatus.HALF_DAY)
            }
          >
            {ATTENDANCE_STATUS_ICON_MAP[AttendanceStatus.HALF_DAY]}
            Half Day
          </DropdownMenuItem>

          <DropdownMenuItem
            className="flex items-center gap-2"
            onClick={() =>
              onMarkAttendance(row.original, AttendanceStatus.ON_LEAVE)
            }
          >
            {ATTENDANCE_STATUS_ICON_MAP[AttendanceStatus.ON_LEAVE]}
            On Leave
          </DropdownMenuItem>

          <DropdownMenuItem
            className="flex items-center gap-2"
            onClick={() =>
              onMarkAttendance(row.original, AttendanceStatus.EARLY_DEPARTURE)
            }
          >
            {ATTENDANCE_STATUS_ICON_MAP[AttendanceStatus.EARLY_DEPARTURE]}
            Early Departure
          </DropdownMenuItem>

          <DropdownMenuItem
            className="flex items-center gap-2"
            onClick={() =>
              onMarkAttendance(row.original, AttendanceStatus.ABSENT)
            }
          >
            {ATTENDANCE_STATUS_ICON_MAP[AttendanceStatus.ABSENT]}
            Absent
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
