import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getAttendanceTooltip } from "../tooltip/tooltip";
import {
  AttendanceReportRow,
  AttendanceStatus,
} from "@/features/attendances/attendances.type";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ATTENDANCE_STATUS_ICON_MAP } from "../shared/attendance-icon-map";
import UserAvatar from "@/shared/user-avatar";
import {
  PermissionAction,
  PermissionTag,
} from "@/features/permissions/permission.type";

interface AttendanceColumnsProps {
  onMarkAttendance: (
    employee: AttendanceReportRow,
    status: AttendanceStatus,
  ) => void;
  setSelectedAttendanceUser: React.Dispatch<
    React.SetStateAction<AttendanceReportRow | null>
  >;
  can: (tag: PermissionTag, action: PermissionAction) => boolean;
}
export const attendanceColumns = ({
  onMarkAttendance,
  setSelectedAttendanceUser,
  can,
}: AttendanceColumnsProps): ColumnDef<AttendanceReportRow>[] => [
  {
    accessorKey: "name",
    header: () => <p className="text-center">Employee Name</p>,
    cell: ({ row }) => {
      const employee = row.original;
      return <UserAvatar user={employee} />;
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
        {row.original?.attendances[0]?.check_in || "-"}
      </div>
    ),
  },

  {
    accessorKey: "check_out",
    header: () => <div className="text-center font-semibold">Check Out</div>,
    cell: ({ row }) => (
      <div className="text-center">
        {row.original?.attendances[0]?.check_out || "-"}
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
  ...(can(PermissionTag.ATTENDANCE_MANAGEMENT, PermissionAction.UPDATE)
    ? [
        {
          id: "Update",
          header: () => (
            <div className="text-center font-semibold">Actions</div>
          ),

          cell: ({ row }: { row: { original: AttendanceReportRow } }) => {
            const status = row.original?.attendances[0]?.status;
            const selectUser = () => {
              setSelectedAttendanceUser({
                ...row.original,
                attendances: [
                  {
                    ...row.original.attendances[0],
                    status: status ?? row.original.attendances[0]?.status,
                  },
                  ...row.original.attendances.slice(1),
                ],
              });
            };

            return (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="align-middle">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  {status !== AttendanceStatus.PRESENT && (
                    <DropdownMenuItem
                      className="flex items-center gap-2"
                      onClick={() => {
                        selectUser();
                        onMarkAttendance(
                          row.original,
                          AttendanceStatus.PRESENT,
                        );
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
                        onMarkAttendance(row.original, AttendanceStatus.LATE);
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
                          row.original,
                          AttendanceStatus.HALF_DAY,
                        );
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
                          row.original,
                          AttendanceStatus.ON_LEAVE,
                        );
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
                          row.original,
                          AttendanceStatus.EARLY_DEPARTURE,
                        );
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
                        onMarkAttendance(row.original, AttendanceStatus.ABSENT);
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
        },
      ]
    : []),
];
