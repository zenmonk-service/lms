"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useAppDispatch } from "@/store";
import { setCurrentUser, UserInterface } from "@/features/user/user.slice";
import { updateUserAction } from "@/features/user/update-user/update-user.action";
import { getOrganizationUserAction } from "@/features/user/get-organization-user/get-organization-user.action";
import type { EditUserFormData } from "../user.types";

interface IProps {
  organizationUuid: string;
  userUuid: string;
  selectedUser: UserInterface | null;
  currentUser: UserInterface;
  onSaved: () => void;
}

export function useUpdateUser({
  organizationUuid,
  userUuid,
  selectedUser,
  currentUser,
  onSaved,
}: IProps) {
  const dispatch = useAppDispatch();
  const { update } = useSession();
  const [isSaving, setIsSaving] = useState(false);

  const onSubmit = async (values: EditUserFormData) => {
  console.log("values ==> ", values);
    if (!selectedUser) return;
    setIsSaving(true);

    try {
      const result = await dispatch(
        updateUserAction({
          user_uuid: selectedUser.user_id,
          org_uuid: organizationUuid,
          ...values,
        }),
      );

      if (!updateUserAction.fulfilled.match(result)) return;

      await dispatch(
        getOrganizationUserAction({
          org_uuid: organizationUuid,
          user_uuid: userUuid,
        }),
      );

      if (currentUser?.user_id === selectedUser.user_id) {
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
