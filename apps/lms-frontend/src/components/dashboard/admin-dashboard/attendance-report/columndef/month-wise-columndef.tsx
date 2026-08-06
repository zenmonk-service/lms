import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Attendance,
  AttendanceReportRow,
  AttendanceStatus,
} from "@/features/attendances/attendances.type";
import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";

import { getAttendanceTooltip } from "../tooltip/tooltip";
import { ATTENDANCE_STATUS_ICON_MAP } from "../shared/attendance-icon-map";
import UserAvatar from "@/shared/user-avatar";

export const generateAttendanceColumns = (
  onMarkAttendance: (
    attendance: AttendanceReportRow,
    status: AttendanceStatus,
  ) => void,
  setSelectedAttendanceUser: (user: AttendanceReportRow) => void,
  setDate: React.Dispatch<React.SetStateAction<Date >>,
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

          const status = attendance?.status;

          const selectUser = () => {
            if (!attendance) {
              setSelectedAttendanceUser({ ...row.original, attendances: [] });
              return;
            }

            setSelectedAttendanceUser({
              ...row.original,
              attendances: row.original.attendances.map((a) =>
                a.uuid === attendance.uuid ? attendance : a,
              ),
            });
          };

          const icon = attendance
            ? ATTENDANCE_STATUS_ICON_MAP[
                attendance.status as keyof typeof ATTENDANCE_STATUS_ICON_MAP
              ]
            : "-";


          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild disabled={ attendance?.status === AttendanceStatus.WEEK_OFF}> 
                <div
                  className={`flex cursor-pointer justify-center items-center ${
                    today === date ? "bg-primary/10 rounded-md py-1" : ""
                  }`}
                >
                  {attendance  ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>{icon}</div>
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
                  ) : (
                    "-"
                  )}
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                {status !== AttendanceStatus.PRESENT && (
                  <DropdownMenuItem
                    className="flex items-center gap-2"
                    onClick={() => {
                      selectUser();
                      onMarkAttendance(
                        {
                          ...row.original,
                          attendances: attendance ? [attendance] : [],
                        },
                        AttendanceStatus.PRESENT,
                      );
                      setDate(new Date(date));
                    }}
                  >
                    {ATTENDANCE_STATUS_ICON_MAP[AttendanceStatus.PRESENT]}
                    Present
                  </DropdownMenuItem>
                )}

                {status !== AttendanceStatus.LATE && (
                  <DropdownMenuItem
                    className="flex items-center gap-2"
                    onClick={() => {
                      selectUser();
                      onMarkAttendance(
                        {
                          ...row.original,
                          attendances: attendance ? [attendance] : [],
                        },
                        AttendanceStatus.LATE,
                      );
                      setDate(new Date(date));
                    }}
                  >
                    {ATTENDANCE_STATUS_ICON_MAP[AttendanceStatus.LATE]}
                    Late
                  </DropdownMenuItem>
                )}

                {status !== AttendanceStatus.HALF_DAY && (
                  <DropdownMenuItem
                    className="flex items-center gap-2"
                    onClick={() => {
                      selectUser();
                      onMarkAttendance(
                        {
                          ...row.original,
                          attendances: attendance ? [attendance] : [],
                        },
                        AttendanceStatus.HALF_DAY,
                      );
                      setDate(new Date(date));
                    }}
                  >
                    {ATTENDANCE_STATUS_ICON_MAP[AttendanceStatus.HALF_DAY]}
                    Half Day
                  </DropdownMenuItem>
                )}

                {status !== AttendanceStatus.ON_LEAVE && (
                  <DropdownMenuItem
                    className="flex items-center gap-2"
                    onClick={() => {
                      selectUser();
                      onMarkAttendance(
                        {
                          ...row.original,
                          attendances: attendance ? [attendance] : [],
                        },
                        AttendanceStatus.ON_LEAVE,
                      );
                      setDate(new Date(date));
                    }}
                  >
                    {ATTENDANCE_STATUS_ICON_MAP[AttendanceStatus.ON_LEAVE]}
                    On Leave
                  </DropdownMenuItem>
                )}

                {status !== AttendanceStatus.EARLY_DEPARTURE && (
                  <DropdownMenuItem
                    className="flex items-center gap-2"
                    onClick={() => {
                      selectUser();
                      onMarkAttendance(
                        {
                          ...row.original,
                          attendances: attendance ? [attendance] : [],
                        },
                        AttendanceStatus.EARLY_DEPARTURE,
                      );
                      setDate(new Date(date));
                    }}
                  >
                    {
                      ATTENDANCE_STATUS_ICON_MAP[
                        AttendanceStatus.EARLY_DEPARTURE
                      ]
                    }
                    Early Departure
                  </DropdownMenuItem>
                )}

                {status !== AttendanceStatus.ABSENT && (
                  <DropdownMenuItem
                    className="flex items-center gap-2"
                    onClick={() => {
                      selectUser();
                      onMarkAttendance(
                        {
                          ...row.original,
                          attendances: attendance ? [attendance] : [],
                        },
                        AttendanceStatus.ABSENT,
                      );
                      setDate(new Date(date));
                    }}
                  >
                    {ATTENDANCE_STATUS_ICON_MAP[AttendanceStatus.ABSENT]}
                    Absent
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
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
