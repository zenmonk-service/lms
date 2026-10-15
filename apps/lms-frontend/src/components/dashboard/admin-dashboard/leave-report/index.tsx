"use client";

import React, { useCallback, useEffect, useState } from "react";
import LeaveCharts from "./chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ATTENDANCE_COLORS } from "../../user-dashboard/dashboard.constants";
import UserLeaveBalance from "./leave-type-table";
import { useAppDispatch, useAppSelector } from "@/store";
import { getLeaveRequestsReportAction } from "@/features/leave/leave-request-report/leave-request-report.action";
import AdminDashboardLayout from "../layout";
import ApproveLeaveRequest from "@/components/leave/approve-leave-request";
import { usePermissionCheck } from "@/hooks/use-permission-check";
import {
  PermissionAction,
  PermissionTag,
} from "@/features/permissions/permission.type";
import { Period } from "@/lib/period";

type ViewMode = "Leave Report" | "Leave Requests";

export default function AdminLeaveDashboard() {
  const dispatch = useAppDispatch();
  const can = usePermissionCheck();

  const [month, setMonth] = useState(Period.getCurrentPeriod());
  const [viewMode, setViewMode] = useState<ViewMode>("Leave Requests");

  const orgUuid = useAppSelector(
    (state) => state.organizationsSlice.currentOrganization?.uuid,
  );

  const { leaveRequestsReport, leaveRequestsReportLoading } = useAppSelector(
    (state) => state.leaveSlice,
  );

  const canReadLeaveRequests = can(
    PermissionTag.LEAVE_REQUEST_MANAGEMENT,
    PermissionAction.READ,
  );

  const canReadLeaveReport = can(
    PermissionTag.LEAVE_REPORT_MANAGEMENT,
    PermissionAction.READ,
  );

  const canReadLeaveTypes = can(
    PermissionTag.LEAVE_TYPE_MANAGEMENT,
    PermissionAction.READ,
  );

  const canViewLeaveRequests = canReadLeaveRequests;
  const canViewLeaveReport = canReadLeaveTypes;

  const refreshLeaveRequestsReport = useCallback(() => {
    if (!orgUuid || !month) return;

    if (!canReadLeaveRequests && !canReadLeaveReport) return;

    dispatch(
      getLeaveRequestsReportAction({
        org_uuid: orgUuid,
        params: { month },
      }),
    );
  }, [
    dispatch,
    orgUuid,
    month,
    canReadLeaveRequests,
    canReadLeaveReport,
  ]);

  useEffect(() => {
    refreshLeaveRequestsReport();
  }, [refreshLeaveRequestsReport]);

  // Keep the selected tab valid when permissions change.
  useEffect(() => {
    if (viewMode === "Leave Requests" && !canViewLeaveRequests) {
      setViewMode(canViewLeaveReport ? "Leave Report" : "Leave Requests");
      return;
    }

    if (viewMode === "Leave Report" && !canViewLeaveReport) {
      setViewMode(canViewLeaveRequests ? "Leave Requests" : "Leave Report");
    }
  }, [viewMode, canViewLeaveRequests, canViewLeaveReport]);

  const statusConfig = {
    Pending: ATTENDANCE_COLORS.late,
    Approved: ATTENDANCE_COLORS.present,
    Rejected: ATTENDANCE_COLORS.absent,
    Recommended: ATTENDANCE_COLORS.on_leave,
    Cancelled: ATTENDANCE_COLORS.half_day,
  };

  const finalLeaveRequestsReport = Object.entries(statusConfig).map(
    ([status, color]) => {
      const report = leaveRequestsReport?.find(
        (item) => item.status.toLowerCase() === status.toLowerCase(),
      );

      return {
        status,
        color,
        value: Number(report?.count ?? 0),
      };
    },
  );

  return (
    <AdminDashboardLayout>
      <LeaveCharts
        data={finalLeaveRequestsReport}
        loading={leaveRequestsReportLoading}
        setMonth={setMonth}
        month={month}
      />

      <Tabs
        value={viewMode}
        onValueChange={(value) => setViewMode(value as ViewMode)}
      >
        <TabsList>
          {canViewLeaveRequests && (
            <TabsTrigger value="Leave Requests">
              Leave Requests
            </TabsTrigger>
          )}

          {canViewLeaveReport && (
            <TabsTrigger value="Leave Report">
              Leave Type Report
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="Leave Report">
          {canViewLeaveReport && <UserLeaveBalance />}
        </TabsContent>

        <TabsContent value="Leave Requests">
          {canViewLeaveRequests && (
            <ApproveLeaveRequest
              refreshLeaveRequestsReport={refreshLeaveRequestsReport}
              isAdmin={true}
              showTitle={false}
              className="p-0! max-h-[calc(100vh-177px)]"
            />
          )}
        </TabsContent>
      </Tabs>
    </AdminDashboardLayout>
  );
}