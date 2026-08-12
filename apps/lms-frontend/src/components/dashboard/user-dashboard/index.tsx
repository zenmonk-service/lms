"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { DashboardHeader } from "./components/dashboard-header";
import ListEvents from "./components/list-events";
import LeaveRequest from "./components/leave-request";
import { AttendanceAnalytics } from "./components/activity-analytics-history";
import { getUserAction } from "@/features/user/get-user/get-user.action";
import { listRolePermissionsAction } from "@/features/permissions/list-role-permissions/list-role-permissions.action";

interface IProps {
  organization_uuid: string;
  targetUserId?: string;
  targetUserName?: string;
  targetUserEmail?: string;
}

export function UserDashboard({
  organization_uuid,
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
    dispatch(getUserAction({ org_uuid: organization_uuid, user_uuid: analyticsUserId }));
    dispatch(listRolePermissionsAction({ org_uuid: organization_uuid, role_uuid: currentUser?.role?.uuid , isCurrentUserRolePermissions: true }));
  }, [dispatch, organization_uuid, analyticsUserId]);

  return (
    <div className="space-y-6">
      <DashboardHeader
        analyticsUserName={analyticsUserName}
        analyticsUserEmail={analyticsUserEmail}
        role={currentUser?.role.name}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <AttendanceAnalytics userUUID={analyticsUserId} />
        <ListEvents />
      </div>
      <LeaveRequest />
    </div>
  );
}

export default UserDashboard;
