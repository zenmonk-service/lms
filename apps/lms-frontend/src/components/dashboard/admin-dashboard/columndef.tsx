import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Attendance } from "@/features/attendances/attendances.type";
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

const ATTENDANCE_STATUS_ICON_MAP = {
  present: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  absent: <XCircle className="h-4 w-4 text-red-500" />,
  late: <Clock3 className="h-4 w-4 text-amber-500" />,
  leave: <CalendarOff className="h-4 w-4 text-blue-500" />,
  holiday: <CalendarDays className="h-4 w-4 text-purple-500" />,
  org_holiday: <Building2 className="h-4 w-4 text-indigo-500" />,
} as const;

export interface EmployeeAttendance {
  name: string;
  employee_code: string;
  avatar_url?: string;
  attendances: Attendance[];
}

export const generateAttendanceColumns = (
  month: string,
): ColumnDef<EmployeeAttendance>[] => {
  const daysInMonth = dayjs(month).daysInMonth();

  const dayColumns: ColumnDef<EmployeeAttendance>[] = Array.from(
    { length: daysInMonth },
    (_, index) => {
      const day = index + 1;

      return {
        id: `day_${day}`,
        header: () => <div className="flex justify-center">{day}</div>,
        cell: ({ row }) => {
          const attendance = row.original.attendances.find(
            (a: Attendance) => dayjs(a.date).date() === day,
          );

          if (!attendance) {
            return <div className="text-center">-</div>;
          }

          return (
            <div className="flex justify-center">
              {ATTENDANCE_STATUS_ICON_MAP[
                attendance.status as keyof typeof ATTENDANCE_STATUS_ICON_MAP
              ] ?? "-"}
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
      cell: ({ row }) => {
        const employee = row.original;

        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={employee?.avatar_url} alt={employee?.name} />
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
                {employee?.employee_code}
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
