import { useRef, useState } from "react";

import { LoaderCircle, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAppDispatch, useAppSelector } from "@/store";
import { formatDate } from "@/utils/format-date";
import {
  ATTENDANCE_STATUS_META,
  MANUALLY_ASSIGNABLE_STATUSES,
} from "@/utils/attendance-status";
import { AttendanceStatus } from "@/features/attendances/attendances.type";
import { getBadge } from "@/utils/badge/get-badge";
import UploadAttendance from "../../../attendance-report/upload-attendance";
import { uploadAttendanceReportAction } from "@/features/attendances/upload-attendance/upload-attendance.action";
import { UploadType } from "@/features/attendances/upload-attendance/upload-attendance.type";
import RemarkDialog from "./remarks-dialog";

interface IProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface IPendingStatusChange {
  date: string;
  status?: AttendanceStatus;
}

const AttendanceReconciliation = ({ open, onOpenChange }: IProps) => {
  const dispatch = useAppDispatch();

  const { missingAttendanceDates } = useAppSelector(
    (state) => state.attendancesSlice,
  );
  const org_uuid = useAppSelector(
    (state) => state.organizationsSlice.currentOrganization.uuid,
  );

  const [statusByDate, setStatusByDate] = useState<
    Record<string, AttendanceStatus | "">
  >(() => Object.fromEntries(missingAttendanceDates.map((date) => [date, ""])));

  const [remarksByDate, setRemarksByDate] = useState<Record<string, string>>(
    {},
  );

  const [loadingDates, setLoadingDates] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState<number | undefined>(
    undefined,
  );

  const [pendingStatusChange, setPendingStatusChange] =
    useState<IPendingStatusChange | null>(null);
  const [remarkInput, setRemarkInput] = useState("");

  const setLoading = (date: string, loading: boolean) => {
    setLoadingDates((prev) => {
      const next = new Set(prev);
      if (loading) next.add(date);
      else next.delete(date);
      return next;
    });
  };

  const handleStatusChange = async (
    date: string,
    status: AttendanceStatus,
    remark: string,
  ) => {
    setLoading(date, true);

    try {
      const payload = {
        org_uuid,
        type: UploadType.MANUAL_UPLOAD,
        status,
        date,
        remark: remark || undefined,
      };

      await dispatch(uploadAttendanceReportAction(payload)).unwrap();

      setStatusByDate((prev) => ({ ...prev, [date]: status }));
      setRemarksByDate((prev) => ({ ...prev, [date]: remark }));
    } catch (error) {
    } finally {
      setLoading(date, false);
    }
  };

  const openRemarkDialog = (date: string, status: AttendanceStatus) => {
    setPendingStatusChange({ date, status });
    setRemarkInput(remarksByDate[date] ?? "");
  };

  const closeRemarkDialog = () => {
    setPendingStatusChange(null);
    setRemarkInput("");
  };

  const submitRemarkDialog = async () => {
    if (!pendingStatusChange) return;

    const { date, status } = pendingStatusChange;
    closeRemarkDialog();
    await handleStatusChange(date, status!, remarkInput.trim());
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Attendance Reconciliation Required</DialogTitle>
            <DialogDescription>
              We found {missingAttendanceDates.length} days with unsubmitted
              attendance.
            </DialogDescription>
          </DialogHeader>

          <div className="relative max-h-100 overflow-auto rounded-md border">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-background h-10 pointer-events-none">
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {missingAttendanceDates.map((date, index) => {
                  const value = statusByDate[date];
                  const isLoading = loadingDates.has(date);
                  const remark = remarksByDate[date];

                  return (
                    <TableRow key={date}>
                      <TableCell className="font-medium">
                        <div>{formatDate(date)}</div>

                        {remark ? (
                          <HoverCard openDelay={150}>
                            <HoverCardTrigger asChild>
                              <p className="truncate text-xs text-muted-foreground max-w-50">
                                {remark}
                              </p>
                            </HoverCardTrigger>
                            <HoverCardContent className="max-w-sm">
                              <p className="text-sm wrap-break-word">
                                {remark}
                              </p>
                            </HoverCardContent>
                          </HoverCard>
                        ) : null}
                      </TableCell>

                      <TableCell className="text-center">
                        {isLoading ? (
                          <LoaderCircle className="mx-auto h-4 w-4 animate-spin text-muted-foreground" />
                        ) : value ? (
                          getBadge(value, value.replaceAll("_", " "), undefined)
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>

                      <TableCell className="text-center">
                        <DropdownMenu modal={false}>
                          <DropdownMenuTrigger disabled={isLoading} asChild>
                            <Button variant="ghost" disabled={isLoading}>
                              ...
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            <DropdownMenuGroup>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  setCurrentIndex(index);
                                  fileInputRef?.current?.click();
                                  e.stopPropagation();
                                }}
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Attendance Sheet
                              </DropdownMenuItem>
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                  Attendance Status
                                </DropdownMenuSubTrigger>
                                <DropdownMenuPortal>
                                  <DropdownMenuSubContent>
                                    {MANUALLY_ASSIGNABLE_STATUSES.map(
                                      (status) => (
                                        <DropdownMenuItem
                                          key={status}
                                          disabled={status === value}
                                          onClick={() =>
                                            openRemarkDialog(date, status)
                                          }
                                        >
                                          {ATTENDANCE_STATUS_META[status].icon}
                                          <p className="ml-2">
                                            {
                                              ATTENDANCE_STATUS_META[status]
                                                .label
                                            }
                                          </p>
                                        </DropdownMenuItem>
                                      ),
                                    )}
                                  </DropdownMenuSubContent>
                                </DropdownMenuPortal>
                              </DropdownMenuSub>
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

          <RemarkDialog
            open={!!pendingStatusChange}
            date={pendingStatusChange?.date}
            status={pendingStatusChange?.status}
            remark={remarkInput}
            onRemarkChange={setRemarkInput}
            onOpenChange={(open) => {
              if (!open) closeRemarkDialog();
            }}
            onSubmit={submitRemarkDialog}
          />
        </DialogContent>
      </Dialog>

      <UploadAttendance fileInputRef={fileInputRef} index={currentIndex} />
    </>
  );
};

export default AttendanceReconciliation;
