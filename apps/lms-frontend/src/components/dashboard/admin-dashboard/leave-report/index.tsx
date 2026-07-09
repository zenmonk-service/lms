"use client";
import React, { useEffect, useState } from "react";
import LeaveCharts from "./chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LeaveRequestFilters from "@/components/leave/approve-leave-request/components/filter-panel";
import LeaveRequests from "@/components/leave/approve-leave-request/components/leave-requests";
import UserLeaveRequestDetails from "@/components/leave/approve-leave-request/components/leave-requests/components/user-leave-request-details";
import { ATTENDANCE_COLORS } from "../../user-dashboard/dashboard.constants";
import UserLeaveBalance from "./leave-type-table";
import { useAppDispatch, useAppSelector } from "@/store";
import { getLeaveRequestsReportAction } from "@/features/leave/leave-request-report/leave-request-report.action";
import AdminDashboardLayout from "../layout";

export default function AdminLeaveDashboard() {
  const dispatch = useAppDispatch();
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const orgUuid = useAppSelector(
    (state) => state.organizationsSlice.currentOrganization?.uuid,
  );
  const { leaveRequestsReport, leaveRequestsReportLoading } = useAppSelector(
    (state) => state.leaveSlice,
  );
  const [viewMode, setViewMode] = useState<"Leave Report" | "Leave Requests">(
    "Leave Requests",
  );

  useEffect(() => {
    dispatch(
      getLeaveRequestsReportAction({ org_uuid: orgUuid, params: { month } }),
    );
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
          <TabsTrigger value="Leave Requests">Leave Requests</TabsTrigger>
          <TabsTrigger value="Leave Report">Leave Type Report</TabsTrigger>
        </TabsList>
        <TabsContent value="Leave Report">
          <UserLeaveBalance />
        </TabsContent>

        <TabsContent value="Leave Requests">
          <div className="flex h-[calc(100vh-177px)] bg-card rounded-lg border border-border overflow-scroll">
            <div className="w-80 border-r border-border">
              <LeaveRequestFilters />
            </div>
            <div className="w-96 border-r border-border">
              <LeaveRequests isAdmin={true} />
            </div>
            <div className="flex-1">
              <UserLeaveRequestDetails />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </AdminDashboardLayout>
  );
}
