"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { listOrganizationShiftsAction } from "@/features/shift/shift.action";
import { getOrganizationRolesAction } from "@/features/role/list-organization-roles/list-organization-roles.action";
import { getOrganizationUserAction } from "@/features/user/get-organization-user/get-organization-user.action";

export function useUserDetailData(organizationUuid: string, userUuid: string) {
  const dispatch = useAppDispatch();

  const roles = useAppSelector((state) => state.rolesSlice.roles);
  const shifts = useAppSelector((state) => state.shiftSlice.shifts);
  const { currentUser, selectedUser } = useAppSelector((state) => state.userSlice);
  const { currentUserRolePermissions } = useAppSelector((state) => state.permissionSlice);

  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    if (!organizationUuid) return;
    dispatch(getOrganizationRolesAction({ org_uuid: organizationUuid }));
    dispatch(listOrganizationShiftsAction({ org_uuid: organizationUuid }));
  }, [organizationUuid, dispatch]);

  useEffect(() => {
    if (!userUuid || !organizationUuid) return;
    setIsLoadingUser(true);
    dispatch(getOrganizationUserAction({ user_uuid: userUuid, org_uuid: organizationUuid })).finally(() => {
      setIsLoadingUser(false);
    });
  }, [userUuid, organizationUuid, dispatch]);

  return { roles, shifts, currentUser, selectedUser, currentUserRolePermissions, isLoadingUser };
}