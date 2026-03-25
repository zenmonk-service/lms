"use client";

import {
  Attendance,
} from "@/features/attendances/attendances.type";
import { DateRangePicker } from "@/shared/date-range-picker";
import {
  Calendar,
  ChevronsUpDown,
  MapPin,
} from "lucide-react";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { TableSkeleton } from "@/shared/table/skeleton";
import NoDataFound from "@/shared/no-data-found";
import { getBadge } from "@/utils/get-badge";

export default function AttendanceTable({
  setDateRange,
  userAttendance,
  userAttendanceLoading,
  currentPage,
  itemsPerPage,
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

  function changeUTCtoLocalTime(utcTime: string) {
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

  const getStatusBadge = (status: string) => {
    const normalizedStatus = status?.toLowerCase();
    const label = status?.replaceAll("_", " ") || "unknown";
    const capLabel = label.charAt(0).toUpperCase() + label.slice(1);

    return getBadge(normalizedStatus, capLabel);
  };

  return (
    <>
      <div className="mb-4 space-x-4 flex justify-between items-center border border-border rounded-md p-4 bg-card shadow-sm">
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
      {userAttendanceLoading ? (
        <TableSkeleton />
      ) : (
        <div className="bg-card border border-border rounded-lg p-4 max-h-[calc(100vh-361px)] overflow-auto flex flex-col justify-between">
          <div className="relative overflow-auto border border-border rounded-sm">
            <Table>
              <TableHeader className="bg-accent sticky top-0 z-10 h-14">
                <TableRow>
                  <TableHead className="text-xs uppercase font-bold pl-8">
                    Date
                  </TableHead>
                  <TableHead className="text-xs uppercase font-bold">
                    Clock In
                  </TableHead>
                  <TableHead className="text-xs uppercase font-bold">
                    Clock Out
                  </TableHead>
                  <TableHead className="text-xs uppercase font-bold">
                    Duration
                  </TableHead>
                  <TableHead className="text-xs uppercase font-bold">
                    Status
                  </TableHead>
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
                      <TableRow>
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
                            <ChevronsUpDown className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>

                      {expandedRowId === i && (
                        <TableRow className="hover:bg-background">
                          <TableCell colSpan={6} className="p-0">
                            <div className="p-6">
                              {log.attendance_log?.length ? (
                                <div className="space-y-4">
                                  {log.attendance_log.map(
                                    (attendanceLog, idx) => (
                                      <div
                                        key={idx}
                                        className="p-4 rounded-lg border border-border"
                                      >
                                        <div className="flex gap-4">
                                          <div>
                                            <p className="text-[10px] font-black uppercase text-muted-foreground">
                                              Time
                                            </p>
                                            <p className="text-sm font-bold">
                                              {changeUTCtoLocalTime(
                                                attendanceLog.time,
                                              )}
                                            </p>
                                          </div>

                                          <Separator
                                            orientation="vertical"
                                            className="h-8!"
                                          />

                                          <div>
                                            <p className="text-[10px] font-black uppercase text-muted-foreground">
                                              Action
                                            </p>
                                            <p className="text-xs font-bold uppercase">
                                              {attendanceLog.type?.replace(
                                                /_/g,
                                                "-",
                                              )}
                                            </p>
                                          </div>

                                          <div className="ml-auto flex items-center gap-2">
                                            <div className="bg-muted p-2 rounded-md">
                                              <MapPin size={16} />
                                            </div>
                                            <p>
                                              {attendanceLog.location || "---"}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    ),
                                  )}
                                </div>
                              ) : (
                                <NoDataFound
                                  title="No attendance records"
                                  message="We couldn't find any attendance logs for the selected criteria."
                                />
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
        </div>
      )}
    </>
  );
}
