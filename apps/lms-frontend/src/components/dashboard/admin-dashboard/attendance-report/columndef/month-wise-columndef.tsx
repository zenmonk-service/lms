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

import { getAttendanceTooltip } from "../tooltip/tooltip";
import { ATTENDANCE_STATUS_ICON_MAP } from "../shared/attendance-icon-map";

export const generateAttendanceColumns = (
  month: string,
): ColumnDef<AttendanceReportRow>[] => {
  const daysInMonth = dayjs(month).daysInMonth();

  const dayColumns: ColumnDef<AttendanceReportRow>[] = Array.from(
    { length: daysInMonth },
    (_, index) => {
      const date = `${dayjs(month).format("YYYY-MM")}-${String(index + 1).padStart(2, "0")}`;
      const today = dayjs().format("YYYY-MM-DD");

      return {
        id: `day_${date}`,

        header: () => (
          <div
            className={`
              flex h-8 w-8 items-center justify-center rounded-md text-xs font-semibold transition-all
              ${
                today === date
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "hover:bg-accent"
              }
            `}
          >
            {index + 1}
          </div>
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
                  today === date ? "bg-primary/5 rounded-md py-1" : ""
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
                today === date ? "bg-primary/10 rounded-md py-1" : ""
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
        return <UserAvatar user={employee} />;
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
