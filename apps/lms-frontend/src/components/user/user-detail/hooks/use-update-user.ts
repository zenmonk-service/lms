"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useAppDispatch } from "@/store";
import { setCurrentUser } from "@/features/user/user.slice";
import { updateUserAction } from "@/features/user/update-user/update-user.action";
import { getOrganizationUserAction } from "@/features/user/get-organization-user/get-organization-user.action";
import type { EditUserFormData } from "../user.types";

export function useUpdateUser({
  organizationUuid,
  userUuid,
  selectedUser,
  currentUser,
  onSaved,
}: {
  organizationUuid: string;
  userUuid: string;
  selectedUser: any;
  currentUser: any;
  onSaved: () => void;
}) {
  const dispatch = useAppDispatch();
  const { update } = useSession();
  const [isSaving, setIsSaving] = useState(false);

  const onSubmit = async (values: EditUserFormData) => {
    if (!selectedUser) return;
    setIsSaving(true);

    try {
      const result = await dispatch(
        updateUserAction({
          user_uuid: selectedUser.user_id,
          org_uuid: organizationUuid,
          name: values.name,
          role: values.role,
          shift_uuid: values.shift,
          marital_status: values.marital_status || null,
          employment_type: values.employment_type || null,
          work_mode: values.work_mode || null,
          work_branch: values.work_branch?.trim() || null,
          official_phone: values.official_phone?.trim() || null,
          emergency_contact_name: values.emergency_contact_name?.trim() || null,
          emergency_contact_relation: values.emergency_contact_relation?.trim() || null,
          emergency_contact_phone: values.emergency_contact_phone?.trim() || null,
          guardian_contact_name: values.guardian_contact_name?.trim() || null,
          guardian_contact_relation: values.guardian_contact_relation?.trim() || null,
          guardian_contact_phone: values.guardian_contact_phone?.trim() || null,
        }),
      );

      if (!updateUserAction.fulfilled.match(result)) return;

      await dispatch(getOrganizationUserAction({ org_uuid: organizationUuid, user_uuid: userUuid }));

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