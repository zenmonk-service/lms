import { useEffect, useRef, useState } from "react";
import { LoaderCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AttendanceStatus } from "@/features/attendances/attendances.type";
import { useAppDispatch, useAppSelector } from "@/store";
import { useAttendanceFetch } from "@/components/attendance/mark-attendance/hooks/use-attendance-fetch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ATTENDANCE_STATUS_META, MANUALLY_ASSIGNABLE_STATUSES } from "@/utils/attendance-status";
import { formatDate } from "@/utils/format-date";
import { getBadge } from "@/utils/badge/get-badge";
import { updateAttendanceAction } from "@/features/attendances/update-attendance/update-attendance.action";
import { patchAttendanceStatus } from "@/features/attendances/attendances.slice";
import { AttendanceTableSkeleton } from "./skeleton";

interface IProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUserUuid: string;
  dateRange: { start_date: string; end_date: string };
  onClose?: () => void | Promise<void>;
  onResolve?: () => void | Promise<void>;
}

export function AttendanceResolveModal({
  open,
  onOpenChange,
  selectedUserUuid,
  dateRange,
  onClose,
  onResolve,
}: IProps) {
  const dispatch = useAppDispatch();
  const { attendances } = useAppSelector((state) => state.attendancesSlice);
  const org_uuid = useAppSelector((state) => state.organizationsSlice.currentOrganization.uuid);

  const { isLoading: isAttendanceLoading } = useAttendanceFetch({
    dateRange,
    currentPage: 1,
    itemsPerPage: 31,
    userUUID: selectedUserUuid,
  });

  const hasChangedRef = useRef(false);
  const [loadingUuids, setLoadingUuids] = useState<Set<string>>(new Set());

  const setLoading = (uuid: string, loading: boolean) => {
    setLoadingUuids((prev) => {
      const next = new Set(prev);
      if (loading) next.add(uuid);
      else next.delete(uuid);
      return next;
    });
  };

  const handleClose = () => {
    if(hasChangedRef.current) onClose?.();
    onOpenChange(false);
  };

  const handleStatusChange = async (attendance_uuid: string, status: AttendanceStatus) => {
    setLoading(attendance_uuid, true);

    const res = await dispatch(updateAttendanceAction({ org_uuid, uuid: attendance_uuid, status }));

    if (updateAttendanceAction.fulfilled.match(res)) {
      dispatch(patchAttendanceStatus({ uuid: attendance_uuid, status }));
      hasChangedRef.current = true;
      onResolve?.();
    }

    setLoading(attendance_uuid, false);
  };

  useEffect(() => {
    if (open) hasChangedRef.current = false;
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Resolve Attendance Penalties</DialogTitle>
          <DialogDescription>
            You can modify the number of days for each attendance status below.
          </DialogDescription>
        </DialogHeader>

        {isAttendanceLoading ? (
          <AttendanceTableSkeleton />
        ) : (
          <div className="relative max-h-100 overflow-auto rounded-md border">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-background h-10 pointer-events-none">
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-center">Check-in</TableHead>
                <TableHead className="text-center">Check-out</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isAttendanceLoading && attendances.rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    <LoaderCircle className="mx-auto h-4 w-4 animate-spin" />
                  </TableCell>
                </TableRow>
              )}

              {attendances.rows.map((attendance) => {
                const isLoading = loadingUuids.has(attendance.uuid);

                return (
                  <TableRow key={attendance.uuid}>
                    <TableCell className="font-medium">
                      {formatDate(attendance.date)}
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {attendance.check_in || "-"}
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {attendance.check_out || "-"}
                    </TableCell>

                    <TableCell className="text-center">
                      {isLoading ? (
                        <LoaderCircle className="mx-auto h-4 w-4 animate-spin text-muted-foreground" />
                      ) : attendance.status ? (
                        getBadge(attendance.status, attendance.status.replaceAll("_", " "))
                      ) : (
                        "-"
                      )}
                    </TableCell>

                    <TableCell className="text-center">
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger disabled={isLoading} asChild>
                          <Button variant="ghost" disabled={isLoading}>
                            ...
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-50" align="start">
                          <DropdownMenuGroup>
                            {MANUALLY_ASSIGNABLE_STATUSES.map((status) => (
                              <DropdownMenuItem
                                key={status}
                                disabled={status === attendance.status}
                                onClick={() => handleStatusChange(attendance.uuid, status)}
                              >
                                {ATTENDANCE_STATUS_META[status].icon}
                                <p className="ml-2">{ATTENDANCE_STATUS_META[status].label}</p>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}