"use client";
import React, { useState } from "react";
import LeaveCharts from "./chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LeaveRequestFilters from "@/components/leave/approve-leave-request/components/filter-panel";
import LeaveRequests from "@/components/leave/approve-leave-request/components/leave-requests";
import UserLeaveRequestDetails from "@/components/leave/approve-leave-request/components/leave-requests/components/user-leave-request-details";
import { ATTENDANCE_COLORS } from "../../user-dashboard/dashboard.constants";
import UserLeaveBalance from "./leave-type-table";

export default function AdminLeaveDashboard() {
  const [viewMode, setViewMode] = useState<"Leave Report" | "Leave Requests">(
    "Leave Requests",
  );
  const data = [
    {
      color: ATTENDANCE_COLORS.present,
      name: "Approved",
      value: 5,
    },
    {
      color: ATTENDANCE_COLORS.absent,
      name: "Rejected",
      value: 2,
    },
    {
      color: ATTENDANCE_COLORS.late,
      name: "Pending",
      value: 5,
    },
  ];

  return (
    <>
      <LeaveCharts data={data} loading={false} />
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
    </>
  );
}
