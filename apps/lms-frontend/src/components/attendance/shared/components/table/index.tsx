"use client";

import { DateRangePicker } from "@/shared/date-range-picker";
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleQuestionMark,
} from "lucide-react";
import React, { useCallback, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/shared/table/skeleton";
import NoDataFound from "@/shared/no-data-found";
import { getBadge } from "@/utils/badge/get-badge";
import { useAppSelector } from "@/store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAttendanceFetch } from "@/components/attendance/my-attendance/hooks/use-attendance-fetch";
import { cn } from "@/lib/utils";
import { AttendanceStatus } from "@/features/attendances/attendances.type";
import CustomSelect from "@/shared/select";

interface IProps {
  showFilters?: boolean;
  noDataMessage?: string;
  user_uuid?: string;
  maxHeight?: string;
  showPagination?: boolean;
  children?: React.ReactNode;
}

export default function AttendanceTable({
  showFilters = true,
  noDataMessage = "We couldn't find any attendance logs for the selected criteria.",
  user_uuid,
  maxHeight = "calc(100vh - 300px)",
  showPagination = true,
  children,
}: IProps) {
  const userUUID = user_uuid || useAppSelector((s) => s.userSlice.currentUser?.user_id);
  const { attendances: userAttendance, loading: userAttendanceLoading } = useAppSelector((s) => s.attendancesSlice);

  const [status, setStatus] = useState<AttendanceStatus | undefined>(undefined);
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });
  const [expandedRowId, setExpandedRowId] = useState<number | string | null>(null);
  const [dateRange, setDateRange] = useState<{ start_date?: string; end_date?: string; }>({});

  useAttendanceFetch({
    dateRange,
    currentPage: pagination.page,
    itemsPerPage: pagination.limit,
    userUUID,
    status
  });

  const totalPages = Math.ceil((userAttendance?.total || 0) / pagination.limit);
  const handlePageChange = useCallback(
    (p: number) => setPagination((prev) => ({ ...prev, page: p })),
    [],
  );

  const handlePageSizeChange = (limit: number) => setPagination({ page: 1, limit });

  const getStatusBadge = (status: string) => {
    const normalizedStatus = status?.toLowerCase();
    const label = status?.replaceAll("_", " ") || "unknown";
    const capLabel = label.charAt(0).toUpperCase() + label.slice(1);

    return getBadge(normalizedStatus, capLabel);
  };

  return (
    <div className={`bg-card ${showFilters && "border border-border rounded-md p-4"}`}>
      <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
        {children && <div className="flex-1">{children}</div>}
        {showFilters && (
          <>
            <div className="flex-1">
              <CustomSelect
                label="Status"
                className="w-full flex-1"
                value={status || ""}
                getValue={(item) => item}
                getLabel={(item) => item.slice(0, 1).toUpperCase() + item.replaceAll("_", " ").slice(1)}
                placeholder="Select status"
                data={Object.values(AttendanceStatus)}
                onReset={() => setStatus(undefined)}
                onValueChange={(value) => setStatus(value as AttendanceStatus)}
              />
            </div>
            <DateRangePicker
              isFromYear={2}
              isDependant={false}
              setDateRange={setDateRange}
              containerClassName="w-auto"
            />
          </>
          )}
      </div>

      <div>
        {userAttendanceLoading ? (
          <TableSkeleton />
        ) : (
          <>
            <div
              className="relative border border-border rounded-sm overflow-auto"
              style={{ maxHeight }}
            >
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-accent h-10 pointer-events-none">
                  <TableRow>
                    <TableHead className="text-xs font-semibold pl-8">
                      Date
                    </TableHead>
                    {[
                      "Check In",
                      "Check Out",
                      "Duration",
                      "Status",
                      "",
                    ].map((header, index) => (
                      <TableHead key={index} className="text-xs font-semibold">
                        {header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!userAttendance.rows || userAttendance.rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center p-8">
                        <NoDataFound
                          message={noDataMessage}
                          title="No attendance records"
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    userAttendance.rows.map((log, i) => (
                      <React.Fragment key={i}>
                        <TableRow
                          className={`${expandedRowId === i && "bg-muted/50"}`}
                        >
                          <TableCell className="flex items-center gap-2">
                            <div className="bg-muted p-2 rounded-md">
                              <Calendar size={14} />
                            </div>
                            {log.date}
                          </TableCell>

                          <TableCell className="tracking-wider font-medium">
                            {log.check_in ? log.check_in : "----"}
                          </TableCell>
                          <TableCell className="tracking-wider font-medium">
                            {log.check_out ? log.check_out : "----"}
                          </TableCell>
                          <TableCell className="tracking-wider font-medium">
                            {log.affected_hours} hrs
                          </TableCell>
                          <TableCell>{getStatusBadge(log.status)}</TableCell>

                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() =>
                                setExpandedRowId(expandedRowId === i ? null : i)
                              }
                            >
                              <ChevronDown
                                className={`rotate-${expandedRowId === i ? "180" : "0"} transition-transform`}
                              />
                            </Button>
                          </TableCell>
                        </TableRow>

                        {expandedRowId === i && (
                          <TableRow>
                            <TableCell colSpan={6} className="p-0 hover:bg-card">
                              {!log.attendance_log?.length ? (
                                <NoDataFound
                                  title="No attendance records"
                                  message="We couldn't find any attendance logs for the selected criteria."
                                />
                              ) : (
                                log.attendance_log.map(
                                  (attendanceLog, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center h-12 gap-4 border-b border-border px-4 py-3 last:border-b-0 hover:bg-muted/40 transition-colors"
                                    >
                                      <div className="min-w-35">
                                        {getBadge(
                                          "default",
                                          attendanceLog.type!.replaceAll("_", " "),
                                          undefined,
                                          "secondary",
                                          "capitalize rounded-md",
                                        )}
                                      </div>
                                      <div className="min-w-35">
                                        {getBadge(
                                          attendanceLog.status!.replaceAll("_", " "),
                                          attendanceLog.status!.replaceAll("_", " "),
                                          undefined,
                                          "secondary",
                                          "capitalize rounded-md",
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        {attendanceLog.remarks ? (
                                          <>
                                            <div className="hidden md:block">
                                              <p className="text-sm text-muted-foreground line-clamp-2">
                                                {attendanceLog.remarks}
                                              </p>
                                            </div>

                                            <div className="md:hidden">
                                              <TooltipProvider>
                                                <Tooltip>
                                                  <TooltipTrigger asChild>
                                                    <CircleQuestionMark
                                                      size={18}
                                                      className="cursor-pointer text-muted-foreground hover:text-primary"
                                                    />
                                                  </TooltipTrigger>

                                                  <TooltipContent
                                                    side="top"
                                                    className="max-w-xs"
                                                  >
                                                    <p className="text-xs">
                                                      {attendanceLog.remarks}
                                                    </p>
                                                  </TooltipContent>
                                                </Tooltip>
                                              </TooltipProvider>
                                            </div>
                                          </>
                                        ) : (
                                          <span className="text-sm text-muted-foreground italic">
                                            No remarks
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2 shrink-0">
                                        <Avatar className="h-6 w-6">
                                          <AvatarImage src={attendanceLog.performed_by?.image} className="h-full w-full object-cover"/>
                                          <AvatarFallback className="text-xs">
                                            {(attendanceLog.performed_by?.name || "System")
                                              .slice(0, 2)
                                              .toUpperCase()}
                                          </AvatarFallback>
                                        </Avatar>
                                        <p>{attendanceLog.performed_by?.name || "System"}</p>
                                      </div>
                                    </div>
                                  ),
                                )
                              )}
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {showPagination && (
              <div className="mt-3 flex flex-row gap-4 items-center justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <p className="text-sm text-muted-foreground">Rows per page</p>

                  <Select
                    value={pagination.limit.toString()}
                    onValueChange={(value) =>
                      handlePageSizeChange(Number(value))
                    }
                  >
                    <SelectTrigger className="w-20" size="sm">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      {[5, 10, 20, 50].map((size) => (
                        <SelectItem key={size} value={size.toString()}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="rounded-md border px-3 py-1 text-xs font-medium">
                    Page {pagination.page}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="icon-sm"
                      variant="outline"
                      disabled={pagination.page === 1}
                      onClick={() => handlePageChange(pagination.page - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <Button
                      size="icon-sm"
                      variant="outline"
                      disabled={pagination.page >= totalPages}
                      onClick={() => handlePageChange(pagination.page + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
