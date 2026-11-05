"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useAppDispatch } from "@/store";
import { setCurrentUser, UserInterface } from "@/features/user/user.slice";
import { updateUserAction } from "@/features/user/update-user/update-user.action";
import { getOrganizationUserAction } from "@/features/user/get-organization-user/get-organization-user.action";
import type { EditUserFormData } from "../user.types";
import { listRolePermissionsAction } from "@/features/permissions/list-role-permissions/list-role-permissions.action";

interface IProps {
  organizationUuid: string;
  userUuid: string;
  selectedUser: UserInterface | null;
  currentUser: UserInterface;
  isRoleDirty?: boolean;
  onSaved: () => void;
}

export function useUpdateUser({
  organizationUuid,
  userUuid,
  selectedUser,
  currentUser,
  isRoleDirty,
  onSaved,
}: IProps) {
  const dispatch = useAppDispatch();
  const { update } = useSession();
  const [isSaving, setIsSaving] = useState(false);

  const onSubmit = async (values: EditUserFormData) => {
    if (!selectedUser) return;
    setIsSaving(true);

    try {
      const { role_uuid, managers, team_uuids, ...restValues } = values;
      const shouldSendRole =
        isRoleDirty ?? role_uuid !== selectedUser.role?.uuid;

      // Hierarchy fields are sent only when changed, so saving other fields
      // never re-validates (or rewrites) the reporting line and memberships.
      const sortedIds = (ids: string[]) => [...ids].sort().join(",");
      const nextManagers = (managers ?? []).map((manager) => manager.user_id);
      const managersChanged =
        sortedIds(nextManagers) !==
        sortedIds(
          (selectedUser.managers ?? [])
            .filter((manager) => !manager.team)
            .map((manager) => manager.user_id),
        );
      const nextTeams = team_uuids ?? [];
      const teamsChanged =
        sortedIds(nextTeams) !==
        sortedIds(selectedUser.teams?.map((team) => team.uuid) ?? []);

      const result = await dispatch(
        updateUserAction({
          user_uuid: selectedUser.user_id,
          org_uuid: organizationUuid,
          ...restValues,
          ...(shouldSendRole ? { role_uuid } : {}),
          ...(managersChanged ? { manager_uuids: nextManagers } : {}),
          ...(teamsChanged ? { team_uuids: nextTeams } : {}),
        }),
      );

      if (!updateUserAction.fulfilled.match(result)) return;

      await dispatch(
        getOrganizationUserAction({
          org_uuid: organizationUuid,
          user_uuid: userUuid,
          is_me: userUuid===currentUser?.user_id ? "true" : "false",
        }),
      );
      if (currentUser?.user_id === selectedUser.user_id) {
        dispatch(
          listRolePermissionsAction({
            org_uuid: organizationUuid,
            role_uuid: currentUser.role.uuid!,
            isCurrentUserRolePermissions: true,
            is_me: "true",
          }),
        );
        dispatch(setCurrentUser({ ...currentUser, name: values.name }));
        await update({ name: values.name });
      }

      onSaved();
    } finally {
      setIsSaving(false);
    }
  };

  return { onSubmit, isSaving };
}
