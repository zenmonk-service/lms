"use client";

import { Attendance } from "@/features/attendances/attendances.type";
import { DateRangePicker } from "@/shared/date-range-picker";
import { Calendar, ChevronDown, MapPin } from "lucide-react";
import React, { memo } from "react";
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
import { getBadge } from "@/utils/get-badge";

  export const changeUTCtoLocalTime = (utcTime: string) => {
    if (!utcTime) return "---";

    let date: Date;

    if (/^\d{2}:\d{2}:\d{2}$/.test(utcTime)) {
      const now = new Date();
      const [hours, minutes, seconds] = utcTime.split(":").map(Number);
      date = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate(),
          hours,
          minutes,
          seconds,
        ),
      );
    } else {
      date = new Date(utcTime);
    }

    if (isNaN(date.getTime())) return "---";

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }


export default memo(function AttendanceTable({
  setDateRange,
  userAttendance,
  userAttendanceLoading,
  currentPage,
  totalPages,
  handlePageChange,
  expandedRowId,
  setExpandedRowId,
  noDataMessage,
}: {
  setDateRange: React.Dispatch<
    React.SetStateAction<{
      start_date?: string;
      end_date?: string;
    }>
  >;
  userAttendance: {
    rows: Attendance[];
    current_page?: number;
    total?: number;
    per_page?: number;
  };
  userAttendanceLoading: boolean;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  handlePageChange: (page: number) => void;
  expandedRowId: number | null;
  setExpandedRowId: (id: number | null) => void;
  noDataMessage: string;
}) {

  const getStatusBadge = (status: string) => {
    const normalizedStatus = status?.toLowerCase();
    const label = status?.replaceAll("_", " ") || "unknown";
    const capLabel = label.charAt(0).toUpperCase() + label.slice(1);

    return getBadge(normalizedStatus, capLabel);
  };

  return (
    <div className="border border-border rounded-md p-4 bg-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p>Attendance Records</p>
          <p className="text-xs text-muted-foreground text-balance">
            View and manage your attendance logs within a specified date range.
          </p>
        </div>
        <DateRangePicker
          setDateRange={setDateRange}
          isDependant={false}
          isFromYear={2}
        />
      </div>
      <div className="bg-card border border-border rounded-lg p-4 max-h-[calc(100vh-376px)] overflow-auto flex flex-col justify-between">
        {userAttendanceLoading ? (
          <TableSkeleton />
        ) : (
          <>
            <div className="relative overflow-auto border border-border rounded-sm no-scrollbar">
              <Table>
                <TableHeader className="bg-accent sticky top-0 z-10 h-10 pointer-events-none">
                  <TableRow>
                    <TableHead className="text-xs font-semibold pl-8">
                      Date
                    </TableHead>
                    {["Check In", "Check Out", "Duration", "Status"].map(
                      (header) => (
                        <TableHead className="text-xs font-semibold">
                          {header}
                        </TableHead>
                      ),
                    )}
                    <TableHead className="text-xs uppercase font-bold"></TableHead>
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

                          <TableCell>
                            {changeUTCtoLocalTime(log.check_in)}
                          </TableCell>
                          <TableCell>
                            {changeUTCtoLocalTime(log.check_out)}
                          </TableCell>
                          <TableCell>{log.affected_hours}</TableCell>
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
                          <TableRow className="pointer-events-none">
                            <TableCell colSpan={6} className="p-0">
                              <div className="">
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
                                        className="flex items-center gap-2 border-b border-border last:border-b-0"
                                      >
                                        <div className="w-35 border-r py-2 px-8">
                                          {getBadge(
                                            "default",
                                            attendanceLog.type.replaceAll(
                                              "_",
                                              " ",
                                            ),
                                            undefined,
                                            "secondary",
                                            "capitalize rounded-sm",
                                          )}
                                        </div>

                                        <p className="flex-1 py-2">
                                          {changeUTCtoLocalTime(
                                            attendanceLog.time,
                                          )}
                                        </p>
                                        <div className="flex space-x-2 items-center py-2 pr-2">
                                          <MapPin className="w-4 h-4" />
                                          <p>
                                            {attendanceLog.location || "---"}
                                          </p>
                                        </div>
                                      </div>
                                    ),
                                  )
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {totalPages >= 1 && (
              <div className="flex items-center justify-end pt-4">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
});
