"use client";
import React, { useEffect, useState } from "react";
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

export default function AdminLeaveDashboard() {
  const dispatch = useAppDispatch();
  const can = usePermissionCheck();
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const orgUuid = useAppSelector(
    (state) => state.organizationsSlice.currentOrganization?.uuid,
  );
  const { leaveRequestsReport, leaveRequestsReportLoading } = useAppSelector(
    (state) => state.leaveSlice,
  );
  const [viewMode, setViewMode] = useState<"Leave Report" | "Leave Requests">(
    can(PermissionTag.LEAVE_REQUEST_MANAGEMENT, PermissionAction.READ)
      ? "Leave Requests"
      : "Leave Report",
  );

  useEffect(() => {
    if( can(PermissionTag.LEAVE_REQUEST_MANAGEMENT, PermissionAction.READ) || can(PermissionTag.LEAVE_REPORT_MANAGEMENT, PermissionAction.READ)) {
      dispatch(
        getLeaveRequestsReportAction({ org_uuid: orgUuid, params: { month } }),
      );
    }
  }, [month]);

  const statusConfig = {
    Pending: ATTENDANCE_COLORS.late,
    Approved: ATTENDANCE_COLORS.present,
    Rejected: ATTENDANCE_COLORS.absent,
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
        onValueChange={(value) =>
          setViewMode(value as "Leave Report" | "Leave Requests")
        }
      >
        <TabsList>
          {can(
            PermissionTag.LEAVE_REQUEST_MANAGEMENT,
            PermissionAction.READ,
          ) && <TabsTrigger value="Leave Requests">Leave Requests</TabsTrigger>}
          {can(
            PermissionTag.LEAVE_REPORT_MANAGEMENT,
            PermissionAction.READ,
          ) && (
            <TabsTrigger value="Leave Report">Leave Type Report</TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="Leave Report">
          {can(
            PermissionTag.LEAVE_REPORT_MANAGEMENT,
            PermissionAction.READ,
          ) &&  <UserLeaveBalance />}
        </TabsContent>

        <TabsContent value="Leave Requests">
          {can(
            PermissionTag.LEAVE_REQUEST_MANAGEMENT,
            PermissionAction.READ,
          ) && (
            <ApproveLeaveRequest
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
