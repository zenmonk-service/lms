"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppDispatch } from "@/store";
import { AttendanceStatus } from "@/features/attendances/attendances.type";
import { getUserAttendancesAction } from "@/features/attendances/get-user-attendances/get-user-attendances.action";
import { listUserLeaveRequestsAction } from "@/features/leave/list-user-leave-requests/list-user-leave-requests.action";
import { LeaveRequestStatus } from "@/features/leave/leave.types";
import { ATTENDANCE_COLORS, LEAVE_STATUS_COLORS } from "../dashboard.constants";
import {
  AttendanceChartDatum,
  AttendanceRow,
  AttendanceSummary,
  LeaveChartDatum,
  LeaveRow,
  LeaveStatusSummary,
} from "../dashboard.types";

interface IProps {
  organizationUuid: string;
  userId?: string;
  selectedMonth: number;
  selectedYear: number;
}

export function useDashboardAnalytics({
  organizationUuid,
  userId,
  selectedMonth,
  selectedYear,
}: IProps) {
  const dispatch = useAppDispatch();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [attendanceRows, setAttendanceRows] = useState<AttendanceRow[]>([]);
  const [leaveRows, setLeaveRows] = useState<LeaveRow[]>([]);

  const monthStart = useMemo(
    () => new Date(selectedYear, selectedMonth, 1),
    [selectedMonth, selectedYear],
  );

  const monthEnd = useMemo(
    () => new Date(selectedYear, selectedMonth + 1, 0),
    [selectedMonth, selectedYear],
  );

  const dateRange = useMemo(
    () => ({
      start_date: monthStart.toISOString().slice(0, 10),
      end_date: monthEnd.toISOString().slice(0, 10),
    }),
    [monthStart, monthEnd],
  );

  const monthLabel = useMemo(
    () =>
      monthStart.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
    [monthStart],
  );

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!userId || !organizationUuid) return;

      setIsLoading(true);
      try {
        const [attendanceResponse, leaveResponse] = await Promise.all([
          dispatch(
            getUserAttendancesAction({
              org_uuid: organizationUuid,
              user_uuid: userId,
              page: 1,
              limit: 366,
              date_range: dateRange,
            }),
          ).unwrap(),
          dispatch(
            listUserLeaveRequestsAction({
              org_uuid: organizationUuid,
              user_uuid: userId,
              params: {
                page: 1,
                limit: 200,
              },
            }),
          ).unwrap(),
        ]);

        setAttendanceRows(
          Array.isArray(attendanceResponse?.rows) ? attendanceResponse.rows : [],
        );
        setLeaveRows(
          Array.isArray(leaveResponse?.rows) ? leaveResponse.rows : [],
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [dispatch, organizationUuid, userId, dateRange]);

  const attendanceSummary: AttendanceSummary = useMemo(() => {
    return attendanceRows.reduce(
      (acc, row) => {
        const status = String(row.status || "").toLowerCase();
        if (status === AttendanceStatus.PRESENT) acc.present += 1;
        else if (status === AttendanceStatus.ABSENT) acc.absent += 1;
        else if (status === AttendanceStatus.ON_LEAVE) acc.on_leave += 1;
        return acc;
      },
      { present: 0, absent: 0, on_leave: 0 },
    );
  }, [attendanceRows]);

  const monthlyLeaveRequests = useMemo(() => {
    const from = monthStart.getTime();
    const to = monthEnd.getTime();

    return leaveRows.filter((leave) => {
      const sourceDate = leave.created_at || leave.start_date || leave.end_date;
      if (!sourceDate) return false;
      const parsed = new Date(sourceDate).getTime();
      return parsed >= from && parsed <= to;
    });
  }, [leaveRows, monthStart, monthEnd]);

  const leaveStatusSummary: LeaveStatusSummary = useMemo(() => {
    return monthlyLeaveRequests.reduce(
      (acc, row) => {
        const status = String(row.status || "");
        if (status === LeaveRequestStatus.APPROVED) acc.approved += 1;
        else if (status === LeaveRequestStatus.REJECTED) acc.rejected += 1;
        else if (status === LeaveRequestStatus.PENDING) acc.pending += 1;
        else if (status === LeaveRequestStatus.RECOMMENDED) acc.recommended += 1;
        else if (status === LeaveRequestStatus.CANCELLED) acc.cancelled += 1;
        return acc;
      },
      { approved: 0, rejected: 0, pending: 0, recommended: 0, cancelled: 0 },
    );
  }, [monthlyLeaveRequests]);

  const attendanceChartData: AttendanceChartDatum[] = useMemo(
    () => [
      {
        name: "Present",
        value: attendanceSummary.present,
        color: ATTENDANCE_COLORS.present,
        fill: ATTENDANCE_COLORS.present,
      },
      {
        name: "Absent",
        value: attendanceSummary.absent,
        color: ATTENDANCE_COLORS.absent,
        fill: ATTENDANCE_COLORS.absent,
      },
      {
        name: "On Leave",
        value: attendanceSummary.on_leave,
        color: ATTENDANCE_COLORS.on_leave,
        fill: ATTENDANCE_COLORS.on_leave,
      },
    ],
    [attendanceSummary],
  );

  const leaveChartData: LeaveChartDatum[] = useMemo(
    () => [
      { status: "Pending", total: leaveStatusSummary.pending, fill: LEAVE_STATUS_COLORS.pending },
      { status: "Approved", total: leaveStatusSummary.approved, fill: LEAVE_STATUS_COLORS.approved },
      { status: "Recommended", total: leaveStatusSummary.recommended, fill: LEAVE_STATUS_COLORS.recommended },
      { status: "Rejected", total: leaveStatusSummary.rejected, fill: LEAVE_STATUS_COLORS.rejected },
      { status: "Cancelled", total: leaveStatusSummary.cancelled, fill: LEAVE_STATUS_COLORS.cancelled },
    ],
    [leaveStatusSummary],
  );

  const totalAttendanceDays =
    attendanceSummary.present + attendanceSummary.absent + attendanceSummary.on_leave;

  return {
    isLoading,
    monthLabel,
    attendanceSummary,
    monthlyLeaveRequests,
    attendanceChartData,
    leaveChartData,
    totalAttendanceDays,
  };
}