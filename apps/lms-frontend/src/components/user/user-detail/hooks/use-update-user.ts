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
      const { role_uuid, ...restValues } = values;
      const shouldSendRole =
        isRoleDirty ?? role_uuid !== selectedUser.role?.uuid;

      const result = await dispatch(
        updateUserAction({
          user_uuid: selectedUser.user_id,
          org_uuid: organizationUuid,
          ...restValues,
          ...(shouldSendRole ? { role_uuid } : {}),
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
