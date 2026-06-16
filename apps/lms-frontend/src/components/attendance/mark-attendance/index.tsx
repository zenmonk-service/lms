"use client";

import { useState, useCallback } from "react";
import { useAppSelector } from "@/store";
import { hasPermissions } from "@/lib/haspermissios";
import NoPermission from "@/shared/no-permission";
import AttendanceTable from "@/components/attendance/shared/components/table";
import { MonthlyStats } from "./components/monthly-stats";
import { useAttendanceFetch } from "./hooks/use-attendance-fetch";
import { AttendanceButton } from "./components/attendance-button";
import { LiveClock } from "./components/live-clock";

const MyAttendance = () => {
  const { currentUser } = useAppSelector((s) => s.userSlice);
  const { currentUserRolePermissions } = useAppSelector((s) => s.permissionSlice);
  const { attendances: userAttendance, loading: userAttendanceLoading } = useAppSelector((s) => s.attendancesSlice);

  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState<{ start_date?: string; end_date?: string; }>({});

  const itemsPerPage = 10;

  useAttendanceFetch({ dateRange, currentPage, itemsPerPage });

  const handlePageChange = useCallback(
    (page: number) => setCurrentPage(page),
    [],
  );
  const totalPages = Math.ceil((userAttendance?.total || 0) / itemsPerPage);

  const canRead = hasPermissions(
    "user_attendance_management",
    "read",
    currentUserRolePermissions,
    currentUser.email,
  );

  if (!canRead) {
    return (
      <div className="flex h-[calc(100vh-49px)] max-h-[calc(100vh-49px)] overflow-hidden font-sans">
        <main className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 flex p-6 w-full">
            <NoPermission moduleName="Attendance" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="w-11/12 min-[1400px]:w-3/4 p-6">
        <div className="flex flex-col xl:flex-row gap-6 mb-6">
            <LiveClock />

          <MonthlyStats
            totalPresent={userAttendance.total_present_current_month}
            totalAbsent={userAttendance.total_absent_current_month}
          />
        </div>
        <AttendanceTable
          setDateRange={setDateRange}
          userAttendance={userAttendance}
          userAttendanceLoading={userAttendanceLoading}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalPages={totalPages}
          handlePageChange={handlePageChange}
          expandedRowId={expandedRowId}
          setExpandedRowId={setExpandedRowId}
          noDataMessage="We couldn't find any attendance logs for the selected criteria. Try adjusting your date range."
        />
      </div>
    </div>
  );
};

export default MyAttendance;
