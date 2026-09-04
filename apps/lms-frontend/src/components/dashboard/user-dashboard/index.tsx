"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { DashboardHeader } from "./components/dashboard-header";
import ListEvents from "./components/list-events";
import LeaveRequest from "./components/leave-request";
import { AttendanceAnalytics } from "./components/activity-analytics-history";
import { getUserAction } from "@/features/user/get-user/get-user.action";
import { useSession } from "next-auth/react";
import { setCurrentUser, UserInterface } from "@/features/user/user.slice";
import { listRolePermissionsAction } from "@/features/permissions/list-role-permissions/list-role-permissions.action";

interface IProps {
  organization_uuid: string;
  _permission_refresh?: string;
}

export function UserDashboard({
  organization_uuid,
  _permission_refresh,
}: IProps) {
  const dispatch = useAppDispatch();
  const { update } = useSession();
  const currentUser = useAppSelector((state) => state.userSlice.currentUser);

  function toSessionPayload(user: UserInterface, org_uuid: string) {
    const { role } = user;
    return {
      org_uuid,
      name: user.name,
      email: user.email,
      image: user.image || null,
      role: {
        id: role.id,
        uuid: role.uuid,
        name: role.name,
        description: role.description
      },
    };
  }

  useEffect(() => {
    dispatch(getUserAction({ org_uuid: organization_uuid, user_uuid: currentUser?.user_id }))
      .unwrap()
      .then((user) => {
        dispatch(setCurrentUser(user));
        update(toSessionPayload(user, organization_uuid));
      })
      .catch(() => {});
  }, [dispatch, organization_uuid]);

  useEffect(() => {
    if(currentUser?.role?.uuid) {
      dispatch(
        listRolePermissionsAction({
          org_uuid: organization_uuid,
          role_uuid: currentUser.role.uuid,
          isCurrentUserRolePermissions: true,
        }),
      );
    }
  }, [dispatch, organization_uuid, _permission_refresh, currentUser?.role?.uuid]);

  return (
    <div className="space-y-6">
      <DashboardHeader />

      <div className="grid gap-4 grid-cols-1 xl:grid-cols-2">
        <AttendanceAnalytics userUUID={currentUser?.user_id} />
        <ListEvents />
      </div>
      <LeaveRequest />
    </div>
  );
}

export default UserDashboard;
