"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { loginOrganizationAction } from "@/features/organizations/login-organization/login-organization.action";
import { DashboardHeader } from "./components/dashboard-header";
import { DashboardStatsGrid } from "./components/dashboard-stats-grid";
import { AttendanceSplitCard } from "./components/attendance-split-card";
import { LeaveStatusCard } from "./components/leave-status-card";
import { MonthSnapshotCard } from "./components/month-snapshot-card";
import { useDashboardAnalytics } from "./hook/use-dashboard-analytics";
import { DashboardSkeleton } from "./components/skeleton";

interface IProps {
  organization_uuid: string;
  email: string;
  targetUserId?: string;
  targetUserName?: string;
  targetUserEmail?: string;
}

export function UserDashboard({
  organization_uuid,
  email,
  targetUserId,
  targetUserName,
  targetUserEmail,
}: IProps) {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const currentUser = useAppSelector((state) => state.userSlice.currentUser);

  const selectedUserId = searchParams.get("user_uuid");
  const selectedUserName = searchParams.get("user_name");
  const selectedUserEmail = searchParams.get("user_email");

  const analyticsUserId = targetUserId || selectedUserId || currentUser.user_id;
  const analyticsUserName = targetUserName || selectedUserName || currentUser?.name;
  const analyticsUserEmail = targetUserEmail || selectedUserEmail || currentUser?.email;

  const today = useMemo(() => new Date(), []);

  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());

  const years = useMemo(() => {
    const currentYear = today.getFullYear();
    return Array.from({ length: 6 }, (_, index) => currentYear - 3 + index);
  }, [today]);

  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => ({
        value: index,
        label: new Date(2000, index, 1).toLocaleString("en-US", {
          month: "long",
        }),
      })),
    [],
  );

  useEffect(() => {
    dispatch(loginOrganizationAction({ org_uuid: organization_uuid, email }));
  }, [dispatch, organization_uuid, email]);

  const {
    isLoading,
    monthLabel,
    attendanceSummary,
    monthlyLeaveRequests,
    attendanceChartData,
    leaveChartData,
    totalAttendanceDays,
  } = useDashboardAnalytics({
    organizationUuid: organization_uuid,
    userId: analyticsUserId,
    selectedMonth,
    selectedYear,
  });

  if (!analyticsUserId && isLoading) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        analyticsUserName={analyticsUserName}
        analyticsUserEmail={analyticsUserEmail}
        monthLabel={monthLabel}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        months={months}
        years={years}
        onMonthChange={setSelectedMonth}
        onYearChange={setSelectedYear}
        role={currentUser?.role.name}
      />

      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <DashboardStatsGrid
            attendanceSummary={attendanceSummary}
            leaveRequestsCount={monthlyLeaveRequests.length}
          />

          <div className="grid gap-4 xl:grid-cols-2">
            <AttendanceSplitCard
              monthLabel={monthLabel}
              chartData={attendanceChartData}
              totalDays={totalAttendanceDays}
            />
            <LeaveStatusCard
              monthLabel={monthLabel}
              chartData={leaveChartData}
            />
          </div>

          <MonthSnapshotCard
            totalAttendanceDays={totalAttendanceDays}
            leaveRequests={monthlyLeaveRequests}
          />
        </>
      )}
    </div>
  );
}

export default UserDashboard;
