"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { loginOrganizationAction } from "@/features/organizations/login-organization/login-organization.action";
import { DashboardHeader } from "./components/dashboard-header";
import { DashboardStatsGrid } from "./components/dashboard-stats-grid";
import { LiveClock } from "./components/live-clock";
import ListEvents from "./components/list-events";
import LeaveRequest from "./components/leave-request";
import { AttendanceAnalytics } from "./components/activity-analytics-history";

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

  useEffect(() => {
    dispatch(loginOrganizationAction({ org_uuid: organization_uuid, email }));
  }, [dispatch, organization_uuid, email]);

  return (
    <div className="space-y-6">
      <DashboardHeader
        analyticsUserName={analyticsUserName}
        analyticsUserEmail={analyticsUserEmail}
        role={currentUser?.role.name}
      />

      {/* <div className="flex gap-4">
        <DashboardStatsGrid  />
        <LiveClock />
      </div> */}

      <div className="grid gap-4 xl:grid-cols-2">
        <AttendanceAnalytics userUUID={analyticsUserId} />
        <ListEvents />
      </div>
      <LeaveRequest />
    </div>
  );
}

export default UserDashboard;
