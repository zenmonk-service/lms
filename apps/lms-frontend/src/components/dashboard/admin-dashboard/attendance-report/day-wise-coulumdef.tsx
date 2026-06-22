import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ATTENDANCE_STATUS_ICON_MAP } from "./columndef";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getAttendanceTooltip } from "./tooltip";
import { Attendance } from "@/features/attendances/attendances.type";
import { changeUTCtoLocalTime } from "@/components/attendance/shared/components/table";

export interface AttendanceRow {
  uuid: string;
  email: string;
  name: string;
  image?: string;
  user_id: string;
  attendance: Attendance;
}

export const attendanceColumns: ColumnDef<AttendanceRow>[] = [
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
      const status = row.original.attendance.status;
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
                  {getAttendanceTooltip(row.original.attendance)}
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
        {changeUTCtoLocalTime(row.original.attendance.check_in || "-")}
      </div>
    ),
  },

  {
    accessorKey: "check_out",
    header: () => <div className="text-center font-semibold">Check Out</div>,
    cell: ({ row }) => (
      <div className="text-center">
        {changeUTCtoLocalTime(row.original.attendance.check_out || "-")}
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
        {row.original.attendance.affected_hours ?? 0} hrs
      </div>
    ),
  },

  {
    id: "actions",
    header: () => <div className="text-center font-semibold">Actions</div>,
    cell: ({ row }) => (
      <div className="flex items-center gap-2 justify-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            console.log("View", row.original.uuid);
          }}
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];
