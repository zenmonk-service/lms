import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Attendance,
  AttendanceReportRow,
} from "@/features/attendances/attendances.type";
import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import {
  Building2,
  CalendarDays,
  CalendarOff,
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";
import { getAttendanceTooltip } from "../tooltip/tooltip";

export const ATTENDANCE_STATUS_ICON_MAP = {
  present: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  absent: <XCircle className="h-4 w-4 text-red-500" />,
  late: <Clock3 className="h-4 w-4 text-amber-500" />,
  on_leave: <CalendarOff className="h-4 w-4 text-blue-500" />,
  holiday: <CalendarDays className="h-4 w-4 text-purple-500" />,
  org_holiday: <Building2 className="h-4 w-4 text-indigo-500" />,
  week_off: <CalendarOff className="h-4 w-4 text-gray-500" />,
  on_duty: <CalendarDays className="h-4 w-4 text-teal-500" />,
  half_day: <Clock3 className="h-4 w-4 text-yellow-500" />,
  early_departure: <Clock3 className="h-4 w-4 text-orange-500" />,
} as const;

export const generateAttendanceColumns = (
  month: string,
  selectedDay?: string,
): ColumnDef<AttendanceReportRow>[] => {
  const daysInMonth = dayjs(month).daysInMonth();

  const dayColumns: ColumnDef<AttendanceReportRow>[] = Array.from(
    { length: daysInMonth },
    (_, index) => {
      const date = `${dayjs(month).format("YYYY-MM")}-${index + 1}`;

      return {
        id: `day_${date}`,

        header: () => (
          <button
            className={`
              flex h-8 w-8 items-center justify-center rounded-md text-xs font-semibold transition-all
              ${
                selectedDay === date
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "hover:bg-accent"
              }
            `}
          >
            {index + 1}
          </button>
        ),
        size: 40,
        cell: ({ row }) => {
          const attendance = row.original.attendances.find(
            (a: Attendance) =>
              dayjs(a.date).date() === parseInt(date.split("-")[2]),
          );

          if (!attendance) {
            return (
              <div
                className={`flex justify-center ${
                  selectedDay === date ? "bg-primary/5 rounded-md py-1" : ""
                }`}
              >
                -
              </div>
            );
          }

          const icon =
            ATTENDANCE_STATUS_ICON_MAP[
              attendance.status as keyof typeof ATTENDANCE_STATUS_ICON_MAP
            ];

          return (
            <div
              className={`flex justify-center ${
                selectedDay === date ? "bg-primary/10 rounded-md py-1" : ""
              }`}
            >
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
                      {getAttendanceTooltip(attendance)}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          );
        },
      };
    },
  );

  return [
    {
      accessorKey: "name",

      header: () => (
        <div className="text-center font-semibold">Employee Name</div>
      ),
      size: 250,
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

    ...dayColumns,

    {
      id: "present_days",

      header: () => <div className="text-center">Present</div>,

      cell: ({ row }) => (
        <div className="text-center">
          {
            row.original.attendances.filter(
              (a: Attendance) => a.status === "present",
            ).length
          }
        </div>
      ),
    },

    {
      id: "absent_days",

      header: () => <div className="text-center">Absent</div>,

      cell: ({ row }) => (
        <div className="text-center">
          {
            row.original.attendances.filter(
              (a: Attendance) => a.status === "absent",
            ).length
          }
        </div>
      ),
    },

    {
      id: "leave_days",

      header: () => <div className="text-center">Leave</div>,

      cell: ({ row }) => (
        <div className="text-center">
          {
            row.original.attendances.filter(
              (a: Attendance) => a.status === "on_leave",
            ).length
          }
        </div>
      ),
    },

    {
      id: "working_hours",

      header: () => <div className="text-center">Hours</div>,

      cell: ({ row }) => (
        <div className="text-center">
          {row.original.attendances.reduce(
            (sum: number, a: Attendance) =>
              sum + (Number(a.affected_hours) || 0),
            0,
          )}
        </div>
      ),
    },
  ];
};
